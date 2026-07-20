import { computed, type Ref, type ComputedRef } from 'vue'
import type { SemanticAnalysisResult } from '@pipeline/analyze'
import type { ContextReviewHint } from '@pipeline/context-hints'
import { composeMaskingReviewNote } from '@pipeline/masking-note'
import { readingModeLabel, visualDriverLabel } from '@pipeline/vocab'

export type DimensionStatus = 'green' | 'yellow' | 'red'
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
  // Beschreibender Maskierungs-Hinweis (ersetzt maskingScore/maskingVerdict,
  // Rückbau 2026-06-10). null = keine validierten Verknüpfungen oder Alt-JSON.
  maskingReviewNote: SemanticAnalysisResult['masking_review_note']
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

const DIVERGENCE_THRESHOLD = 20
const SEVERITY_ORDER: Record<ContextReviewHint['severity'], number> = { high: 0, medium: 1, low: 2 }
const RISK_RANK: Record<RiskLevel, number> = { low: 1, medium: 2, high: 3 }

const SEVERITY_RANK: Record<HintSeverity, number> = { high: 3, medium: 2, low: 1 }
const SUPPORT_RANK: Record<SupportLevel, number> = { cross_group: 2, single: 1 }

const TOPIC_PRIORITY: Record<ConsolidatedHint['topic'], number> = {
  context_logic: 9,
  bias_combined: 8,
  role_stereotype: 7,
  body_stereotype: 6,
  gender_bias: 5,
  anatomy: 4,
  physics: 3,
  masking: 2,
  style_mismatch: 1,
  hallucination: 0,
}

// Hinweis: Eine frühere, werbe-/magazin-spezifische Topic-Priorisierung
// (TOPIC_PRIORITY_AD) wurde entfernt — sie schob Bias-Topics im Werbe-Kontext
// nach hinten und drängte sie damit aus der Sichtbarkeit. Da Werbeästhetik laut
// Thesis ein Maskierungsmechanismus ist (kein Entlastungsgrund), gilt jetzt für
// alle Lesearten dieselbe Priorisierung (TOPIC_PRIORITY).

const TOPIC_TEXT: Record<ConsolidatedHint['topic'], string> = {
  physics: 'Mögliche Physik-Auffälligkeit (Licht/Schatten/Material) – sichtprüfen.',
  anatomy: 'Mögliche Anatomie-Auffälligkeit (Hände, Gesicht, Proportionen) – sichtprüfen.',
  context_logic: 'Szenenlogik wirkt nicht ganz schlüssig – prüfen, ob das Bild zum Beitragsthema passt.',
  role_stereotype: 'Mögliche stereotype Rollendarstellung – kritisch lesen.',
  body_stereotype: 'Mögliche stereotype Körperdarstellung (Idealisierung).',
  gender_bias: 'Geschlechterverteilung wirkt einseitig – prüfen, ob das beabsichtigt ist.',
  masking: 'Die schöne Oberfläche könnte Fehler überdecken – Details prüfen.',
  style_mismatch: 'Der Bildstil wirkt sehr werbe-/magazinhaft – passt das zum redaktionellen Kontext?',
  hallucination: 'Hinweise auf halluzinierte oder vom Prompt abweichende Inhalte.',
  bias_combined: 'Mehrere Bias-Indikatoren erkannt – kritisch lesen.',
}

const TOPIC_TO_CLUSTER: Record<ConsolidatedHint['topic'], RecommendationCluster> = {
  physics: 'image_integrity',
  anatomy: 'image_integrity',
  context_logic: 'image_integrity',
  role_stereotype: 'bias_representation',
  body_stereotype: 'bias_representation',
  gender_bias: 'bias_representation',
  bias_combined: 'bias_representation',
  masking: 'masking_style',
  style_mismatch: 'masking_style',
  hallucination: 'hallucination',
}

const VERDICT_HEADLINES: Record<DimensionStatus, string> = {
  green: 'Kann publiziert werden.',
  yellow: 'Würde ich nochmal prüfen.',
  red: 'Besser nicht in dieser Form verwenden.',
}

const RECOMMENDATION_TABLE: Record<
  DimensionStatus,
  Partial<Record<RecommendationCluster | 'null', string>>
> = {
  green: {
    null: 'Aus Tool-Sicht keine kritischen Hinweise. Das letzte Urteil bleibt bei dir.',
  },
  yellow: {
    null: 'Es sind ein paar Punkte aufgefallen – eine zweite Meinung lohnt sich.',
    image_integrity: 'Würde die Bildqualität nochmal sichtprüfen, bevor publiziert wird.',
    bias_representation: 'Würde die Personen- und Rollendarstellung kritisch lesen.',
    masking_style: 'Das Bild wirkt visuell überzeugend – Stil und Details prüfen, ob etwas übersehen wird.',
    hallucination: 'Es gibt Hinweise, dass Bildinhalte vom Prompt abweichen – inhaltlich gegenprüfen.',
  },
  red: {
    null: 'Kritische Hinweise – bitte vor der Publikation klären.',
    image_integrity: 'Sichtbare Bildfehler – anderes Bild wählen oder neu generieren.',
    bias_representation: 'Kritische Bias-Hinweise – Personendarstellung überprüfen oder anderes Bild wählen.',
    masking_style: 'Bild wirkt täuschend überzeugend, mehrere Auffälligkeiten – bitte nicht in dieser Form verwenden.',
    hallucination: 'Bildinhalte weichen vom Prompt ab – bitte nicht in dieser Form verwenden.',
  },
}

// Intent-sensitive Empfehlungs-Rahmung: 'affirmative', 'critical' und
// 'illustrative' erhalten je eigene Texte. 'unspecified' fällt auf die
// neutrale Tabelle (RECOMMENDATION_TABLE) zurück.
// Der Verdict-Status (grün/gelb/rot) bleibt in jedem Fall aus dem Codebook +
// Reconcile-Layer; Intent ändert NUR den Text. Die Texte sind bewusst
// personen-agnostisch formuliert, damit sie auch für Bilder ohne Menschen
// (Stillleben, Grafiken, abstrakte Motive) tragen. Anmerkung: der
// bias_representation-Cluster zielt aktuell auf personenbezogene Bias-Muster
// (Rolle/Körper/Geschlecht); für nicht-menschliche Bias-Achsen (z.B.
// kulturelle Symbolik in Stilllebenkomposition) müsste die Cluster-Definition
// später nachgeschärft werden — ist hier kein Blocker, weil solche Bilder
// den Cluster derzeit selten als dominant bekommen.
const RECOMMENDATION_BY_INTENT: Record<
  'affirmative' | 'critical' | 'illustrative',
  Record<DimensionStatus, Partial<Record<RecommendationCluster | 'null', string>>>
