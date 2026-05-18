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

  return {
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
