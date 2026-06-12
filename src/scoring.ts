import type { AnalysisOutput } from './schemas/analysis.js'

type Dimensions = AnalysisOutput['dimension_analysis']

export function computeIntegrityScore(dimensions: Dimensions): number {
  return Math.round(
    (dimensions.physics.score + dimensions.semantics.score + dimensions.bias.score) / 3
  )
}

// computeMaskingScore und deriveMaskingVerdict wurden entfernt (2026-06-10):
// Die Maskierungs-Messung ist empirisch widerlegt (spike-test/MASKIERUNG-
// GESAMTBEFUND.md). Beschreibender Ersatz: composeMaskingReviewNote in
// masking-note.ts.