> = {
  affirmative: {
    green: {
      null: 'Keine Hinweise. Bild eignet sich für eine bestätigende Untermalung des Themas.',
    },
    yellow: {
      null: 'Befunde aufgefallen – vor einer bestätigenden Verwendung prüfen, ob sie der gewünschten Aussage im Weg stehen.',
      image_integrity: 'Bildqualitäts-Hinweise – eine bestätigende Verwendung wirkt nur, wenn diese Punkte geprüft und unkritisch sind.',
      bias_representation: 'Bild trägt Bias-Hinweise. Bei bestätigender Verwendung wird das Muster mitgesendet – Bias bewusst markieren oder anderes Bild wählen.',
      masking_style: 'Bild wirkt visuell überzeugend – bestätigende Verwendung möglich, aber prüfen, ob die glatte Oberfläche Befunde überdeckt.',
      hallucination: 'Bildinhalte weichen vom Prompt ab – bestätigende Verwendung würde die Abweichung als Tatsache präsentieren.',
    },
    red: {
      null: 'Substantielle Befunde – als bestätigende Untermalung ungeeignet.',
      image_integrity: 'Sichtbare Bildfehler – würden in bestätigender Verwendung wie eine versteckte Schwäche wirken. Anderes Bild wählen.',
      bias_representation: 'Substantieller Bias-Befund – als bestätigende Untermalung ungeeignet, würde das Muster zur Botschaft machen.',
      masking_style: 'Bild wirkt zu glatt für die Hinweise im Bild – eine bestätigende Verwendung würde diese Spannung kaschieren.',
      hallucination: 'Bildinhalte weichen vom Prompt ab – eine bestätigende Verwendung würde die Abweichung als Tatsache präsentieren.',
    },
  },
  critical: {
    green: {
      null: 'Keine kritischen Hinweise. Mit kritischer Bildunterschrift / Rahmung publizierbar – die Distanzierung muss vom Text kommen, nicht vom Bild.',
    },
    yellow: {
      null: 'Im kritischen Kontext nur verwendbar, wenn die Bildunterschrift den geprüften Punkt explizit benennt – ohne Distanzierung kippt die Lesart ins Affirmative.',
      image_integrity: 'Bildqualitätsfehler – passen NICHT zur kritischen Einordnung. Anderes Bild wählen oder neu generieren.',
      bias_representation: 'Kann im kritischen Kontext als Beleg dienen – ABER nur, wenn das Bias-Muster im Begleittext explizit benannt und distanziert wird. Sonst kippt es ins Affirmative.',
      masking_style: 'Visuell überzeugend – im kritischen Kontext riskant, weil die glatte Oberfläche das Muster verharmlosen kann. Bildunterschrift braucht klare Distanzierung.',
      hallucination: 'Halluzinierte Inhalte – auch in kritischer Rahmung problematisch (Faktentreue). Anderes Bild verwenden.',
    },
    red: {
      null: 'Kritische Befunde – auch in kritischer Rahmung vor Publikation klären.',
      image_integrity: 'Sichtbare Bildfehler – auch eine kritische Bildunterschrift macht diese Fehler nicht zur Botschaft. Anderes Bild wählen.',
      bias_representation: 'Befund ist substantiell – als kritischer Beleg potenziell verwendbar, aber NUR mit eindeutiger Distanzierung im Begleittext. Ohne diese Distanzierung verstärkt das Bild das Muster.',
      masking_style: 'Bild wirkt täuschend überzeugend – im kritischen Kontext muss die Distanzierung sehr explizit sein, sonst wirkt es affirmativ.',
      hallucination: 'Bildinhalte weichen vom Prompt ab – auch in kritischer Rahmung Faktentreue gefährdet.',
    },
  },
  illustrative: {
    green: {
      null: 'Keine kritischen Hinweise – als neutrales Beispiel verwendbar.',
    },
    yellow: {
      null: 'Punkte aufgefallen – als „neutrales Beispiel" zu deklarieren wird schwierig, solange die Auffälligkeiten nicht geprüft sind.',
      image_integrity: 'Sichtbare Bildfehler stören die illustrative Wirkung – sauberes Bild wählen.',
      bias_representation: 'Stereotypisierung im illustrativen Material lenkt vom Thema ab – neutraleres Bild wählen.',
      masking_style: 'Visuell auffällig – für eine illustrative Verwendung sind sachlichere Bilder geeigneter.',
      hallucination: 'Halluzinierte Inhalte machen das Bild als illustratives Beispiel unbrauchbar – anderes Bild wählen.',
    },
    red: {
      null: 'Kritische Befunde – als neutrales Beispiel nicht geeignet.',
      image_integrity: 'Sichtbare Bildfehler – eignet sich nicht als illustratives Beispiel.',
      bias_representation: 'Trotz illustrativer Absicht: Befund ist substantiell. Bild eignet sich nicht als neutrales Beispiel.',
      masking_style: 'Bild wirkt täuschend überzeugend – als illustratives Beispiel würde es die thematische Neutralität untergraben.',
      hallucination: 'Bildinhalte weichen vom Prompt ab – als illustratives Beispiel ungeeignet.',
    },
  },
}

// Phase-7-Notes (normative Maskierung). Bewusst SEPARAT von
// RECOMMENDATION_BY_INTENT gehalten — die Hauptempfehlung bleibt
// Codebook-getrieben (Status-Isolation), die normative Wirkung kommt als
// eigene Note. Reihenfolge:
//   verdict='high': intent-spezifischer Text. Wenn faktische Maskierung
//                   ebenfalls ≥medium, wird der Doppel-Maskierungs-Suffix
//                   angehängt.
//   verdict='medium': kurzer generischer Hinweis (intent-unabhängig).
//   verdict='low' oder 'not_applicable': null (keine Note).
// Personen-agnostisch formuliert. Aspect-Chips werden im UI eigenständig
// gerendert und im Text NICHT genannt (vermeidet implizite Gruppen-
// zuschreibung).
const NORMATIVE_HIGH_INTENT_NOTES: Record<DeclaredIntent, string> = {
  affirmative:
    'Normwirkung im Begleittext transparent machen – sie ist nicht automatisch ein Ausschlussgrund.',
  critical:
    'Normwirkung ist hier der analytische Befund – im Begleittext explizit als zu kritisierender Mechanismus benennen.',
  illustrative:
    'Als neutrales Beispiel ungeeignet – Kontextualisierung/Captioning empfohlen, das die Idealisierung benennt.',
  unspecified:
    'Bild propagiert eine idealisierte Norm. Vor Verwendung prüfen, ob das in den Kontext passt.',
}

