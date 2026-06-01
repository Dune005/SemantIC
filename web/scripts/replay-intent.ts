// Targeted Replay-Smoketest für die Intent-Achse (Empfehlungs-Kette, Zwischentest).
//
// Zweck (deterministisch, drift-frei): belegt #1 (Intent-Konzept) auf konkreten
// JSONs, ohne neuen LLM-Lauf. Im echten UI ist der Intent nach einem Lauf fix
// (declared_intent kommt aus dem Analyse-JSON, submittedUsageForm eingefroren) —
// ein nachträglicher Kachel-Wechsel ändert den Report NICHT. Dieser Beleg muss
// deshalb deterministisch über das View-Model geführt werden:
//
// Pro übergebenem JSON wird das Feld analysis.intent_assessment.declared_intent
// über die 4 Intents überschrieben und buildAnalysisViewModel je × 7 usage_forms
// gebaut. Geprüft:
//   1. recommendation-Text wechselt zwischen 'unspecified' und den drei
//      expliziten Intents (Intent rahmt die Empfehlung).
//   2. recommendationOverriddenByIntent = true für affirmative/critical/
//      illustrative, false für unspecified.
//   3. status + headline identisch über ALLE 4×7 Kombinationen desselben JSON
//      (Status-Isolation gegen Intent UND usage_form).
//   4. usageFormNote-Regeln: green → null; dominanter bias_representation-
//      Cluster → null.
//   5. AD-Marker ('professionelle Werbung' etc.) in KEINER Kombination.
//
// Aufruf (Repo-Root):
//   npx tsx web/scripts/replay-intent.ts spike-test/output/zt-stgallen.json [...]

import { readFileSync } from 'node:fs'
import { resolve, basename } from 'node:path'
import { buildAnalysisViewModel, type UsageForm, type DeclaredIntent } from '../app/composables/useAnalysisView'
import type { SemanticAnalysisResult } from '../../src/analyze'

const INTENTS: DeclaredIntent[] = ['unspecified', 'affirmative', 'critical', 'illustrative']
const USAGE_FORMS: UsageForm[] = ['header', 'mood', 'symbol', 'illustration', 'social', 'advertising', 'editorial']

// Signatur-Strings der entfernten RECOMMENDATION_TABLE_AD (dürfen in keiner
// Empfehlung mehr vorkommen).
const AD_MARKERS = [
  'professionelle Werbung',
  'Werbe-/Magazin-Kontext',
  'Werbe-/Magazin-Genre',
  'im Werbe-Genre',
  'Werbe-Kontext',
  'Werbe-Standards',
]
const hasAdMarker = (t: string) => AD_MARKERS.some(m => t.includes(m))

const files = process.argv.slice(2)
if (files.length === 0) {
  console.error('Aufruf: npx tsx web/scripts/replay-intent.ts <json1> [json2 ...]')
  process.exit(1)
}

function withIntent(raw: SemanticAnalysisResult, intent: DeclaredIntent): SemanticAnalysisResult {
  const clone: SemanticAnalysisResult = JSON.parse(JSON.stringify(raw))
  const ia = (clone.analysis as any).intent_assessment ?? {
    intent_alignment: 'not_assessable',
    framing_risk: 'low',
    reasoning: '',
  }
  ;(clone.analysis as any).intent_assessment = { ...ia, declared_intent: intent }
  return clone
}

let totalFiles = 0
let filesPass = 0
let statusIsolationViolations = 0
let overrideViolations = 0
let intentWordingStuck = 0      // unspecified-Empfehlung == eine explizite Empfehlung (gleiche usage_form)
let greenNoteViolations = 0
let biasNoteViolations = 0
let adMarkerViolations = 0

console.log('# Targeted Replay: Intent-Achse (Empfehlungs-Kette)\n')

