import { computed, type Ref, type ComputedRef } from 'vue'
import type { SemanticAnalysisResult } from '@pipeline/analyze'
import type { ContextReviewHint } from '@pipeline/context-hints'

export type DimensionStatus = 'green' | 'yellow' | 'red'
export type MaskingVerdict = 'none' | 'low' | 'medium' | 'high'
export type RiskLevel = 'low' | 'medium' | 'high'
export type ReadingModeCode = 'WA' | 'DA' | 'CI' | 'AA' | 'MI'
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

export interface ConsolidatedHint {
  topic: HintTopic | 'bias_combined'
  severity: HintSeverity
  supportLevel: SupportLevel
  signalGroups: SignalGroup[]
  signals: string[]
  text: string
  dimension?: 'physics' | 'semantics' | 'bias'
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
  maskingVerdict: MaskingVerdict
  maskingScore: number
  inputCompleteness: InputCompleteness
  dominantErrorType: DominantErrorType
  biasAxesSummary: BiasAxesSummary
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

// Werbe-/Magazin-Kontext: Bias ist genre-typisch und rückt nach hinten,
// Bildintegrität (Skalierung, Anatomie) rückt nach vorne. style_mismatch
// ist im Werbe-Kontext tautologisch und wird komplett deprioritisiert.
const TOPIC_PRIORITY_AD: Record<ConsolidatedHint['topic'], number> = {
  context_logic: 9,
  anatomy: 8,
  physics: 7,
  bias_combined: 4,
  role_stereotype: 3,
  body_stereotype: 2,
  gender_bias: 1,
  masking: 0,
  hallucination: -1,
  style_mismatch: -2,
}

function isAdContext(readingMode: ReadingModeCode): boolean {
  return readingMode === 'WA' || readingMode === 'MI'
}

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

// Werbe-/Magazin-Kontext: Recommendations rahmen Bias als genre-typisch,
// gewichten Bildintegrität klar als das, worauf es im Werbe-Kontext ankommt.
const RECOMMENDATION_TABLE_AD: Record<
  DimensionStatus,
  Partial<Record<RecommendationCluster | 'null', string>>
> = {
  green: {
    null: 'Aus Tool-Sicht keine kritischen Hinweise. Das letzte Urteil bleibt bei dir.',
  },
  yellow: {
    null: 'Im Werbe-Kontext bleiben ein paar Punkte zu prüfen – aber nichts Dramatisches.',
    image_integrity: 'Würde die Bildqualität sichtprüfen – Skalierung oder Anatomie wirken auffällig.',
    bias_representation: 'Bias-Muster sind im Werbe-/Magazin-Kontext genre-typisch – Hinweis bleibt, aber kein Grund zur Sorge.',
    masking_style: 'Das Bild ist visuell überzeugend – im Werbe-Genre erwartbar, im Detail nochmal sichten.',
    hallucination: 'Es gibt Hinweise, dass Bildinhalte vom Prompt abweichen – inhaltlich gegenprüfen.',
  },
  red: {
    null: 'Auch im Werbe-Kontext sind diese Hinweise kritisch – bitte vor Publikation klären.',
    image_integrity: 'Sichtbare Bildfehler – würden in einer professionellen Werbung sofort auffallen. Neu generieren oder anderes Bild.',
    bias_representation: 'Auch für Werbe-Standards problematische Bias-Hinweise – Personendarstellung überdenken.',
    masking_style: 'Bild wirkt zu glatt für die Hinweise, die im Bild stecken – noch nicht in dieser Form verwenden.',
    hallucination: 'Bildinhalte weichen vom Prompt ab – bitte nicht in dieser Form verwenden.',
  },
}

const KEYWORD_PATTERNS: Record<'anatomy' | 'role' | 'body' | 'gender', RegExp> = {
  anatomy: /\b(anatom|hand|finger|face|gesicht|proport|limb|gliedmass|extremit)/i,
  role: /\b(role|rolle|beruf|occupat|job|position|profession|status)/i,
  body: /\b(body|körper|koerper|build|figur|physique|ideal|attract|schön|schoen)/i,
  gender: /\b(gender|geschlecht|female|male|frau|mann|woman|men)/i,
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
      const anyDimAuffaellig =
        dim.physics.status !== 'green' || dim.semantics.status !== 'green' || dim.bias.status !== 'green'
      if (anyDimAuffaellig) {
        signals.push({ text: 'any_dim.status≠green', group: 'gemini_dimension' })
      }
      if (ctx.maskingEvidenceCount >= 2) {
        signals.push({ text: `masking_evidence×${ctx.maskingEvidenceCount}`, group: 'gemini_research' })
      }
      if (ctx.aestheticCombined >= 75) {
        signals.push({ text: `aesthetic_combined=${ctx.aestheticCombined}`, group: 'external_aesthetic' })
      }
      addRule('masking_attention_risk')
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

  return {
    topic,
    severity,
    supportLevel,
    signalGroups: groups,
    signals: signals.map(s => s.text),
    text: TOPIC_TEXT[topic],
    dimension: dimKey,
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
  readingMode: ReadingModeCode,
): ConsolidatedHint[] {
  const priorityMap = isAdContext(readingMode) ? TOPIC_PRIORITY_AD : TOPIC_PRIORITY
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
    return priorityMap[b.topic] - priorityMap[a.topic]
  })
}