const NORMATIVE_MEDIUM_NOTE =
  'Bild zeigt erkennbare idealisierende Ästhetik mit normativer Wirkung – im Begleittext bewusst rahmen.'

// Der frühere Doppel-Maskierungs-Suffix hing am faktischen masking_verdict —
// mit dem Score-Rückbau (2026-06-10) entfernt.
function computeNormativeMaskingNote(
  verdict: NormativeMaskingVerdict,
  declaredIntent: DeclaredIntent,
): string | null {
  if (verdict === 'high') {
    return NORMATIVE_HIGH_INTENT_NOTES[declaredIntent]
  }
  if (verdict === 'medium') {
    return NORMATIVE_MEDIUM_NOTE
  }
  return null
}

// Verwendungsform → Strenge-Tier. Drei Stufen statt sieben Einzelwerte, damit
// die Note-Matrix klein bleibt. Das Tier moduliert NUR die handwerklich/faktische
// Strenge (Physik, Anatomie, Halluzination, Stil) — Bias/Repräsentation wird in
// KEINEM Tier entlastet (siehe cluster-aware Null-Regel in computeUsageFormNote).
const USAGE_FORM_TO_TIER: Record<UsageForm, UsageTier> = {
  advertising: 'high_bar',
  editorial: 'high_bar',
  header: 'standard',
  symbol: 'standard',
  illustration: 'standard',
  mood: 'informal',
  social: 'informal',
}

// Modulierende Note zur Verwendungsform. Separat von der Hauptempfehlung
// (Pattern wie NORMATIVE_*-Notes). Ordnet die Strenge im erklärten Einsatz ein,
// widerspricht aber nie dem Status. green hat keinen Eintrag → Note = null.
const USAGE_TIER_NOTES: Record<UsageTier, Partial<Record<DimensionStatus, string>>> = {
  high_bar: {
    yellow: 'Für den erklärten Einsatz (Werbung/Editorial) gilt eine hohe Latte – die aufgefallenen Punkte vor Publikation gezielt klären.',
    red: 'Im erklärten Einsatz (Werbung/Editorial) sind sichtbare Befunde disqualifizierend – in dieser Form nicht geeignet.',
  },
  standard: {
    yellow: 'Für den erklärten Einsatz redaktionell üblich – die Punkte prüfen, ob sie im konkreten Beitrag stören.',
    red: 'Auch für den erklärten Einsatz sind diese Befunde kritisch – vor Verwendung klären.',
  },
  informal: {
    yellow: 'Für den erklärten Einsatz (Mood/Social) sind handwerkliche Mikro-Auffälligkeiten eher tolerierbar – inhaltliche Befunde bleiben relevant.',
    red: 'Auch im informellen Einsatz (Mood/Social) bleiben diese Befunde gewichtig – die Toleranz für Stil ersetzt keine inhaltliche Prüfung.',
  },
}

// Erzeugt die usageFormNote. Null-Regeln:
//   - status='green' → keine Note (nichts zu rahmen).
//   - dominanter Cluster 'bias_representation' → keine Note. Bias wird durch
//     KEINE Verwendungsform entlastet (Doktrin: Werbeästhetik ist
//     Maskierungsmechanismus, kein Entlastungsgrund). Die handwerkliche
//     Toleranz-Formulierung der informal/standard-Tiers darf hier nie greifen.
//   - sonst (image_integrity / hallucination / masking_style / kein dominanter
//     Cluster) → Tier-Note für yellow/red.
function computeUsageFormNote(
  tier: UsageTier,
  status: DimensionStatus,
  dominantCluster: RecommendationCluster | null,
): string | null {
  if (status === 'green') return null
  if (dominantCluster === 'bias_representation') return null
  return USAGE_TIER_NOTES[tier][status] ?? null
}

const KEYWORD_PATTERNS: Record<'anatomy' | 'role' | 'body' | 'gender' | 'hallucination', RegExp> = {
  // anatomy: 1:1 vom Backend src/analyze.ts ANATOMY_KEYWORDS + zusätzlich `anatom`
  anatomy: /\b(anatom|finger|hand|hände|gesicht|antlitz|face|proport|gliedmass|extremit|limb|arm|fuss|fuß|leg)/i,
  role: /\b(role|rolle|beruf|occupat|job|position|profession|status)/i,
  body: /\b(body|körper|koerper|build|figur|physique|ideal|attract|schön|schoen)/i,
  gender: /\b(gender|geschlecht|female|male|frau|mann|woman|men)/i,
  hallucination: /\b(halluc|prompt|abweich|invented|fabric|erfunden|nicht\s+vorhanden)/i,
}

function matchesKeyword(text: string | null | undefined, kind: keyof typeof KEYWORD_PATTERNS): boolean {
  if (!text) return false
  return KEYWORD_PATTERNS[kind].test(text)
}

interface Finding {
  finding: string
  severity: 'minor' | 'moderate' | 'severe'
  category: string
}

const PLACEHOLDER_PATTERNS = [
  /^\s*(noch\s+zu\s+pr[üu]fen|noch\s+unklar|needs?\s+(review|checking)|unclear\s+issue|tbd|to\s+be\s+(determined|reviewed)|no\s+(specific|concrete)\s+finding)\s*\.?\s*$/i,
  /^\s*(siehe|see)\s+(oben|above|below|details?)\s*\.?\s*$/i,
  /^\s*-+\s*$/,
]

function hasSubstance(finding: Finding): boolean {
  const text = finding.finding.trim()
  if (text.length < 10) return false
  if (PLACEHOLDER_PATTERNS.some(rx => rx.test(text))) return false
  return true
}

function severeFindingsInDim(findings: Finding[]): Finding[] {
  return findings.filter(f => f.severity === 'severe' && hasSubstance(f))
}

function moderateFindingsInDim(findings: Finding[]): Finding[] {
  return findings.filter(f => f.severity === 'moderate' && hasSubstance(f))
}

const CONCRETE_FINDING_MAX_LEN = 180
const CONCRETE_FINDING_MAX_PER_TOPIC = 2

function truncateFinding(text: string): string {
  const t = text.trim()
  if (t.length <= CONCRETE_FINDING_MAX_LEN) return t
  // An der letzten Wortgrenze vor dem Limit kappen — sonst endet der Text mitten
  // im Wort und wirkt wie abgeschnitten ("als wäre kein Platz mehr da"). Der
  // 0.6-Schutz greift bei extrem langen Einzelwörtern (dann hart kappen).
  const cut = t.slice(0, CONCRETE_FINDING_MAX_LEN)
  const lastWs = Math.max(cut.lastIndexOf(' '), cut.lastIndexOf('\n'), cut.lastIndexOf('\t'))
  const base = lastWs > CONCRETE_FINDING_MAX_LEN * 0.6 ? cut.slice(0, lastWs) : cut
  return `${base.trimEnd()}…`
}

