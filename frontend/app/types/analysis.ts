// SemantIC Frontend 1.0 – ViewModel-Typen (Port aus web/app/composables/useAnalysisView.ts).
//
// REINE TYPEN. Etappe 2 zieht nur die Typ-Deklarationen (KEINE Logik/Konstanten),
// damit die datengetriebene BefundKarte das AnalysisViewModel-Interface kennt und
// gegen die contract/fixtures rendern kann (Codex-Reihenfolge: Typen vor BefundKarte).
// Der Composable-Port (buildAnalysisViewModel, aggregateVerdict, Logik-Maps) folgt in
// Etappe 5 und IMPORTIERT diese Datei – die Typen werden nicht dupliziert (kein Drift).
//
// Quelle: useAnalysisView.ts Z.5–192 (verbatim). Externe Pipeline-Typen via @pipeline.

import type { SemanticAnalysisResult } from '@pipeline/analyze'
import type { ContextReviewHint } from '@pipeline/context-hints'

export type DimensionStatus = 'green' | 'yellow' | 'red'
export type MaskingVerdict = 'none' | 'low' | 'medium' | 'high'
export type RiskLevel = 'low' | 'medium' | 'high'
export type ReadingModeCode = 'WA' | 'DA' | 'CI' | 'AA' | 'MI'
export type DeclaredIntent = 'affirmative' | 'critical' | 'illustrative' | 'unspecified'
export type IntentAlignment = 'match' | 'partial' | 'mismatch' | 'not_assessable'
export type FramingRisk = 'low' | 'medium' | 'high'

export type NormativeMaskingVerdict = 'low' | 'medium' | 'high' | 'not_applicable'
export type NormativeMaskingAspect =
  | 'beauty_ideal'
  | 'lifestyle_aspiration'
  | 'status_signaling'
  | 'gender_norm'
  | 'success_norm'

export interface NormativeMaskingView {
  verdict: NormativeMaskingVerdict
  aspects: NormativeMaskingAspect[]
  reasoning: string
}

export interface IntentAssessmentView {
  declaredIntent: DeclaredIntent
  intentAlignment: IntentAlignment
  framingRisk: FramingRisk
  reasoning: string
  // Wurde die Empfehlungs-Rahmung durch den Intent verändert?
  // True, wenn intent-spezifischer Text aus RECOMMENDATION_BY_INTENT gegriffen
  // hat — false bei 'unspecified' oder Fallback auf RECOMMENDATION_TABLE.
  recommendationOverriddenByIntent: boolean
}
export type VisualDriverCode = 'CL' | 'BK' | 'WCG' | 'HDT' | 'MO' | 'GF' | 'DS' | 'NL' | 'MH'
export type DominantErrorType = 'physics' | 'anatomy' | 'context' | 'mixed' | 'none'
export type InputCompleteness = 'image_only' | 'image_prompt' | 'image_context' | 'full'

export type HintTopic =
  | 'physics'
  | 'anatomy'
  | 'context_logic'
  | 'role_stereotype'
  | 'body_stereotype'
  | 'gender_bias'
  | 'masking'
  | 'style_mismatch'
  | 'hallucination'

export type SignalGroup = 'gemini_dimension' | 'gemini_research' | 'external_aesthetic'

export type HintSeverity = 'high' | 'medium' | 'low'
export type SupportLevel = 'single' | 'cross_group'

export type RecommendationCluster =
  | 'image_integrity'
  | 'bias_representation'
  | 'masking_style'
  | 'hallucination'

// Verwendungsform (usage_form): zweite, vom declared_intent unabhängige
// Eingabe-Achse. Beschreibt den vom Nutzer erklärten Einsatzzweck — NICHT
// den vom LLM erkannten Bildstil. Bewusst Frontend-only (geht nicht in die
// Pipeline/das LLM), steuert ausschliesslich die Strenge-Einordnung der
// Empfehlung über ein Tier-Mapping. Ersetzt die frühere, fehlerhafte
// Leseart→Zweck-Inferenz (isAdContext).
export type UsageForm =
  | 'advertising'
  | 'editorial'
  | 'header'
  | 'symbol'
  | 'illustration'
  | 'mood'
  | 'social'
export type UsageTier = 'high_bar' | 'standard' | 'informal'

export interface ConcreteFinding {
  text: string
  severity: 'moderate' | 'severe'
  dimension: 'physics' | 'semantics' | 'bias'
}

