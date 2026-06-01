// SemantIC Frontend 1.0 – Praesentations-Helfer (Severity + Label-Maps).
//
// NUR Render-Logik: uebersetzt Kontrakt-Enums in die Severity-Achse und in
// deutsche Labels. KEINE Composable-internen Logik-Maps (VERDICT_HEADLINES,
// RECOMMENDATION_*, USAGE_FORM_TO_TIER, USAGE_TIER_NOTES, SEVERITY_RANK) – die
// bleiben im portierten useAnalysisView.ts (Etappe 5), um Drift zu vermeiden.
//
// Quelle: contract.md §3/§4 + primitives.md §0.1 (verbatim, Halbgeviertstrich
// "–" statt Original-Geviertstrich normalisiert).

// ── Severity-Achse (Score-basiert) ───────────────────────────────────────────
export type Severity = 'safe' | 'warn' | 'crit'

// Schwellen: >=70 OK(safe) / 40–69 WARN / <40 CRIT. Gilt fuer Score-Bar-Segmente,
// Dimensions-/Hero-Score-Farben. NICHT fuer overallVerdict.status /
// dimensions.*.status – die kommen aus der Pipeline und werden NIE aus dem Score
// neu berechnet.
export function severityFor(score: number): Severity {
  if (score >= 70) return 'safe'
  if (score >= 40) return 'warn'
  return 'crit'
}

// Severity-Wort (Score-Bar / DimBadge) – immer zusammen mit der Farbe (Doppelkodierung).
export const SEVERITY_WORD = { safe: 'OK', warn: 'WARN', crit: 'CRIT' } as const

// Status-Severity (StatusTag/Verdict) – reines Render-Mapping, NICHT aus einem
// Score gerechnet. Goldstandard-Vokabular: publish→green, review→yellow, reject→red.
export const STATUS_TO_SEVERITY = { green: 'safe', yellow: 'warn', red: 'crit' } as const

// Dimensions-Status-Wort. Defekt #7 (O-1): Hero-Status-Tag nutzt dieses Wort –
// kein englisches "Conditional".
export const STATUS_WORD = { green: 'unauffällig', yellow: 'auffällig', red: 'kritisch' } as const

// Hint-Severity → Render-Farbe der Befund-Severity-Tags. Reine Praesentation; das
// Wort kommt separat aus HINT_SEVERITY_LABEL (Doppelkodierung). low = 'neutral'
// (surface-2, KEIN Gruen) – ein niedriger Hinweis ist kein „OK"-Befund (Prototyp
// .hint-sev.low). 'neutral' = surface-2/Ink-Border, keine Ampel.
export const HINT_SEVERITY_TO_SEVERITY = { high: 'crit', medium: 'warn', low: 'neutral' } as const

// Maskierungs-Verdikt → Render-Farbe. EIGENE Skala (NICHT severityFor): geringe
// Maskierung ist kein Befund → neutral. medium=warn, high=crit. Wort separat aus
// MASKING_VERDICT_LABELS (Doppelkodierung). 'neutral' = --muted/Ink-Border, keine Ampel.
export const MASKING_TO_SEVERITY = { none: 'neutral', low: 'neutral', medium: 'warn', high: 'crit' } as const

// ── Label-Maps (deutsche Render-Uebersetzung) ────────────────────────────────
export const DIMENSION_LABELS = { physics: 'Physik', semantics: 'Semantik', bias: 'Bias' } as const

export const DIMENSION_DESC = {
  physics: 'Licht, Schatten, Anatomie, Materialien',
  semantics: 'Szenenlogik, Prompt-Passung, Kontext',
  bias: 'Stereotype, Rollenbesetzung, Repräsentation',
} as const

// Maskierung (faktisch)
export const MASKING_VERDICT_LABELS = {
  none: 'keine Maskierung erkannt',
  low: 'geringe Tendenz',
  medium: 'mittlere Tendenz',
  high: 'starke Tendenz',
} as const

// Normative Maskierung
export const NORMATIVE_VERDICT_LABELS = {
  not_applicable: 'nicht anwendbar',
  low: 'gering',
  medium: 'mittel',
  high: 'stark',
} as const

export const NORMATIVE_ASPECT_LABELS = {
  beauty_ideal: 'Schönheitsideal',
  lifestyle_aspiration: 'Lifestyle-Ideal',
  status_signaling: 'Statussignal',
  gender_norm: 'Geschlechternorm',
  success_norm: 'Erfolgsnorm',
} as const

// Leseart – Maskierungslogik-Beschreibung (Halbgeviertstrich –, U+2013).
export const READING_MODE_DESC = {
  WA: 'Werbe-Ästhetik – maskiert über Normativität und Idealwelt.',
  DA: 'Dokumentarisch-Authentisch – maskiert über scheinbare Objektivität.',
  CI: 'Cinematisch – maskiert affektiv über Filmstimmung.',
  AA: 'Amateur-Authentisch – maskiert über Vertrautheit und Spontaneität.',
  MI: 'Magazin/Inszeniert – maskiert über Professionalität und Status.',
} as const

// Dominanter Fehlertyp
export const DOMINANT_ERROR_LABELS = {
  physics: 'Physik-Befund dominiert',
  anatomy: 'Anatomie-Befund dominiert',
  context: 'Kontext-Befund dominiert',
  mixed: 'mehrere Befunde gemischt',
  none: 'kein dominanter Befund',
} as const

// Input-Vollstaendigkeit (Halbgeviertstrich normalisiert)
export const INPUT_COMPLETENESS_LABELS = {
  full: 'Prompt und Nutzungskontext vorhanden',
  image_context: 'Nutzungskontext vorhanden, ohne Prompt',
  image_prompt: 'Prompt vorhanden, ohne Nutzungskontext',
  image_only: 'Nur Bild – Bewertung wird generisch',
} as const

// Hint-Severity (Akkordeon + Befund-Severity)
export const HINT_SEVERITY_LABEL = { high: 'hoch', medium: 'mittel', low: 'niedrig' } as const

// Haltung (declared_intent) – nur fuer IntentPanel-Anzeige
export const INTENT_LABELS = {
  unspecified: 'Standard',
  affirmative: 'Bestätigend',
  critical: 'Kritisch',
  illustrative: 'Illustrativ',
} as const

// Verwendungsform (usage_form) – Frontend-only, fuer Report/PDF (separater Prop)
export const USAGE_FORM_LABELS = {
  header: 'Headerbild',
  mood: 'Moodbild',
  symbol: 'Symbolbild',
  illustration: 'Illustration',
  social: 'Social-Post',
  advertising: 'Werbe-/Marketingbild',
  editorial: 'Editorial-Bild',
} as const