function pickConcreteFindings(
  findings: Finding[],
  dimension: 'physics' | 'semantics' | 'bias',
  filter?: (f: Finding) => boolean,
): ConcreteFinding[] {
  const candidates = findings.filter(f => {
    if (f.severity !== 'moderate' && f.severity !== 'severe') return false
    if (!hasSubstance(f)) return false
    if (filter && !filter(f)) return false
    return true
  })
  // severe vor moderate, dann ursprüngliche Reihenfolge erhalten
  candidates.sort((a, b) => {
    if (a.severity === b.severity) return 0
    return a.severity === 'severe' ? -1 : 1
  })
  return candidates.slice(0, CONCRETE_FINDING_MAX_PER_TOPIC).map(f => ({
    text: truncateFinding(f.finding),
    severity: f.severity as 'moderate' | 'severe',
    dimension,
  }))
}

interface TopicSignal {
  text: string
  group: SignalGroup
}

function evaluateTopic(
  topic: HintTopic,
  ctx: AnalysisContext,
): ConsolidatedHint | null {
  const dim = ctx.dim
  const codebook = ctx.codebook
  const axes = ctx.axes
  const ruleHints = ctx.ruleHints

  const signals: TopicSignal[] = []

  const addRule = (id: string) => {
    if (ruleHints.some(h => h.id === id)) signals.push({ text: `rule:${id}`, group: 'gemini_research' })
  }

  switch (topic) {
    case 'physics': {
      if (dim.physics.status === 'red' || dim.physics.status === 'yellow') {
        signals.push({ text: `dim.physics.status=${dim.physics.status}`, group: 'gemini_dimension' })
      }
      const sev = severeFindingsInDim(dim.physics.findings).filter(
        f => !matchesKeyword(f.category + ' ' + f.finding, 'anatomy'),
      )
      if (sev.length > 0) {
        signals.push({ text: `dim.physics.findings.severe×${sev.length}`, group: 'gemini_dimension' })
      }
      if (codebook.has_physics_issue) {
        signals.push({ text: 'codebook.has_physics_issue=true', group: 'gemini_research' })
      }
      addRule('physics_finding_review')
      break
    }
    case 'anatomy': {
      const sev = severeFindingsInDim(dim.physics.findings).filter(
        f => matchesKeyword(f.category + ' ' + f.finding, 'anatomy'),
      )
      if (sev.length > 0) {
        signals.push({ text: `dim.physics.findings.anatomy.severe×${sev.length}`, group: 'gemini_dimension' })
      }
      if (codebook.has_anatomy_issue) {
        signals.push({ text: 'codebook.has_anatomy_issue=true', group: 'gemini_research' })
      }
      addRule('anatomy_finding_review')
      break
    }
    case 'context_logic': {
      if (dim.semantics.status === 'red' || dim.semantics.status === 'yellow') {
        signals.push({ text: `dim.semantics.status=${dim.semantics.status}`, group: 'gemini_dimension' })
      }
      const sev = severeFindingsInDim(dim.semantics.findings)
      if (sev.length > 0) {
        signals.push({ text: `dim.semantics.findings.severe×${sev.length}`, group: 'gemini_dimension' })
      }
      if (codebook.has_context_issue) {
        signals.push({ text: 'codebook.has_context_issue=true', group: 'gemini_research' })
      }
      addRule('context_finding_review')
      break
    }
    case 'role_stereotype': {
      if (dim.bias.status === 'red' || dim.bias.status === 'yellow') {
        signals.push({ text: `dim.bias.status=${dim.bias.status}`, group: 'gemini_dimension' })
      }
      const sev = severeFindingsInDim(dim.bias.findings).filter(
        f => matchesKeyword(f.category + ' ' + f.finding, 'role'),
      )
      if (sev.length > 0) {
        signals.push({ text: `dim.bias.findings.role.severe×${sev.length}`, group: 'gemini_dimension' })
      }
      if (codebook.has_role_stereotype) {
        signals.push({ text: 'codebook.has_role_stereotype=true', group: 'gemini_research' })
      }
      const axisMatch = axes.some(a => a.risk_level === 'high' && matchesKeyword(a.label, 'role'))
      if (axisMatch) {
        signals.push({ text: 'bias_axes.role.high', group: 'gemini_research' })
      }
      addRule('role_stereotype_review')
      break
    }
    case 'body_stereotype': {
      const sev = severeFindingsInDim(dim.bias.findings).filter(
        f => matchesKeyword(f.category + ' ' + f.finding, 'body'),
      )
      if (sev.length > 0) {
        signals.push({ text: `dim.bias.findings.body.severe×${sev.length}`, group: 'gemini_dimension' })
      }
      const intensity = codebook.stereotype_intensity
      if (codebook.has_body_stereotype && (intensity === 'medium' || intensity === 'high')) {
        signals.push({ text: `codebook.has_body_stereotype=true(intensity=${intensity})`, group: 'gemini_research' })
      }
      const axisMatch = axes.some(a => a.risk_level === 'high' && matchesKeyword(a.label, 'body'))
      if (axisMatch) {
        signals.push({ text: 'bias_axes.body.high', group: 'gemini_research' })
      }
      break
    }
    case 'gender_bias': {
      const sev = severeFindingsInDim(dim.bias.findings).filter(
        f => matchesKeyword(f.category + ' ' + f.finding, 'gender'),
      )
      if (sev.length > 0) {
        signals.push({ text: `dim.bias.findings.gender.severe×${sev.length}`, group: 'gemini_dimension' })
      }
      if (codebook.has_gender_bias) {
        signals.push({ text: 'codebook.has_gender_bias=true', group: 'gemini_research' })
      }
      const axisMatch = axes.some(a => a.risk_level === 'high' && matchesKeyword(a.label, 'gender'))
      if (axisMatch) {
        signals.push({ text: 'bias_axes.gender.high', group: 'gemini_research' })
      }
      break
    }
    case 'masking': {
      // F1-Gate (Codex-Review 2026-06-10): ohne validierte Treiber↔Befund-Verknüpfung
      // kein Maskierungs-Topic — «Dimension auffällig + hohe Ästhetik» allein war die
      // widerlegte Score-Logik. Der Rule-Hint masking_attention_risk wurde aus
      // src/context-hints.ts entfernt.
      if (ctx.maskingEvidenceCount === 0) break
      signals.push({ text: `masking_evidence×${ctx.maskingEvidenceCount}`, group: 'gemini_research' })
      const anyDimAuffaellig =
        dim.physics.status !== 'green' || dim.semantics.status !== 'green' || dim.bias.status !== 'green'
      if (anyDimAuffaellig) {
        signals.push({ text: 'any_dim.status≠green', group: 'gemini_dimension' })
      }
      if (ctx.aestheticCombined >= 75) {
        signals.push({ text: `aesthetic_combined=${ctx.aestheticCombined}`, group: 'external_aesthetic' })
      }
      break
    }
    case 'style_mismatch': {
      const mode = ctx.readingMode
      if (mode === 'WA' || mode === 'MI') {
        signals.push({ text: `reading_mode=${mode}`, group: 'gemini_research' })
      }
      if (ctx.aestheticCombined >= 80) {
        signals.push({ text: `aesthetic_combined=${ctx.aestheticCombined}`, group: 'external_aesthetic' })
      }
      addRule('stock_aesthetic_risk')
      break
    }
    case 'hallucination': {
      if (codebook.hallucination_present) {
        signals.push({ text: 'codebook.hallucination_present=true', group: 'gemini_research' })
      }
      if (codebook.resistance_to_prompt) {
        signals.push({ text: 'codebook.resistance_to_prompt=true', group: 'gemini_research' })
      }
      break
    }
  }

  if (signals.length === 0) return null

  const groups = Array.from(new Set(signals.map(s => s.group)))
  const supportLevel: SupportLevel = groups.length >= 2 ? 'cross_group' : 'single'

  let severity: HintSeverity = 'low'
  const dimMap: Record<HintTopic, 'physics' | 'semantics' | 'bias' | undefined> = {
    physics: 'physics',
    anatomy: 'physics',
    context_logic: 'semantics',
    role_stereotype: 'bias',
    body_stereotype: 'bias',
    gender_bias: 'bias',
    masking: undefined,
    style_mismatch: undefined,
    hallucination: undefined,
  }
  const dimKey = dimMap[topic]
  if (dimKey && dim[dimKey].status === 'red') severity = 'high'
  else if (signals.some(s => s.text.includes('findings.') && s.text.includes('severe'))) severity = 'high'
  else if (dimKey && dim[dimKey].status === 'yellow') severity = 'medium'
  else if (
    signals.some(s =>
      s.text.startsWith('codebook.') ||
      s.text.startsWith('bias_axes.') ||
      s.text.includes('masking_evidence') ||
      s.text.includes('reading_mode='),
    )
  )
    severity = 'medium'

  // Concrete findings — gefiltert nach Topic, nur moderate+/severe substantielle Texte,
  // max 2 pro Topic. WICHTIG: das beeinflusst die Sichtbarkeits-Regel NICHT — Findings
  // erscheinen nur als Subtext unter Topics, die ohnehin schon sichtbar sind.
  let concreteFindings: ConcreteFinding[] | undefined
  switch (topic) {
    case 'physics':
      concreteFindings = pickConcreteFindings(
        dim.physics.findings,
        'physics',
        f => !matchesKeyword(`${f.category} ${f.finding}`, 'anatomy'),
      )
      break
    case 'anatomy':
      concreteFindings = pickConcreteFindings(
        dim.physics.findings,
        'physics',
        f => matchesKeyword(`${f.category} ${f.finding}`, 'anatomy'),
      )
      break
    case 'context_logic':
      concreteFindings = pickConcreteFindings(dim.semantics.findings, 'semantics')
      break
    case 'role_stereotype':
      concreteFindings = pickConcreteFindings(
        dim.bias.findings,
        'bias',
        f => matchesKeyword(`${f.category} ${f.finding}`, 'role'),
      )
      break
    case 'body_stereotype':
      concreteFindings = pickConcreteFindings(
        dim.bias.findings,
        'bias',
        f => matchesKeyword(`${f.category} ${f.finding}`, 'body'),
      )
      break
    case 'gender_bias':
      concreteFindings = pickConcreteFindings(
        dim.bias.findings,
        'bias',
        f => matchesKeyword(`${f.category} ${f.finding}`, 'gender'),
      )
      break
    case 'hallucination':
      concreteFindings = pickConcreteFindings(
        dim.semantics.findings,
        'semantics',
        f => matchesKeyword(`${f.category} ${f.finding}`, 'hallucination'),
      )
      break
    case 'masking':
    case 'style_mismatch':
      // abgeleitete Befunde ohne direkte LLM-Finding-Quelle — UI zeigt nur Topic-Text
      concreteFindings = undefined
      break
  }
  if (concreteFindings && concreteFindings.length === 0) concreteFindings = undefined

  return {
    topic,
    severity,
    supportLevel,
    signalGroups: groups,
    signals: signals.map(s => s.text),
    text: TOPIC_TEXT[topic],
    dimension: dimKey,
    concreteFindings,
  }
}

