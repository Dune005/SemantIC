// Deterministische F2-Logik des Bild-Overlays (Diagnose-Cockpit, Etappe 3).
// Pur und framework-frei gehalten, damit sie ausserhalb von Vue unit-testbar ist
// (alle Typ-Importe sind `import type` → vom Bundler/tsx zur Laufzeit entfernt).
import type { EvidenceSpot, InspectorSpot, VisualDriverCode } from '~/types/analysis'

// Statische Labels der visuellen Treiber (Research-Vokabular, vgl. Projekt-CLAUDE.md
// und research_layer.visual_drivers). Ein Maskierungs-Spot trägt nur den Treiber-
// Code; für Tooltip/Liste brauchen wir den ausgeschriebenen Namen.
export const VISUAL_DRIVER_LABEL: Record<VisualDriverCode, string> = {
  CL: 'Cinematic Lighting',
  BK: 'Bokeh / geringe Tiefenschärfe',
  WCG: 'Warmes Color Grading',
  HDT: 'Hyper-Detail-Textur',
  MO: 'Makellose Oberflächen',
  GF: 'Gesättigte Farben',
  DS: 'Dynamische Spiegelungen',
  NL: 'Natürliches Licht',
  MH: 'Maximale Helligkeit',
}

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
export function buildInspectorSpots(spots: EvidenceSpot[]): InspectorSpot[] {
  return spots.map((s) => ({
    id: s.id,
    source: s.source,
    box: s.box,
    text: s.text,
    layer: s.source === 'masking' ? 'mask' : 'finding',
    qualifiesAsBox: qualifiesAsBox(s),
    driverLabel: s.source === 'masking' ? VISUAL_DRIVER_LABEL[s.driver] : null,
  }))
}
