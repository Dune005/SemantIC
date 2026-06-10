import type { AnalysisOutput, MaskingEvidence } from './schemas/analysis.js'

// Deterministischer Maskierungs-Hinweis (ersetzt den widerlegten masking_score,
// Beschluss spike-test/MASKIERUNG-GESAMTBEFUND.md 2026-06-07): Maskierung wird
// erklärbar sichtbar gemacht, nicht als Messwert behauptet.
//
// Harte Sprachregel für note.text (F4-Leitplanken, Frontend 1.5):
// - Modalverben ("kann … erschweren"), nie Wirkungs-Indikativ
// - keine Stufenwörter (hoch/mittel/gering), keine Risiko-Skalen, kein Score
// - Zahlen nur als ehrliche Anzahl markierter Stellen, nie als Bewertung

export type ReadingMode = AnalysisOutput['research_layer']['reading_mode']
export type MaskingDriver = MaskingEvidence['driver']
export type LinkedDimension = 'physics' | 'semantics'

export interface MaskingReviewNote {
  text: string
  basis: {
    reading_mode: ReadingMode
    visual_drivers: MaskingDriver[]
    linked_dimensions: LinkedDimension[]
    link_count: number
  }
}

// Satz-Subjekte je Leseart — modal formulierte Entsprechung der kanonischen
// Maskierungslogik aus dem Analyse-Prompt (Phase 3).
const READING_MODE_SUBJECT: Record<ReadingMode, string> = {
  WA: 'Die professionelle Werbe-Ästhetik des Bildes',
  DA: 'Die dokumentarisch-authentische Anmutung des Bildes',
  CI: 'Die cinematische Bildstimmung',
  AA: 'Die beiläufig-private Amateur-Anmutung',
  MI: 'Die professionelle Magazin-Inszenierung',
}

const FALLBACK_SUBJECT = 'Die visuelle Gestaltung des Bildes'

export const LINK_AREA_LABEL: Record<MaskingEvidence['codebook_link'], string> = {
  physics: 'Physik',
  anatomy: 'Anatomie',
  context: 'Kontext',
}

// Befundkarten-Dimension je codebook_link (Anatomie läuft unter Physik,
// Kontextbrüche unter Semantik). Bias ist nicht lokalisiert verknüpfbar —
// dokumentierte Grenze, taucht hier bewusst nie auf.
const LINK_DIMENSION: Record<MaskingEvidence['codebook_link'], LinkedDimension> = {
  physics: 'physics',
  anatomy: 'physics',
  context: 'semantics',
}

function uniqueInOrder<T>(items: T[]): T[] {
  return items.filter((item, i) => items.indexOf(item) === i)
}

/**
 * Identische Verknüpfungen (gleicher Treiber, gleicher Befund-Link, gleiche
 * Region) nur einmal zählen — sonst meldet der Hinweis mehr «Stellen», als
 * das Bild trägt (Codex-Review 2026-06-10). Exportiert, damit Anzeigen der
 * markierten Stellen (UI/Print) dieselbe Zählung nutzen wie der Hinweis.
 */
export function dedupeMaskingLinks(validEvidence: MaskingEvidence[]): MaskingEvidence[] {
  return validEvidence.filter((e, i) =>
    validEvidence.findIndex(o =>
      o.driver === e.driver
      && o.codebook_link === e.codebook_link
      && o.region_box_2d.join(',') === e.region_box_2d.join(','),
    ) === i,
  )
}

/**
 * Komponiert den beschreibenden Maskierungs-Hinweis aus Leseart und den
 * deterministisch validierten masking_evidence-Verknüpfungen.
 *
 * Gate: nur wenn mindestens eine validierte Verknüpfung existiert — eine
 * Auffälligkeit allein ist kein Maskierungs-Hinweis, und Schönheit ohne
 * Befund erst recht nicht (das deckt normative_masking separat ab).
 */
export function composeMaskingReviewNote(
  readingMode: ReadingMode,
  validEvidence: MaskingEvidence[],
): MaskingReviewNote | null {
  const links = dedupeMaskingLinks(validEvidence)
  if (links.length === 0) return null

  const subject = READING_MODE_SUBJECT[readingMode] ?? FALLBACK_SUBJECT
  const areas = uniqueInOrder(links.map(e => LINK_AREA_LABEL[e.codebook_link]))
  const linkCount = links.length

  const findingsPhrase = areas.length === 1
    ? (linkCount === 1
        ? `des markierten ${areas[0]}-Befunds`
        : `der markierten ${areas[0]}-Befunde`)
    : `der markierten Befunde (${areas.join(', ')})`

  const markerPhrase = linkCount === 1
    ? 'eine Stelle markiert, an der ein ästhetischer Treiber den Befund überdecken könnte'
    : `${linkCount} Stellen markiert, an denen ästhetische Treiber Befunde überdecken könnten`

  const text =
    `${subject} kann die kritische Prüfung ${findingsPhrase} erschweren. ` +
    `Das Modell hat ${markerPhrase} – ein prüfbarer Hinweis, kein Nachweis.`

  return {
    text,
    basis: {
      reading_mode: readingMode,
      visual_drivers: uniqueInOrder(links.map(e => e.driver)),
      linked_dimensions: uniqueInOrder(links.map(e => LINK_DIMENSION[e.codebook_link])),
      link_count: linkCount,
    },
  }
}