interface AnalysisContext {
  dim: {
    physics: { status: DimensionStatus; findings: Finding[] }
    semantics: { status: DimensionStatus; findings: Finding[] }
    bias: { status: DimensionStatus; findings: Finding[] }
  }
  codebook: SemanticAnalysisResult['analysis']['research_layer']['codebook']
  axes: SemanticAnalysisResult['analysis']['bias_axis_analysis']['axes']
  ruleHints: ContextReviewHint[]
  maskingEvidenceCount: number
  aestheticCombined: number
  readingMode: ReadingModeCode
}

function isVisible(hint: ConsolidatedHint): boolean {
  if (hint.supportLevel === 'cross_group') return true
  if (hint.severity === 'high') return true
  return false
}

function sortHints(
  hints: ConsolidatedHint[],
  moderateByTopic: Record<string, number>,
): ConsolidatedHint[] {
  return [...hints].sort((a, b) => {
    if (SEVERITY_RANK[a.severity] !== SEVERITY_RANK[b.severity]) {
      return SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]
    }
    if (SUPPORT_RANK[a.supportLevel] !== SUPPORT_RANK[b.supportLevel]) {
      return SUPPORT_RANK[b.supportLevel] - SUPPORT_RANK[a.supportLevel]
    }
    const modA = moderateByTopic[a.topic] ?? 0
    const modB = moderateByTopic[b.topic] ?? 0
    if (modA !== modB) return modB - modA
    return TOPIC_PRIORITY[b.topic] - TOPIC_PRIORITY[a.topic]
  })
}

