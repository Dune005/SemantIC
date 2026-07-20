// SemantIC Frontend 1.0 – Praesentations-Helfer (Severity + Label-Maps).
//
// NUR Render-Logik: uebersetzt Kontrakt-Enums in die Severity-Achse und in
// zweisprachige Labels (DE/EN, indexiert ueber die eingefrorene Report-Sprache
// vm.reportLang – NICHT ueber die reaktive UI-Locale). KEINE Composable-internen
// Logik-Maps (VERDICT_HEADLINES, RECOMMENDATION_*, USAGE_FORM_TO_TIER,
// USAGE_TIER_NOTES, SEVERITY_RANK) – die bleiben im portierten
// useAnalysisView.ts (Etappe 5), um Drift zu vermeiden.
//
// DE-Quelle: contract.md §3/§4 + primitives.md §0.1 (verbatim, Halbgeviertstrich
// "–" statt Original-Geviertstrich normalisiert). EN: redaktionelle Übersetzung
// (i18n Analyse-Report, feature/output-language 2026-07-20).
import type { OutputLang } from '@pipeline/vocab'

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

// Severity-Wort (Score-Bar / DimBadge) – immer zusammen mit der Farbe
// (Doppelkodierung). Sprachneutrale Kuerzel.
export const SEVERITY_WORD = { safe: 'OK', warn: 'WARN', crit: 'CRIT' } as const

// Status-Severity (StatusTag/Verdict) – reines Render-Mapping, NICHT aus einem
// Score gerechnet. Goldstandard-Vokabular: publish→green, review→yellow, reject→red.
export const STATUS_TO_SEVERITY = { green: 'safe', yellow: 'warn', red: 'crit' } as const

// Dimensions-Status-Wort. Defekt #7 (O-1): Hero-Status-Tag nutzt dieses Wort.
export const STATUS_WORD: Record<'green' | 'yellow' | 'red', Record<OutputLang, string>> = {
  green: { de: 'unauffällig', en: 'unremarkable' },
  yellow: { de: 'auffällig', en: 'flagged' },
  red: { de: 'kritisch', en: 'critical' },
}

// Hint-Severity → Render-Farbe der Befund-Severity-Tags. Reine Praesentation; das
// Wort kommt separat aus HINT_SEVERITY_LABEL (Doppelkodierung). low = 'neutral'
// (surface-2, KEIN Gruen) – ein niedriger Hinweis ist kein „OK"-Befund (Prototyp
// .hint-sev.low). 'neutral' = surface-2/Ink-Border, keine Ampel.
export const HINT_SEVERITY_TO_SEVERITY = { high: 'crit', medium: 'warn', low: 'neutral' } as const

// ── Label-Maps (zweisprachige Render-Uebersetzung, Zugriff MAP[key][lang]) ───
export const DIMENSION_LABELS: Record<'physics' | 'semantics' | 'bias', Record<OutputLang, string>> = {
  physics: { de: 'Physik', en: 'Physics' },
  semantics: { de: 'Semantik', en: 'Semantics' },
  bias: { de: 'Bias', en: 'Bias' },
}

export const DIMENSION_DESC: Record<'physics' | 'semantics' | 'bias', Record<OutputLang, string>> = {
  physics: {
    de: 'Licht, Schatten, Anatomie, Materialien',
    en: 'Light, shadows, anatomy, materials',
  },
  semantics: {
    de: 'Szenenlogik, Prompt-Passung, Kontext',
    en: 'Scene logic, prompt fit, context',
  },
  bias: {
    de: 'Stereotype, Rollenbesetzung, Repräsentation',
    en: 'Stereotypes, role casting, representation',
  },
}

// Normative Bildwirkung (Phase 7)
export const NORMATIVE_VERDICT_LABELS: Record<
  'not_applicable' | 'low' | 'medium' | 'high',
  Record<OutputLang, string>
> = {
  not_applicable: { de: 'nicht anwendbar', en: 'not applicable' },
  low: { de: 'gering', en: 'low' },
  medium: { de: 'mittel', en: 'medium' },
  high: { de: 'stark', en: 'strong' },
}

export const NORMATIVE_ASPECT_LABELS: Record<
  'beauty_ideal' | 'lifestyle_aspiration' | 'status_signaling' | 'gender_norm' | 'success_norm',
  Record<OutputLang, string>
> = {
  beauty_ideal: { de: 'Schönheitsideal', en: 'Beauty ideal' },
  lifestyle_aspiration: { de: 'Lifestyle-Ideal', en: 'Lifestyle ideal' },
  status_signaling: { de: 'Statussignal', en: 'Status signal' },
  gender_norm: { de: 'Geschlechternorm', en: 'Gender norm' },
  success_norm: { de: 'Erfolgsnorm', en: 'Success norm' },
}

