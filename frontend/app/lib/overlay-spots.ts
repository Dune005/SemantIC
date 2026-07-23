// Deterministische F2-Logik des Bild-Overlays (Diagnose-Cockpit, Etappe 3).
// Pur und framework-frei gehalten, damit sie ausserhalb von Vue unit-testbar ist.
// Treiber-Labels kommen seit feature/output-language aus @pipeline/vocab
// (EINZIGE Label-Quelle, DE/EN) – keine eigene Label-Map mehr in dieser Datei.
import type { EvidenceSpot, InspectorSpot } from '~/types/analysis'
import { visualDriverLabel, type OutputLang } from '@pipeline/vocab'

// Box-Guard – spiegelt src/analyze.ts:isValidBox: genau 4 ganzzahlige Werte in
// [0,1000] mit y_min < y_max und x_min < x_max. Schützt das Overlay vor
// entarteten/fehlenden Boxen → der Spot fällt dann in die Fallback-Liste statt
// eine 0×0- oder negative Box zu zeichnen.
export function isValidBox(box: readonly number[] | null | undefined): boolean {
  if (!Array.isArray(box) || box.length !== 4) return false
  const [y1, x1, y2, x2] = box
  if (![y1, x1, y2, x2].every((n) => Number.isInteger(n) && n >= 0 && n <= 1000)) return false
  return y1 < y2 && x1 < x2
}

// F2-Anzeigeschwelle – zwei bewusst getrennte Policies:
//  · Codebook (physics|anatomy|context): Box zeichnen, sobald sie valide ist
//    (kein confidence/salient-Feld vorhanden; defensive Absicherung läuft über
//    Label „LLM-verortet, nicht pixelgenau").
//  · Maskierung: Box NUR bei confidence === 'high' && salientRegion === true;
//    sonst Fallback-Listeneintrag ohne Box/Pin (kein Spot verschwindet).
//  · Bias ist gar nicht in evidenceSpots → strukturell nie geboxt.
export function qualifiesAsBox(spot: EvidenceSpot): boolean {
  if (!isValidBox(spot.box)) return false
  return spot.source !== 'masking' || (spot.confidence === 'high' && spot.salientRegion === true)
}

// Reichert die rohen evidenceSpots um Render-/F2-Metadaten an. Wird im Root
// (DiagnoseCockpit) projiziert; der Bild-Inspektor konsumiert nur das Ergebnis.
// `lang` = eingefrorene Report-Sprache (vm.reportLang) fuer das Treiber-Label.
export function buildInspectorSpots(spots: EvidenceSpot[], lang: OutputLang = 'de'): InspectorSpot[] {
  return spots.map((s) => ({
    id: s.id,
    source: s.source,
    box: s.box,
    text: s.text,
    layer: s.source === 'masking' ? 'mask' : 'finding',
    qualifiesAsBox: qualifiesAsBox(s),
    driverLabel: s.source === 'masking' ? visualDriverLabel(s.driver, lang) : null,
  }))
}