function mergeBiasTopics(hints: ConsolidatedHint[], biasFindings: Finding[]): ConsolidatedHint[] {
  const biasTopics: HintTopic[] = ['role_stereotype', 'body_stereotype', 'gender_bias']
  const biasItems = hints.filter(h => biasTopics.includes(h.topic as HintTopic))
  if (biasItems.length < 2) return hints
  const mergedGroups = Array.from(new Set(biasItems.flatMap(h => h.signalGroups)))
  const mergedSupport: SupportLevel =
    biasItems.some(h => h.supportLevel === 'cross_group') || mergedGroups.length >= 2
      ? 'cross_group'
      : 'single'

  // ConcreteFindings mergen: dedupliziert über Text, severe vor moderate, max 2.
  // Codex-Fallback: wenn bias.findings moderate/severe substantielle Texte enthält,
  // die in keinem role/body/gender Keyword-Match landen, hier ergänzen.
  const seenTexts = new Set<string>()
  const mergedFindings: ConcreteFinding[] = []
  for (const item of biasItems) {
    for (const f of item.concreteFindings ?? []) {
      if (seenTexts.has(f.text)) continue
      seenTexts.add(f.text)
      mergedFindings.push(f)
    }
  }
  // Fallback: unmatched bias-Findings (substantielle moderate/severe ohne Keyword-Match)
  const unmatchedFallback = biasFindings.filter(f => {
    if (f.severity !== 'moderate' && f.severity !== 'severe') return false
    if (!hasSubstance(f)) return false
    const text = `${f.category} ${f.finding}`
    return !(
      matchesKeyword(text, 'role') ||
      matchesKeyword(text, 'body') ||
      matchesKeyword(text, 'gender')
    )
  })
  for (const f of unmatchedFallback) {
    const truncated = truncateFinding(f.finding)
    if (seenTexts.has(truncated)) continue
    seenTexts.add(truncated)
    mergedFindings.push({
      text: truncated,
      severity: f.severity as 'moderate' | 'severe',
      dimension: 'bias',
    })
  }
  mergedFindings.sort((a, b) => {
    if (a.severity === b.severity) return 0
    return a.severity === 'severe' ? -1 : 1
  })

  const merged: ConsolidatedHint = {
    topic: 'bias_combined',
    severity: biasItems.reduce<HintSeverity>(
      (max, h) => (SEVERITY_RANK[h.severity] > SEVERITY_RANK[max] ? h.severity : max),
      'low',
    ),
    supportLevel: mergedSupport,
    signalGroups: mergedGroups,
    signals: biasItems.flatMap(h => h.signals),
    text: TOPIC_TEXT.bias_combined,
    dimension: 'bias',
    concreteFindings: mergedFindings.length > 0
      ? mergedFindings.slice(0, CONCRETE_FINDING_MAX_PER_TOPIC)
      : undefined,
  }
  return [...hints.filter(h => !biasTopics.includes(h.topic as HintTopic)), merged]
}

function aggregateVerdict(
  hints: ConsolidatedHint[],
  visibleHints: ConsolidatedHint[],
  dim: AnalysisContext['dim'],
): { status: DimensionStatus; dominantCluster: RecommendationCluster | null } {
  const dimEntries: Array<[DimensionStatus, Finding[]]> = [
    [dim.physics.status, dim.physics.findings],
    [dim.semantics.status, dim.semantics.findings],
    [dim.bias.status, dim.bias.findings],
  ]

  const hasRedDimWithSevere = dimEntries.some(
    ([status, findings]) => status === 'red' && severeFindingsInDim(findings).length > 0,
  )
  const hasHighCrossGroup = visibleHints.some(
    h => h.severity === 'high' && h.supportLevel === 'cross_group',
  )

  let status: DimensionStatus = 'green'
  if (hasRedDimWithSevere || hasHighCrossGroup) {
    status = 'red'
  } else if (
    dimEntries.some(([s]) => s === 'red' || s === 'yellow') ||
    visibleHints.some(h => h.severity === 'high' || h.severity === 'medium')
  ) {
    status = 'yellow'
  }

  const dominant = visibleHints[0]
  const dominantCluster = dominant ? TOPIC_TO_CLUSTER[dominant.topic] : null

  return { status, dominantCluster }
}

function readFromTable(
  table: Partial<Record<RecommendationCluster | 'null', string>>,
  dominantCluster: RecommendationCluster | null,
): string | undefined {
  return (dominantCluster && table[dominantCluster]) || table.null
}

// Intent-sensitive Empfehlungs-Auswahl. Verdict-Status (status) und Cluster
// werden NICHT verändert — nur der Empfehlungstext. Reihenfolge:
//   1. Intent ∈ {affirmative, critical, illustrative} → RECOMMENDATION_BY_INTENT
//   2. 'unspecified' (oder defensiv jeder unbekannte Wert) → RECOMMENDATION_TABLE
// Die frühere Leseart-getriebene Werbe-Tabelle (isAdContext/RECOMMENDATION_TABLE_AD)
// wurde entfernt: die werbliche Strenge wird jetzt user-explizit über die
// Verwendungsform-Achse (usageFormNote) gerahmt, nicht aus dem Bildstil inferiert.
function pickRecommendation(
  status: DimensionStatus,
  dominantCluster: RecommendationCluster | null,
  declaredIntent: DeclaredIntent,
): { text: string; intentOverridden: boolean } {
  if (declaredIntent === 'affirmative' || declaredIntent === 'critical' || declaredIntent === 'illustrative') {
    const intentTable = RECOMMENDATION_BY_INTENT[declaredIntent][status]
    const text = readFromTable(intentTable, dominantCluster)
    if (text) return { text, intentOverridden: true }
  }
  // 'unspecified' und (Runtime-Guard) jeder ungültige Wert → neutrale Tabelle,
  // intentOverridden=false → keine Intent-Transparenz-Note.
  return {
    text: readFromTable(RECOMMENDATION_TABLE[status], dominantCluster) ?? 'Empfehlung verfügbar.',
    intentOverridden: false,
  }
}

function buildOverallVerdict(
  status: DimensionStatus,
  dominantCluster: RecommendationCluster | null,
  declaredIntent: DeclaredIntent,
): { verdict: OverallVerdict; intentOverridden: boolean } {
  const headline = VERDICT_HEADLINES[status]
  const { text, intentOverridden } = pickRecommendation(status, dominantCluster, declaredIntent)
  return {
    verdict: { status, headline, recommendation: text, dominantCluster },
    intentOverridden,
  }
}