// Leseart – Maskierungslogik-Beschreibung (Halbgeviertstrich –, U+2013).
// Modal formuliert («kann maskieren» / «can mask») – die Leseart beschreibt ein
// Potenzial, keine gemessene Wirkung (F4-Leitplanken, Rückbau 2026-06-10).
export const READING_MODE_DESC: Record<'WA' | 'DA' | 'CI' | 'AA' | 'MI', Record<OutputLang, string>> = {
  WA: {
    de: 'Werbe-Ästhetik – kann über Normativität und Idealwelt maskieren.',
    en: 'Advertising Aesthetic – can mask through normativity and an ideal world.',
  },
  DA: {
    de: 'Dokumentarisch-Authentisch – kann über scheinbare Objektivität maskieren.',
    en: 'Documentary-Authentic – can mask through apparent objectivity.',
  },
  CI: {
    de: 'Cinematisch – kann affektiv über Filmstimmung maskieren.',
    en: 'Cinematic – can mask affectively through film mood.',
  },
  AA: {
    de: 'Amateur-Authentisch – kann über Vertrautheit und Spontaneität maskieren.',
    en: 'Amateur-Authentic – can mask through familiarity and spontaneity.',
  },
  MI: {
    de: 'Magazin/Inszeniert – kann über Professionalität und Status maskieren.',
    en: 'Magazine/Staged – can mask through professionalism and status.',
  },
}

// Dominanter Fehlertyp
export const DOMINANT_ERROR_LABELS: Record<
  'physics' | 'anatomy' | 'context' | 'mixed' | 'none',
  Record<OutputLang, string>
> = {
  physics: { de: 'Physik-Befund dominiert', en: 'Physics finding dominates' },
  anatomy: { de: 'Anatomie-Befund dominiert', en: 'Anatomy finding dominates' },
  context: { de: 'Kontext-Befund dominiert', en: 'Context finding dominates' },
  mixed: { de: 'mehrere Befunde gemischt', en: 'multiple findings mixed' },
  none: { de: 'kein dominanter Befund', en: 'no dominant finding' },
}

// Input-Vollstaendigkeit (Halbgeviertstrich normalisiert)
export const INPUT_COMPLETENESS_LABELS: Record<
  'full' | 'image_context' | 'image_prompt' | 'image_only',
  Record<OutputLang, string>
> = {
  full: {
    de: 'Prompt und Nutzungskontext vorhanden',
    en: 'Prompt and usage context provided',
  },
  image_context: {
    de: 'Nutzungskontext vorhanden, ohne Prompt',
    en: 'Usage context provided, no prompt',
  },
  image_prompt: {
    de: 'Prompt vorhanden, ohne Nutzungskontext',
    en: 'Prompt provided, no usage context',
  },
  image_only: {
    de: 'Nur Bild – Bewertung wird generisch',
    en: 'Image only – the assessment becomes generic',
  },
}

// Hint-Severity (Akkordeon + Befund-Severity)
export const HINT_SEVERITY_LABEL: Record<'high' | 'medium' | 'low', Record<OutputLang, string>> = {
  high: { de: 'hoch', en: 'high' },
  medium: { de: 'mittel', en: 'medium' },
  low: { de: 'niedrig', en: 'low' },
}

// Bias-Achsen-Risiko (biasAxesSummary.maxRisk) – Anzeige-Übersetzung
export const RISK_LEVEL_LABEL: Record<'high' | 'medium' | 'low' | 'none', Record<OutputLang, string>> = {
  high: { de: 'hoch', en: 'high' },
  medium: { de: 'mittel', en: 'medium' },
  low: { de: 'niedrig', en: 'low' },
  none: { de: 'keines', en: 'none' },
}

// Haltung (declared_intent) – nur fuer IntentPanel-Anzeige
export const INTENT_LABELS: Record<
  'unspecified' | 'affirmative' | 'critical' | 'illustrative',
  Record<OutputLang, string>
> = {
  unspecified: { de: 'Standard', en: 'Standard' },
  affirmative: { de: 'Bestätigend', en: 'Affirmative' },
  critical: { de: 'Kritisch', en: 'Critical' },
  illustrative: { de: 'Illustrativ', en: 'Illustrative' },
}

// Verwendungsform (usage_form) – Frontend-only, fuer Report/PDF (separater Prop)
export const USAGE_FORM_LABELS: Record<
  'header' | 'mood' | 'symbol' | 'illustration' | 'social' | 'advertising' | 'editorial',
  Record<OutputLang, string>
> = {
  header: { de: 'Headerbild', en: 'Header image' },
  mood: { de: 'Moodbild', en: 'Mood image' },
  symbol: { de: 'Symbolbild', en: 'Symbolic image' },
  illustration: { de: 'Illustration', en: 'Illustration' },
  social: { de: 'Social-Post', en: 'Social post' },
  advertising: { de: 'Werbe-/Marketingbild', en: 'Advertising/marketing image' },
  editorial: { de: 'Editorial-Bild', en: 'Editorial image' },
}
