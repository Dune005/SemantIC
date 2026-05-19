import { readFileSync, readdirSync } from 'node:fs'
import { resolve, basename } from 'node:path'
import { buildAnalysisViewModel } from '../app/composables/useAnalysisView'
import type { SemanticAnalysisResult } from '../../src/analyze'

const outputDir = resolve(import.meta.dirname, '../../spike-test/output')

const files = readdirSync(outputDir)
  .filter(f => f.startsWith('v4d_') && f.endsWith('.json'))
  .sort()

console.log('# V4d Replay durch neues View-Model\n')
console.log('| Bild | Verdict | Cluster | sichtbare Topics | hidden | Phase-1-body |')
console.log('|:---|:---|:---|:---|:---|:---|')

const phase1BodyTrue = new Set([
  'FL_CEO_01',
  'FL_CEO_04',
  'FL_nurse_01',
  'SD_CEO_03',
  'SD_nurse_04',
])

for (const file of files) {
  const path = resolve(outputDir, file)
  const raw: SemanticAnalysisResult = JSON.parse(readFileSync(path, 'utf-8'))
  const view = buildAnalysisViewModel(raw)
  const verdict = view.overallVerdict
  const visible = view.userHints.map(h => `${h.topic}/${h.severity[0]}/${h.supportLevel === 'cross_group' ? 'X' : 's'}`).join(', ') || '–'
  const hidden = view.hiddenHints.map(h => `${h.topic}/${h.severity[0]}/${h.supportLevel === 'cross_group' ? 'X' : 's'}`).join(', ') || '–'
  const key = basename(file, '.json').replace(/^v4d_/, '')
  const expectsBias = phase1BodyTrue.has(key) ? 'Y' : 'N'
  console.log(
    `| ${key} | **${verdict.status}** | ${verdict.dominantCluster ?? '–'} | ${visible} | ${hidden} | ${expectsBias} |`,
  )
}

console.log('\n## Detail pro Bild\n')

for (const file of files) {
  const path = resolve(outputDir, file)
  const raw: SemanticAnalysisResult = JSON.parse(readFileSync(path, 'utf-8'))
  const view = buildAnalysisViewModel(raw)
  const key = basename(file, '.json').replace(/^v4d_/, '')
  console.log(`### ${key}`)
  console.log(`- **Verdict:** ${view.overallVerdict.status} (${view.overallVerdict.headline})`)
  console.log(`- **Recommendation:** ${view.overallVerdict.recommendation}`)
  console.log(`- **Dimensions:** physics=${view.dimensions.physics.status} semantics=${view.dimensions.semantics.status} bias=${view.dimensions.bias.status}`)
  console.log(`- **Sichtbare Hints (${view.userHints.length}):**`)
  for (const h of view.userHints) {
    console.log(`  - \`${h.topic}\` sev=${h.severity} support=${h.supportLevel} groups=[${h.signalGroups.join(', ')}]`)
    console.log(`    Text: ${h.text}`)
    console.log(`    Signals: ${h.signals.join(' | ')}`)
  }
  if (view.hiddenHints.length > 0) {
    console.log(`- **Hidden Hints:**`)
    for (const h of view.hiddenHints) {
      console.log(`  - \`${h.topic}\` sev=${h.severity} support=${h.supportLevel}`)
    }
  }
  console.log()
}