export function buildAnalysisViewModel(
  result: SemanticAnalysisResult,
  usageForm?: UsageForm,
): AnalysisViewModel {
  const analysis = result.analysis
  const aesthetic = result.aesthetic
  const meta = result.meta

  const sonnet = aesthetic.aesthetic_score
  const v25 = meta.laion_aesthetic?.normalized ?? null
  const v25Raw = meta.laion_aesthetic?.raw_score ?? null

  const aestheticCombined = result.computed.aesthetic_combined
  const aestheticFallbackOnly = result.computed.aesthetic_combined_source === 'sonnet_only'
  const aestheticDelta = v25 !== null ? Math.abs(sonnet - v25) : 0
  const aestheticDivergent = v25 !== null && aestheticDelta >= DIVERGENCE_THRESHOLD

  const dim = analysis.dimension_analysis
  const dimensions = {
    physics: { score: dim.physics.score, status: dim.physics.status },
    semantics: { score: dim.semantics.score, status: dim.semantics.status },
    bias: { score: dim.bias.score, status: dim.bias.status },
  }

  // Labels deterministisch aus dem Code (src/vocab.ts) – die LLM-Label-Felder
  // wurden aus dem Schema entfernt (2026-07-20). web/ bleibt deutschsprachig.
  const readingMode: ReadingModeView = {
    code: analysis.research_layer.reading_mode,
    label: readingModeLabel(analysis.research_layer.reading_mode, 'de'),
  }

  const driverCodes = analysis.research_layer.visual_drivers
  const visualDrivers: VisualDriverView[] = driverCodes.map(code => ({
    code,
    label: visualDriverLabel(code, 'de'),
  }))

  const hintsSortedBySeverity = [...result.context_review_hints].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  )
  const hintsCountBySeverity = {
    high: hintsSortedBySeverity.filter(h => h.severity === 'high').length,
    medium: hintsSortedBySeverity.filter(h => h.severity === 'medium').length,
    low: hintsSortedBySeverity.filter(h => h.severity === 'low').length,
  }

  const ic = analysis.input_completeness
  const inputCompleteness: InputCompleteness =
    ic.usage_context && ic.original_prompt
      ? 'full'
      : ic.usage_context
        ? 'image_context'
        : ic.original_prompt
          ? 'image_prompt'
          : 'image_only'

  const axes = analysis.bias_axis_analysis.axes
  const maxRiskRank = axes.reduce((max, a) => Math.max(max, RISK_RANK[a.risk_level] ?? 0), 0)
  const biasAxesSummary: BiasAxesSummary = {
    count: axes.length,
    maxRisk: maxRiskRank === 3 ? 'high' : maxRiskRank === 2 ? 'medium' : maxRiskRank === 1 ? 'low' : 'none',
  }

  const ctx: AnalysisContext = {
    dim: {
      physics: { status: dim.physics.status, findings: dim.physics.findings },
      semantics: { status: dim.semantics.status, findings: dim.semantics.findings },
      bias: { status: dim.bias.status, findings: dim.bias.findings },
    },
    codebook: analysis.research_layer.codebook,
    axes,
    ruleHints: result.context_review_hints,
    maskingEvidenceCount: analysis.research_layer.masking_evidence?.length ?? 0,
    aestheticCombined,
    readingMode: readingMode.code,
  }

  const allTopics: HintTopic[] = [
    'physics',
    'anatomy',
    'context_logic',
    'role_stereotype',
    'body_stereotype',
    'gender_bias',
    'masking',
    'style_mismatch',
    'hallucination',
  ]

  const rawHints = allTopics
    .map(topic => evaluateTopic(topic, ctx))
    .filter((h): h is ConsolidatedHint => h !== null)

  const moderateByTopic: Record<string, number> = {}
  for (const dimKey of ['physics', 'semantics', 'bias'] as const) {
    for (const f of moderateFindingsInDim(dim[dimKey].findings)) {
      const topicGuess: HintTopic | null =
        dimKey === 'physics'
          ? matchesKeyword(f.category + ' ' + f.finding, 'anatomy')
            ? 'anatomy'
            : 'physics'
          : dimKey === 'semantics'
            ? 'context_logic'
            : matchesKeyword(f.category + ' ' + f.finding, 'role')
              ? 'role_stereotype'
              : matchesKeyword(f.category + ' ' + f.finding, 'body')
                ? 'body_stereotype'
                : matchesKeyword(f.category + ' ' + f.finding, 'gender')
                  ? 'gender_bias'
                  : null
      if (topicGuess) {
        moderateByTopic[topicGuess] = (moderateByTopic[topicGuess] ?? 0) + 1
      }
    }
  }

  const mergedHints = mergeBiasTopics(rawHints, dim.bias.findings)
  const sortedHints = sortHints(mergedHints, moderateByTopic)

  const visible = sortedHints.filter(isVisible).slice(0, 3)
  const visibleIds = new Set(visible.map(h => h.topic))
  const hidden = sortedHints.filter(h => !visibleIds.has(h.topic))

  const { status, dominantCluster } = aggregateVerdict(sortedHints, visible, ctx.dim)

  // Backwards-Fallback: ältere API-Outputs (vor Intent-Konzept) oder gecachte
  // Spike-JSONs ohne intent_assessment-Feld nicht crashen lassen. Default ist
  // immer 'unspecified' / 'not_assessable' — gleicher Verhaltenspfad wie wenn
  // der User die Haltung nicht angegeben hat.
  const ia = analysis.intent_assessment ?? {
    declared_intent: 'unspecified' as const,
    intent_alignment: 'not_assessable' as const,
    framing_risk: 'low' as const,
    reasoning: '',
  }
  const declaredIntent = ia.declared_intent as DeclaredIntent
  const { verdict: overallVerdict, intentOverridden } = buildOverallVerdict(
    status,
    dominantCluster,
    declaredIntent,
  )

  // Verwendungsform-Einordnung (usage_form). Frontend-only, rein view-seitig:
  // moduliert nur die Strenge-Note, nie Status/Headline/Befund. Bei fehlender
  // Verwendungsform (Backwards-Pfad, Alt-Aufrufe ohne 2. Param) → null.
  const usageTier = usageForm ? USAGE_FORM_TO_TIER[usageForm] : null
  const usageFormNote = usageTier
    ? computeUsageFormNote(usageTier, status, dominantCluster)
    : null

  const intentAlignment = ia.intent_alignment as IntentAlignment
  const framingRisk = ia.framing_risk as FramingRisk

  // Transparenz-Note neben der Empfehlung, wenn der Intent die Rahmung
  // verändert hat. Bei intent_alignment='mismatch' oder framing_risk='high'
  // wird die Note schärfer, weil die User-Haltung erklärtermassen NICHT zum
  // Bild passt — die Empfehlung darf hier nicht beruhigend wirken.
  let intentRecommendationNote: string | null = null
  if (intentOverridden) {
    const intentLabel =
      declaredIntent === 'critical'
        ? 'kritische'
        : declaredIntent === 'illustrative'
          ? 'illustrative'
          : 'bestätigende'
    if (intentAlignment === 'mismatch' || framingRisk === 'high') {
      intentRecommendationNote =
        `Empfehlung berücksichtigt deine erklärte ${intentLabel} Verwendung – ` +
        'aber das Bild passt aus Tool-Sicht nicht klar dazu. Befund bleibt unverändert.'
    } else {
      intentRecommendationNote =
        `Empfehlung berücksichtigt deine erklärte ${intentLabel} Verwendung. Befund selbst bleibt unverändert.`
    }
  }

  const intentAssessment: IntentAssessmentView = {
    declaredIntent,
    intentAlignment,
    framingRisk,
    reasoning: ia.reasoning,
    recommendationOverriddenByIntent: intentOverridden,
  }

  // Backwards-Fallback: ältere JSONs (vor Phase 7) haben kein normative_masking-
  // Feld — Default 'not_applicable' + leere Aspects + Default-Reasoning.
  // Zusätzliche Robustheit gegen handgeänderte/partielle JSONs (Codex-Review #2):
  // Array.isArray-Guard auf aspects, Enum-Guard auf erlaubte verdict-Werte und
  // Aspect-IDs.
  const nmRaw = analysis.research_layer.normative_masking ?? {
    verdict: 'not_applicable' as const,
    aspects: [] as NormativeMaskingAspect[],
    reasoning: '',
  }
  const allowedVerdicts: NormativeMaskingVerdict[] = ['low', 'medium', 'high', 'not_applicable']
  const allowedAspects: NormativeMaskingAspect[] = [
    'beauty_ideal', 'lifestyle_aspiration', 'status_signaling', 'gender_norm', 'success_norm',
  ]
  const safeVerdict: NormativeMaskingVerdict =
    allowedVerdicts.includes(nmRaw.verdict as NormativeMaskingVerdict)
      ? (nmRaw.verdict as NormativeMaskingVerdict)
      : 'not_applicable'
  const safeAspects: NormativeMaskingAspect[] = Array.isArray(nmRaw.aspects)
    ? (nmRaw.aspects as unknown[]).filter((a): a is NormativeMaskingAspect =>
        allowedAspects.includes(a as NormativeMaskingAspect),
      )
    : []
  const normativeMasking: NormativeMaskingView = {
    verdict: safeVerdict,
    aspects: safeAspects,
    reasoning: typeof nmRaw.reasoning === 'string' ? nmRaw.reasoning : '',
  }
  const normativeMaskingNote = computeNormativeMaskingNote(
    normativeMasking.verdict,
    declaredIntent,
  )

  const hasContextWarning = inputCompleteness !== 'full'

  return {
    overallVerdict,
    userHints: visible,
    hiddenHints: hidden,
    intentRecommendationNote,
    usageFormNote,
    hasContextWarning,
    aestheticCombined,
    aestheticDivergent,
    aestheticDelta,
    aestheticFallbackOnly,
    dimensions,
    readingMode,
    visualDrivers,
    hintsSortedBySeverity,
    hintsCountBySeverity,
    // Alt-JSON-Fallback: Outputs vor dem Rückbau haben das Feld nicht (undefined) —
    // dann aus der vorhandenen masking_evidence mit derselben Pipeline-Funktion komponieren.
    maskingReviewNote: result.masking_review_note !== undefined
      ? result.masking_review_note
      : composeMaskingReviewNote(
          analysis.research_layer.reading_mode,
          analysis.research_layer.masking_evidence ?? [],
        ),
    inputCompleteness,
    dominantErrorType: analysis.research_layer.dominant_error_type,
    biasAxesSummary,
    intentAssessment,
    normativeMasking,
    normativeMaskingNote,
    debug: {
      sonnetAesthetic: sonnet,
      v25Aesthetic: v25,
      v25Raw,
      integrityScore: result.computed.integrity_score_local,
      rawJson: result,
      meta,
      laionError: meta.laion_aesthetic_error ?? null,
      durationMs: meta.duration_ms,
      modelLabel: meta.model,
      aestheticModelLabel: meta.aesthetic_model ?? null,
      ...(() => {
        // CLIP-Pass-through mit Backwards-Fallback fuer alte JSONs.
        const clip = meta.clip_alignment
        const error = meta.clip_alignment_error ?? null
        if (!clip || typeof clip !== 'object' || !('skipped' in clip)) {
          return {
            clipSkipped: null,
            clipPromptCosine: null,
            clipContextCosine: null,
            clipPromptTruncated: null,
            clipContextTruncated: null,
            clipPromptTokenCount: null,
            clipContextTokenCount: null,
            clipModel: null,
            clipDurationMs: null,
            clipError: error,
          }
        }
        if (clip.skipped === true) {
          return {
            clipSkipped: true,
            clipPromptCosine: null,
            clipContextCosine: null,
            clipPromptTruncated: null,
            clipContextTruncated: null,
            clipPromptTokenCount: null,
            clipContextTokenCount: null,
            clipModel: null,
            clipDurationMs: null,
            clipError: error,
          }
        }
        return {
          clipSkipped: false,
          clipPromptCosine: typeof clip.prompt_cosine === 'number' ? clip.prompt_cosine : null,
          clipContextCosine: typeof clip.context_cosine === 'number' ? clip.context_cosine : null,
          clipPromptTruncated: typeof clip.prompt_truncated === 'boolean' ? clip.prompt_truncated : null,
          clipContextTruncated: typeof clip.context_truncated === 'boolean' ? clip.context_truncated : null,
          clipPromptTokenCount: typeof clip.prompt_token_count === 'number' ? clip.prompt_token_count : null,
          clipContextTokenCount: typeof clip.context_token_count === 'number' ? clip.context_token_count : null,
          clipModel: typeof clip.model === 'string' ? clip.model : null,
          clipDurationMs: typeof clip.duration_ms === 'number' ? clip.duration_ms : null,
          clipError: error,
        }
      })(),
    },
  }
}

export function useAnalysisView(
  result: Ref<SemanticAnalysisResult | null>,
  usageForm?: Ref<UsageForm | null | undefined>,
): ComputedRef<AnalysisViewModel | null> {
  return computed(() =>
    result.value ? buildAnalysisViewModel(result.value, usageForm?.value ?? undefined) : null,
  )
}
