// Deterministischer Check für composeMaskingReviewNote (kein Test-Framework im
// Repo — Ausführung: npx tsx src/masking-note.check.ts; Exit-Code 0 = grün).
// Prüft: Nullfall, alle Lesearten, Singular/Plural, Dedupe + stabile Reihenfolge,
// verbotene Skalen-/Risikosprache (F4-Leitplanken).
import { composeMaskingReviewNote, type ReadingMode } from './masking-note.js'
import type { MaskingEvidence } from './schemas/analysis.js'

let failures = 0
function check(name: string, cond: boolean, detail?: string) {
  if (cond) {
    console.log(`  ✓ ${name}`)
  } else {
    failures++
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

function ev(partial: Partial<MaskingEvidence>): MaskingEvidence {
  return {
    driver: 'CL',
    masked_issue: 'Warmes Licht über der fehlerhaften Hand.',
    codebook_link: 'anatomy',
    region_box_2d: [100, 100, 300, 300],
    salient_region: true,
    confidence: 'medium',
    ...partial,
  }
}

// Verbotene Sprache im Hinweis-Text: Stufenwörter, Risiko-Skalen, Score-Sprache,
// Wirkungs-Indikative der alten Messung.
const FORBIDDEN = /\b(hoch|hohes|mittel|mittlere|gering|geringes|Risiko|Score|Verdict|Kennzahl|stark|maskiert\b)/i

console.log('composeMaskingReviewNote – Checks')

// 1. Nullfall
check('leere Evidence → null', composeMaskingReviewNote('WA', []) === null)

// 2. Alle Lesearten + Fallback
const subjects: Record<ReadingMode, string> = {
  WA: 'Werbe-Ästhetik',
  DA: 'dokumentarisch-authentische',
  CI: 'cinematische',
  AA: 'Amateur-Anmutung',
  MI: 'Magazin-Inszenierung',
}
for (const mode of Object.keys(subjects) as ReadingMode[]) {
  const note = composeMaskingReviewNote(mode, [ev({})])
  check(`Leseart ${mode}: Note vorhanden`, note !== null)
  check(`Leseart ${mode}: Subjekt passt`, !!note && note.text.includes(subjects[mode]), note?.text)
  check(`Leseart ${mode}: modal («kann»)`, !!note && note.text.includes('kann'), note?.text)
  check(`Leseart ${mode}: keine verbotene Sprache`, !!note && !FORBIDDEN.test(note.text), note?.text)
  check(`Leseart ${mode}: «kein Nachweis» enthalten`, !!note && note.text.includes('kein Nachweis'), note?.text)
}
const fallback = composeMaskingReviewNote('XX' as ReadingMode, [ev({})])
check('Unbekannte Leseart: Fallback-Subjekt', !!fallback && fallback.text.startsWith('Die visuelle Gestaltung des Bildes'), fallback?.text)

// 3. Singular (1 Link, eine Area)
const single = composeMaskingReviewNote('WA', [ev({ codebook_link: 'anatomy' })])
check('Singular: «des markierten Anatomie-Befunds»', !!single && single.text.includes('des markierten Anatomie-Befunds'), single?.text)
check('Singular: «eine Stelle markiert»', !!single && single.text.includes('eine Stelle markiert'), single?.text)
check('Singular: link_count = 1', single?.basis.link_count === 1)

// 4. Plural, eine Area
const plural = composeMaskingReviewNote('DA', [
  ev({ codebook_link: 'physics', driver: 'CL' }),
  ev({ codebook_link: 'physics', driver: 'BK' }),
])
check('Plural eine Area: «der markierten Physik-Befunde»', !!plural && plural.text.includes('der markierten Physik-Befunde'), plural?.text)
check('Plural: «2 Stellen markiert»', !!plural && plural.text.includes('2 Stellen markiert'), plural?.text)
check('Plural: beide Treiber in basis', JSON.stringify(plural?.basis.visual_drivers) === JSON.stringify(['CL', 'BK']))

// 5. Mehrere Areas + Dimension-Mapping + stabile Reihenfolge + Dedupe
// (dritter Eintrag = exaktes Duplikat von Eintrag 1 → zählt NICHT als eigene Stelle)
const multi = composeMaskingReviewNote('MI', [
  ev({ codebook_link: 'context', driver: 'WCG' }),
  ev({ codebook_link: 'anatomy', driver: 'CL' }),
  ev({ codebook_link: 'context', driver: 'WCG' }),
])
check('Multi-Area: Klammerliste in Eingabe-Reihenfolge', !!multi && multi.text.includes('der markierten Befunde (Kontext, Anatomie)'), multi?.text)
check('Multi-Area: linked_dimensions dedupliziert + gemappt', JSON.stringify(multi?.basis.linked_dimensions) === JSON.stringify(['semantics', 'physics']))
check('Multi-Area: Treiber dedupliziert', JSON.stringify(multi?.basis.visual_drivers) === JSON.stringify(['WCG', 'CL']))
check('Multi-Area: identische Verknüpfung dedupliziert → link_count = 2', multi?.basis.link_count === 2)
check('Multi-Area: Text zählt 2 Stellen', !!multi && multi.text.includes('2 Stellen markiert'), multi?.text)

// 5b. Gleicher Treiber + Link, aber ANDERE Region = eigene Stelle (kein Über-Dedupe)
const distinct = composeMaskingReviewNote('MI', [
  ev({ codebook_link: 'context', driver: 'WCG', region_box_2d: [100, 100, 300, 300] }),
  ev({ codebook_link: 'context', driver: 'WCG', region_box_2d: [500, 500, 700, 700] }),
])
check('Verschiedene Regionen bleiben getrennte Stellen (link_count = 2)', distinct?.basis.link_count === 2)

if (failures > 0) {
  console.error(`\n${failures} Check(s) fehlgeschlagen.`)
  process.exit(1)
}
console.log('\nAlle Checks grün.')
