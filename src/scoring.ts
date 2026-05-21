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

export function deriveMaskingVerdict(
  evidence: MaskingEvidence[],
  maskingScore: number,
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

  // Plausibilitaets-Deckel (R4.2.2): Eine starke Maskierung setzt voraus, dass
  // die aesthetische Oberflaeche die Integritaet ueberhaupt uebersteigt. Ist der
  // Maskierungs-Score <= 0 (Aesthetik uebersteigt Integritaet nicht), ist ein
  // medium/high-Verdict diagnostisch unplausibel und wird auf 'low' gedeckelt.
  // Loest den frueheren absoluten Aesthetik-Floor (<75) ab, der an Sonnets
  // komprimiertem Score haftete und den Maskierungs-Kernfall verfehlte.
  // Das Verdict bleibt evidenzbasiert; der Score wirkt nur als Deckel nach
  // unten, hebt nie an.
  if (maskingScore <= 0) {
    const cap: MaskingVerdict = 'low'
    const rank: Record<MaskingVerdict, number> = { none: 0, low: 1, medium: 2, high: 3 }
    if (rank[derived] > rank[cap]) derived = cap
  }

  return derived
}
