import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import fs from 'fs'
import path from 'path'
import { runSemanticAnalysis, type SemanticAnalysisOptions } from './analyze.js'
import { formatResult } from './format.js'

function getFlag(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag)
  return idx !== -1 ? args[idx + 1] : undefined
}

const args = process.argv.slice(2)
const imagePath = args[0]

if (!imagePath || imagePath.startsWith('--')) {
  console.error([
    'Usage: npm run spike -- <bildpfad> [--prompt "..."] [--context "..."] [--model "<provider:model>"] [--lang de|en] [--temperature 0.1] [--thinking-level medium] [--media-resolution high]',
    '',
    'Hinweis: --model steuert NUR den Analyse-Call. Der Aesthetik-Call laeuft fest gegen anthropic:claude-sonnet-4-6 (Default fuer stabilere Aesthetik-Scores).',
    '         --lang waehlt die Analyse-Prompt-Sprache. Default ist "en" (R4.1.2: Englischer Prompt liefert stabilere Detection mit Gemini). Output-Texte bleiben Deutsch.',
    '         --thinking-level und --media-resolution sind Gemini-spezifisch und greifen nur, wenn der Analyse-Call gegen Gemini laeuft.',
  ].join('\n'))
  process.exit(1)
}

const prompt = getFlag(args, '--prompt')
const context = getFlag(args, '--context')
const model = getFlag(args, '--model')
const temperatureRaw = getFlag(args, '--temperature')
const thinkingLevel = getFlag(args, '--thinking-level')
const mediaResolutionRaw = getFlag(args, '--media-resolution')
const langIdx = args.indexOf('--lang')
let lang: string | undefined
if (langIdx !== -1) {
  const langValue = args[langIdx + 1]
  if (!langValue || langValue.startsWith('--')) {
    console.error('--lang benötigt einen Wert ("de" oder "en").')
    process.exit(1)
  }
  if (langValue !== 'de' && langValue !== 'en') {
    console.error('--lang muss "de" oder "en" sein.')
    process.exit(1)
  }
  lang = langValue
}

const allowedThinkingLevels = ['minimal', 'low', 'medium', 'high'] as const
const mediaResolutionMap = {
  unspecified: 'MEDIA_RESOLUTION_UNSPECIFIED',
  low: 'MEDIA_RESOLUTION_LOW',
  medium: 'MEDIA_RESOLUTION_MEDIUM',
  high: 'MEDIA_RESOLUTION_HIGH',
} as const

let temperature: number | undefined
if (temperatureRaw !== undefined) {
  const parsedTemperature = Number(temperatureRaw)
  if (!Number.isFinite(parsedTemperature) || parsedTemperature < 0 || parsedTemperature > 2) {
    console.error('--temperature muss eine Zahl zwischen 0 und 2 sein.')
    process.exit(1)
  }
  temperature = parsedTemperature
}
if (thinkingLevel !== undefined && !allowedThinkingLevels.includes(thinkingLevel as any)) {
  console.error(`--thinking-level muss einer dieser Werte sein: ${allowedThinkingLevels.join(', ')}`)
  process.exit(1)
}
if (mediaResolutionRaw !== undefined && !(mediaResolutionRaw in mediaResolutionMap)) {
  console.error(`--media-resolution muss einer dieser Werte sein: ${Object.keys(mediaResolutionMap).join(', ')}`)
  process.exit(1)
}

const ext = path.extname(imagePath).toLowerCase()
const mediaTypeMap: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

const imageBuffer = fs.readFileSync(imagePath)

// AVIF-Dateien mit falscher Endung erkennen (Magic Bytes: ftypavif)
const isAvif = imageBuffer.length > 12 &&
  imageBuffer.toString('ascii', 4, 12) === 'ftypavif'
if (isAvif) {
  console.error(`Warnung: ${imagePath} ist ein AVIF-Bild (trotz ${ext}-Endung). Bitte nach JPEG/PNG konvertieren:\n  sips -s format jpeg "${imagePath}" --out "output.jpg"`)
  process.exit(1)
}

const mediaType = mediaTypeMap[ext] ?? 'image/jpeg'
const imageBase64 = imageBuffer.toString('base64')

const result = await runSemanticAnalysis(imageBase64, {
  prompt,
  context,
  mediaType,
  model,
  ...(temperature !== undefined ? { temperature } : {}),
  ...(thinkingLevel !== undefined ? { thinkingLevel: thinkingLevel as SemanticAnalysisOptions['thinkingLevel'] } : {}),
  ...(mediaResolutionRaw !== undefined ? { mediaResolution: mediaResolutionMap[mediaResolutionRaw as keyof typeof mediaResolutionMap] } : {}),
  ...(lang !== undefined ? { lang: lang as 'de' | 'en' } : {}),
})

fs.mkdirSync('spike-test/output', { recursive: true })
const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
const outPath = path.join('spike-test', 'output', `${timestamp}.json`)
fs.writeFileSync(outPath, JSON.stringify(result, null, 2))

console.log(formatResult(result))
console.log(`\nJSON gespeichert: ${outPath}`)
