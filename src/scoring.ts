import type { AnalysisOutput, MaskingEvidence } from './schemas/analysis.js'

type Dimensions = AnalysisOutput['dimension_analysis']
export type MaskingVerdict = 'none' | 'low' | 'medium' | 'high'

export function computeIntegrityScore(dimensions: Dimensions): number {
  return Math.round(
    (dimensions.physics.score + dimensions.semantics.score + dimensions.bias.score) / 3
  )
}

export function computeMaskingScore(aestheticScore: number, integrityScore: number): number {
  return aestheticScore - integrityScore
}

const AESTHETIC_HIGH_THRESHOLD = 75

export function deriveMaskingVerdict(
  evidence: MaskingEvidence[],
  aestheticScore: number,
): MaskingVerdict {
  if (evidence.length === 0) return 'none'

  const hasSalientHighConf = evidence.some(
    e => e.salient_region && e.confidence === 'high'
  )
  const hasSalientMediumConf = evidence.some(
    e => e.salient_region && e.confidence === 'medium'
  )

  let derived: MaskingVerdict = 'low'
  if (hasSalientHighConf) {
    derived = 'high'
  } else if (hasSalientMediumConf) {
    derived = 'medium'
  }

  if (aestheticScore < AESTHETIC_HIGH_THRESHOLD) {
    const cap: MaskingVerdict = 'low'
    const rank: Record<MaskingVerdict, number> = { none: 0, low: 1, medium: 2, high: 3 }
    if (rank[derived] > rank[cap]) derived = cap
  }

  return derived
}
