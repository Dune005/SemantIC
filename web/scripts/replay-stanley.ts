import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildAnalysisViewModel } from '../app/composables/useAnalysisView'
import type { SemanticAnalysisResult } from '../../src/analyze'

const path = process.argv[2]
if (!path) {
  console.error('Usage: tsx replay-stanley.ts <pfad-zur-json>')
  process.exit(1)
}

const raw: SemanticAnalysisResult = JSON.parse(readFileSync(resolve(path), 'utf-8'))
const view = buildAnalysisViewModel(raw)

console.log('## Verdict')
console.log(`- Status: **${view.overallVerdict.status}**`)
console.log(`- Headline: ${view.overallVerdict.headline}`)
console.log(`- Recommendation: ${view.overallVerdict.recommendation}`)
console.log(`- Dominant-Cluster: ${view.overallVerdict.dominantCluster ?? '–'}`)
console.log(`- Reading-Mode: ${view.readingMode.code} (${view.readingMode.label})`)
console.log(`- Kontext-Warning: ${view.hasContextWarning}`)

console.log('\n## Dimensions')
console.log(`- physics: ${view.dimensions.physics.status} (${view.dimensions.physics.score})`)
console.log(`- semantics: ${view.dimensions.semantics.status} (${view.dimensions.semantics.score})`)
console.log(`- bias: ${view.dimensions.bias.status} (${view.dimensions.bias.score})`)

console.log(`\n## Sichtbare Hints (${view.userHints.length})`)
for (const [i, h] of view.userHints.entries()) {
  console.log(`${i + 1}. **${h.topic}** sev=${h.severity} support=${h.supportLevel} groups=[${h.signalGroups.join(', ')}]`)
  console.log(`   Text: ${h.text}`)
  console.log(`   Signals: ${h.signals.join(' | ')}`)
}

console.log(`\n## Hidden Hints (${view.hiddenHints.length})`)
for (const h of view.hiddenHints) {
  console.log(`- \`${h.topic}\` sev=${h.severity} support=${h.supportLevel} groups=[${h.signalGroups.join(', ')}]`)
}