for (const file of files) {
  let raw: SemanticAnalysisResult
  try {
    raw = JSON.parse(readFileSync(resolve(file), 'utf-8'))
  } catch (e) {
    console.log(`- ⚠️  ${basename(file)}: nicht lesbar/parsebar — übersprungen`)
    continue
  }
  if (!(raw as any)?.analysis?.dimension_analysis) {
    console.log(`- ⚠️  ${basename(file)}: kein vollständiges Result-JSON — übersprungen`)
    continue
  }
  totalFiles++

  // Referenz aus erster Kombination (unspecified × header).
  const ref = buildAnalysisViewModel(withIntent(raw, 'unspecified'), 'header').overallVerdict
  const refStatus = ref.status
  const refHeadline = ref.headline
  const cluster = ref.dominantCluster
  const mode = (raw as any)?.analysis?.research_layer?.reading_mode ?? '–'

  let fileStatusViol = 0
  let fileOverrideViol = 0
  let fileWordingStuck = 0
  let fileGreenViol = 0
  let fileBiasViol = 0
  let fileAdViol = 0

  // Empfehlungs-Wechsel je usage_form vergleichen (unspecified vs. explizite Intents).
  for (const uf of USAGE_FORMS) {
    const recByIntent: Record<DeclaredIntent, string> = {} as any
    for (const intent of INTENTS) {
      const v = buildAnalysisViewModel(withIntent(raw, intent), uf)
      recByIntent[intent] = v.overallVerdict.recommendation

      // Status-Isolation: alles muss zur Referenz passen.
      if (v.overallVerdict.status !== refStatus || v.overallVerdict.headline !== refHeadline) fileStatusViol++
      // Override-Korrektheit.
      const expectOverride = intent !== 'unspecified'
      if (v.intentAssessment.recommendationOverriddenByIntent !== expectOverride) fileOverrideViol++
      // usageFormNote-Regeln.
      if (refStatus === 'green' && v.usageFormNote !== null) fileGreenViol++
      if (cluster === 'bias_representation' && v.usageFormNote !== null) fileBiasViol++
      // AD-Marker.
      if (hasAdMarker(v.overallVerdict.recommendation)) fileAdViol++
    }
    // Intent-Wording-Wechsel: unspecified darf nicht textgleich mit einem expliziten Intent sein.
    for (const intent of ['affirmative', 'critical', 'illustrative'] as DeclaredIntent[]) {
      if (recByIntent[intent] === recByIntent.unspecified) fileWordingStuck++
    }
  }

  const filePass =
    fileStatusViol === 0 && fileOverrideViol === 0 && fileWordingStuck === 0 &&
    fileGreenViol === 0 && fileBiasViol === 0 && fileAdViol === 0

  statusIsolationViolations += fileStatusViol
  overrideViolations += fileOverrideViol
  intentWordingStuck += fileWordingStuck
  greenNoteViolations += fileGreenViol
  biasNoteViolations += fileBiasViol
  adMarkerViolations += fileAdViol
  if (filePass) filesPass++

  console.log(`## ${basename(file)}  [Leseart ${mode}, Status ${refStatus}, Cluster ${cluster ?? '–'}]`)
  console.log(`   ${filePass ? 'PASS ✅' : 'FAIL ❌'}  | StatusIso=${fileStatusViol} Override=${fileOverrideViol} WordingStuck=${fileWordingStuck} greenNote=${fileGreenViol} biasNote=${fileBiasViol} AD=${fileAdViol}`)
  // Empfehlungs-Beispiele (ohne usage_form-Note, Cluster-Kontext) für den Bericht.
  for (const intent of INTENTS) {
    const r = buildAnalysisViewModel(withIntent(raw, intent), 'header').overallVerdict.recommendation
    console.log(`     ${intent.padEnd(12)} → ${r.slice(0, 90)}${r.length > 90 ? '…' : ''}`)
  }
  console.log('')
}

console.log('---')
console.log(`Geprüfte JSONs: ${totalFiles} | PASS: ${filesPass}/${totalFiles}`)
console.log(`Summen: StatusIso=${statusIsolationViolations} Override=${overrideViolations} WordingStuck=${intentWordingStuck} greenNote=${greenNoteViolations} biasNote=${biasNoteViolations} AD=${adMarkerViolations}`)

const pass =
  totalFiles > 0 &&
  filesPass === totalFiles &&
  statusIsolationViolations === 0 &&
  overrideViolations === 0 &&
  intentWordingStuck === 0 &&
  greenNoteViolations === 0 &&
  biasNoteViolations === 0 &&
  adMarkerViolations === 0
console.log(`\n## Ergebnis: ${pass ? 'PASS ✅' : 'FAIL ❌'}`)
if (!pass) process.exitCode = 1
