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

// ── Label-Maps (deutsche Render-Uebersetzung) ────────────────────────────────
export const DIMENSION_LABELS = { physics: 'Physik', semantics: 'Semantik', bias: 'Bias' } as const

export const DIMENSION_DESC = {
  physics: 'Licht, Schatten, Anatomie, Materialien',
  semantics: 'Szenenlogik, Prompt-Passung, Kontext',
  bias: 'Stereotype, Rollenbesetzung, Repräsentation',
} as const

// Normative Bildwirkung (Phase 7)
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
// Modal formuliert («kann maskieren») – die Leseart beschreibt ein Potenzial,
// keine gemessene Wirkung (F4-Leitplanken, Rückbau 2026-06-10).
export const READING_MODE_DESC = {
  WA: 'Werbe-Ästhetik – kann über Normativität und Idealwelt maskieren.',
  DA: 'Dokumentarisch-Authentisch – kann über scheinbare Objektivität maskieren.',
  CI: 'Cinematisch – kann affektiv über Filmstimmung maskieren.',
  AA: 'Amateur-Authentisch – kann über Vertrautheit und Spontaneität maskieren.',
  MI: 'Magazin/Inszeniert – kann über Professionalität und Status maskieren.',
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

// Bias-Achsen-Risiko (biasAxesSummary.maxRisk) – Anzeige-Übersetzung
export const RISK_LEVEL_LABEL = { high: 'hoch', medium: 'mittel', low: 'niedrig', none: 'keines' } as const

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
