// Replay-Smoketest für die Verwendungsform-Achse (Lösung B).
//
// Zweck (Plan Teil A, deterministisch, drift-frei): belegt, dass der Fix im
// View-Model sitzt — nicht in der LLM-Pipeline. Fährt gespeicherte
// Pipeline-JSONs mit Leseart WA/MI durch buildAnalysisViewModel und prüft:
//
//   1. "professionelle Werbung" taucht in KEINER recommendation mehr auf.
//   2. status + headline sind über alle 7 Verwendungsformen identisch
//      (Status-Isolation gegen usage_form).
//   3. usageFormNote-Regeln: green → null; dominanter bias_representation-
//      Cluster → null; sonst Tier-Note bei yellow/red.
//
// Vorher/Nachher: Da der Fix uncommitted im Working Tree liegt, lässt sich
// derselbe Lauf via `git stash` auf der alten (main-)Logik wiederholen — dort
// erscheint "professionelle Werbung" bei MI/WA + image_integrity + red.
// Aufruf ohne usageForm (buildAnalysisViewModel(json)) funktioniert auf beiden
// Code-Ständen.

import { readFileSync, readdirSync } from 'node:fs'
import { resolve, basename } from 'node:path'
import { buildAnalysisViewModel, type UsageForm } from '../app/composables/useAnalysisView'
import type { SemanticAnalysisResult } from '../../src/analyze'

const outputDir = resolve(import.meta.dirname, '../../spike-test/output')
// Signatur-Strings der entfernten RECOMMENDATION_TABLE_AD (kommen NUR dort vor,
// nicht in RECOMMENDATION_TABLE oder RECOMMENDATION_BY_INTENT). Jeder Treffer in
// einer Empfehlung bedeutet: die leseart-getriebene Werbe-Tabelle hat gegriffen.
const AD_MARKERS = [
  'professionelle Werbung',
  'Werbe-/Magazin-Kontext',
  'Werbe-/Magazin-Genre',
  'im Werbe-Genre',
  'Werbe-Kontext',
  'Werbe-Standards',
  'Skalierung oder Anatomie wirken auffällig',
  'zu glatt für die Hinweise, die im Bild stecken',
]
function hasAdMarker(text: string): boolean {
  return AD_MARKERS.some(m => text.includes(m))
}
const USAGE_FORMS: UsageForm[] = [
  'header', 'mood', 'symbol', 'illustration', 'social', 'advertising', 'editorial',
]

function readingModeOf(raw: SemanticAnalysisResult): string {
  return raw?.analysis?.research_layer?.reading_mode ?? '–'
}

const files = readdirSync(outputDir).filter(f => f.endsWith('.json')).sort()

let total = 0
let waMi = 0
const adMarkerBaseline: string[] = []   // JSONs deren Default-Empfehlung das Werbe-Wording trägt
let adMarkerAnyUsageForm = 0            // Verstösse: Marker in IRGENDeiner usage_form-Variante
let statusIsolationViolations = 0       // status/headline wechselt mit usage_form
let biasNoteViolations = 0              // Note bei bias_representation-dominanz nicht null
let greenNoteViolations = 0             // Note bei green nicht null
const tierNoteExamples: string[] = []

for (const file of files) {
  let raw: SemanticAnalysisResult
  try {
    raw = JSON.parse(readFileSync(resolve(outputDir, file), 'utf-8'))
  } catch {
    continue
  }
  // Nur vollständige Result-JSONs (manche frühe Outputs sind Teil-Dumps).
  if (!raw?.analysis?.dimension_analysis) continue
  if (!Array.isArray(raw?.context_review_hints)) continue
  total++
  const mode = readingModeOf(raw)
  if (mode !== 'WA' && mode !== 'MI') continue
  waMi++

  // Default-Empfehlung (ohne usage_form) — der Vorher/Nachher-Marker.
  const base = buildAnalysisViewModel(raw)
  const baseRec = base.overallVerdict.recommendation
  if (hasAdMarker(baseRec)) adMarkerBaseline.push(`${basename(file)} [${mode}]`)

  // Status-Isolation + Note-Regeln über alle Verwendungsformen.
  const refStatus = base.overallVerdict.status
  const refHeadline = base.overallVerdict.headline
  const cluster = base.overallVerdict.dominantCluster

  for (const uf of USAGE_FORMS) {
    const v = buildAnalysisViewModel(raw, uf)
    if (hasAdMarker(v.overallVerdict.recommendation)) adMarkerAnyUsageForm++
    if (v.overallVerdict.status !== refStatus || v.overallVerdict.headline !== refHeadline) {
      statusIsolationViolations++
    }
    const note = v.usageFormNote
    if (refStatus === 'green' && note !== null) greenNoteViolations++
    if (cluster === 'bias_representation' && note !== null) biasNoteViolations++
    if (note && tierNoteExamples.length < 8) {
      tierNoteExamples.push(`${mode}/${refStatus}/${cluster ?? '–'} × ${uf} → ${note.slice(0, 70)}…`)
    }
  }
}

console.log('# Replay-Smoketest: Verwendungsform-Achse\n')
console.log(`Geprüfte Result-JSONs gesamt: ${total}`)
console.log(`davon Leseart WA/MI: ${waMi}\n`)

console.log('## 1. Werbe-Framing (AD-Tabellen-Signatur)')
console.log(`- Default-Empfehlung (ohne usage_form) mit Werbe-Framing: **${adMarkerBaseline.length}**`)
console.log('  (Vorher-Lauf gegen main-Logik > 0 = AD-Tabelle griff; Nachher-Lauf = 0)')
if (adMarkerBaseline.length > 0) {
  console.log('  Betroffene JSONs:')
  for (const j of adMarkerBaseline.slice(0, 12)) console.log(`    - ${j}`)
  if (adMarkerBaseline.length > 12) console.log(`    … (+${adMarkerBaseline.length - 12} weitere)`)
}
console.log(`- Werbe-Framing in IRGENDeiner usage_form-Variante: **${adMarkerAnyUsageForm}** (Soll: 0)\n`)

console.log('## 2. Status-Isolation gegen usage_form')
console.log(`- status/headline-Abweichungen über Verwendungsformen: **${statusIsolationViolations}** (Soll: 0)\n`)

console.log('## 3. usageFormNote-Regeln')
console.log(`- Note ≠ null bei status=green: **${greenNoteViolations}** (Soll: 0)`)
console.log(`- Note ≠ null bei dominantem bias_representation-Cluster: **${biasNoteViolations}** (Soll: 0)`)
console.log('- Beispiel-Notes (Tier × Verwendungsform):')
for (const ex of tierNoteExamples) console.log(`    - ${ex}`)

const pass =
  adMarkerAnyUsageForm === 0 &&
  statusIsolationViolations === 0 &&
  greenNoteViolations === 0 &&
  biasNoteViolations === 0
console.log(`\n## Ergebnis: ${pass ? 'PASS ✅' : 'FAIL ❌'}`)
if (!pass) process.exitCode = 1