function mergeBiasTopics(hints: ConsolidatedHint[]): ConsolidatedHint[] {
  const biasTopics: HintTopic[] = ['role_stereotype', 'body_stereotype', 'gender_bias']
  const biasItems = hints.filter(h => biasTopics.includes(h.topic as HintTopic))
  if (biasItems.length < 2) return hints
  const mergedGroups = Array.from(new Set(biasItems.flatMap(h => h.signalGroups)))
  const mergedSupport: SupportLevel =
    biasItems.some(h => h.supportLevel === 'cross_group') || mergedGroups.length >= 2
      ? 'cross_group'
      : 'single'
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

function buildOverallVerdict(
  status: DimensionStatus,
  dominantCluster: RecommendationCluster | null,
  readingMode: ReadingModeCode,
): OverallVerdict {
  const headline = VERDICT_HEADLINES[status]
  const table = isAdContext(readingMode) ? RECOMMENDATION_TABLE_AD[status] : RECOMMENDATION_TABLE[status]
  const recommendation =
    (dominantCluster && table[dominantCluster]) || table.null || 'Empfehlung verfügbar.'
  return { status, headline, recommendation, dominantCluster }
}

export function buildAnalysisViewModel(result: SemanticAnalysisResult): AnalysisViewModel {
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

  const readingMode: ReadingModeView = {
    code: analysis.research_layer.reading_mode,
    label: analysis.research_layer.reading_mode_label,
  }

  const driverCodes = analysis.research_layer.visual_drivers
  const driverLabels = analysis.research_layer.visual_drivers_labels
  const visualDrivers: VisualDriverView[] = driverCodes.map((code, i) => ({
    code,
    label: driverLabels[i] ?? code,
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

  const mergedHints = mergeBiasTopics(rawHints)
  const sortedHints = sortHints(mergedHints, moderateByTopic, readingMode.code)

  const visible = sortedHints.filter(isVisible).slice(0, 3)
  const visibleIds = new Set(visible.map(h => h.topic))
  const hidden = sortedHints.filter(h => !visibleIds.has(h.topic))

  const { status, dominantCluster } = aggregateVerdict(sortedHints, visible, ctx.dim)
  const overallVerdict = buildOverallVerdict(status, dominantCluster, readingMode.code)

  const hasContextWarning = inputCompleteness !== 'full'

  return {
    overallVerdict,
    userHints: visible,
    hiddenHints: hidden,
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
    maskingVerdict: result.computed.masking_verdict,
    maskingScore: result.computed.masking_score,
    inputCompleteness,
    dominantErrorType: analysis.research_layer.dominant_error_type,
    biasAxesSummary,
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
    },
  }
}

export function useAnalysisView(
  result: Ref<SemanticAnalysisResult | null>,
): ComputedRef<AnalysisViewModel | null> {
  return computed(() => (result.value ? buildAnalysisViewModel(result.value) : null))
}