export interface ConsolidatedHint {
  topic: HintTopic | 'bias_combined'
  severity: HintSeverity
  supportLevel: SupportLevel
  signalGroups: SignalGroup[]
  signals: string[]
  text: string
  dimension?: 'physics' | 'semantics' | 'bias'
  concreteFindings?: ConcreteFinding[]
}

export interface OverallVerdict {
  status: DimensionStatus
  headline: string
  recommendation: string
  dominantCluster: RecommendationCluster | null
}

export interface DimensionView {
  score: number
  status: DimensionStatus
}

export interface ReadingModeView {
  code: ReadingModeCode
  label: string
}

export interface VisualDriverView {
  code: VisualDriverCode
  label: string
}

export interface BiasAxesSummary {
  count: number
  maxRisk: RiskLevel | 'none'
}

export interface DebugView {
  sonnetAesthetic: number
  v25Aesthetic: number | null
  v25Raw: number | null
  integrityScore: number
  rawJson: SemanticAnalysisResult
  meta: SemanticAnalysisResult['meta']
  laionError: string | null
  durationMs: number
  modelLabel: string
  aestheticModelLabel: string | null
  // CLIP-Alignment (Modal, vierter Call). null = nicht verfuegbar (alter JSON
  // ohne CLIP-Feld, oder Fehler — dann steckt der Fehler in clipError).
  clipSkipped: boolean | null
  clipPromptCosine: number | null
  clipContextCosine: number | null
  clipPromptTruncated: boolean | null
  clipContextTruncated: boolean | null
  clipPromptTokenCount: number | null
  clipContextTokenCount: number | null
  clipModel: string | null
  clipDurationMs: number | null
  clipError: string | null
}

export interface AnalysisViewModel {
  overallVerdict: OverallVerdict
  // O-2-Typ-Vorbereitung (contract.md §2c): integrityScore wird in Etappe 5 aus
  // debug.integrityScore ins Top-Level gehoben (= eindeutige Hero-Score-Quelle).
  // NUR Darstellung (Hero-Zahl + ScoreBar-Marker via severityFor) – NIE
  // Verdict-Logik. Hier bereits typisiert (nie null, kontraktkonform), damit
  // BefundKarte + contract/fixtures konsistent sind; die Befüllung erfolgt im
  // buildAnalysisViewModel-Port (Etappe 5, identisch zu debug.integrityScore).
  integrityScore: number
  userHints: ConsolidatedHint[]
  hiddenHints: ConsolidatedHint[]
  hasContextWarning: boolean
  aestheticCombined: number
  aestheticDivergent: boolean
  aestheticDelta: number
  aestheticFallbackOnly: boolean
  dimensions: {
    physics: DimensionView
    semantics: DimensionView
    bias: DimensionView
  }
  readingMode: ReadingModeView
  visualDrivers: VisualDriverView[]
  hintsSortedBySeverity: ContextReviewHint[]
  hintsCountBySeverity: { high: number; medium: number; low: number }
  maskingVerdict: MaskingVerdict
  maskingScore: number
  inputCompleteness: InputCompleteness
  dominantErrorType: DominantErrorType
  biasAxesSummary: BiasAxesSummary
  intentAssessment: IntentAssessmentView
  // Kurzer Hinweis-Text neben der Empfehlung, wenn der declared_intent die
  // Empfehlungs-Rahmung verändert hat (Transparenz: User soll sehen, dass die
  // Empfehlung intent-sensitiv ist). null wenn declared_intent='unspecified'
  // oder kein Override aktiv. Render-Hinweis: als separater Block unter der
  // Empfehlung, nicht in userHints — sonst Vue-Key-Konflikte mit echten Topics.
  intentRecommendationNote: string | null
  // Phase-7-Pass-through. Analoge Behandlung wie intentAssessment: kein
  // Einfluss auf den Verdict-Status, nur Anzeige + Note.
  normativeMasking: NormativeMaskingView
  // Separater Render-Block analog zu intentRecommendationNote. Befüllt bei
  // normative_masking.verdict ∈ {medium, high}. null sonst. Intent-spezifisch
  // beim verdict='high', mit Suffix bei doppelter Maskierung (faktisch + normativ).
  normativeMaskingNote: string | null
  // Separater Render-Block analog zu normativeMaskingNote. Ordnet die
  // Empfehlung in die vom Nutzer erklärte Verwendungsform ein (Strenge-Tier).
  // null bei status='green', bei dominantem bias_representation-Cluster
  // (Bias wird durch keine Verwendungsform entlastet) oder wenn keine
  // Verwendungsform übergeben wurde. Kein Einfluss auf Status/Headline.
  usageFormNote: string | null
  debug: DebugView
}
