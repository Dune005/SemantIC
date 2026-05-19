import { z } from 'zod'

const FindingSchema = z.object({
  finding: z.string().describe(
    'Concrete problem finding (defect, error, issue) in German free text. ' +
    'Findings are PROBLEMS ONLY — never include positive or neutral observations ' +
    'like "no anomalies" or "physical consistency is excellent". For clean ' +
    'dimensions return an empty findings[] array.',
  ),
  severity: z.enum(['minor', 'moderate', 'severe']).describe(
    'severe = concrete visible problem that would prevent publishable use in ' +
    'the named usage context. moderate = recognisable problem critical in ' +
    'many editorial/journalistic contexts. minor = subtle anomaly tolerable ' +
    'in most contexts. When uncertain between two levels, choose the higher ' +
    'one if clear visual evidence supports it.',
  ),
  category: z.string(),
})

const CodebookEvidenceSchema = z.object({
  region_box_2d: z.array(z.number()).length(4),
  specific_observation: z.string(),
})

export type CodebookEvidence = z.infer<typeof CodebookEvidenceSchema>

const MaskingEvidenceSchema = z.object({
  driver: z.enum(['CL', 'BK', 'WCG', 'HDT', 'MO', 'GF', 'DS', 'NL', 'MH']),
  masked_issue: z.string(),
  codebook_link: z.enum(['physics', 'anatomy', 'context']),
  region_box_2d: z.array(z.number()).length(4),
  salient_region: z.boolean(),
  confidence: z.enum(['low', 'medium', 'high']),
})

export type MaskingEvidence = z.infer<typeof MaskingEvidenceSchema>

const DimensionSchema = z.object({
  score: z.number(),
  status: z.enum(['green', 'yellow', 'red']),
  findings: z.array(FindingSchema),
})

const ObservedEvidenceSchema = z.object({
  observation: z.string(),
  interpretation: z.string(),
  supports_bias_finding: z.boolean(),
})

const BiasAxisSchema = z.object({
  axis_id: z.string(),
  label: z.string(),
  relevance: z.enum(['high', 'medium', 'low']),
  reason_for_relevance: z.string(),
  analysis_questions: z.array(z.string()),
  observed_evidence: z.array(ObservedEvidenceSchema),
  risk_level: z.enum(['low', 'medium', 'high']),
  confidence: z.enum(['low', 'medium', 'high']),
  codebook_mapping: z.array(z.string()),
})

export const AnalysisSchema = z.object({
  input_completeness: z.object({
    image: z.boolean(),
    usage_context: z.boolean(),
    original_prompt: z.boolean(),
    analysis_note: z.string(),
  }),
  bias_axis_analysis: z.object({
    axes_derived_from: z.enum(['prompt_and_context', 'context_only', 'image_only', 'none']),
    axes: z.array(BiasAxisSchema),
    no_axes_reason: z.string().nullable(),
  }),
  dimension_analysis: z.object({
    physics: DimensionSchema,
    semantics: DimensionSchema,
    bias: DimensionSchema,
  }),
  research_layer: z.object({
    reading_mode: z.enum(['WA', 'DA', 'CI', 'AA', 'MI']),
    reading_mode_label: z.string(),
    reading_mode_masking_logic: z.string(),
    visual_drivers: z.array(z.enum(['CL', 'BK', 'WCG', 'HDT', 'MO', 'GF', 'DS', 'NL', 'MH'])),
    visual_drivers_labels: z.array(z.string()),
    dominant_error_type: z.enum(['physics', 'anatomy', 'context', 'mixed', 'none']),
    codebook: z.object({
      visual_realism_level: z.enum(['low', 'medium', 'high']),
      masking_potential: z.enum(['low', 'medium', 'high']).optional(),
      has_physics_issue: z.boolean(),
      physics_evidence: z.array(CodebookEvidenceSchema),
      has_anatomy_issue: z.boolean(),
      anatomy_evidence: z.array(CodebookEvidenceSchema),
      has_context_issue: z.boolean(),
      context_evidence: z.array(CodebookEvidenceSchema),
      hallucination_present: z.boolean(),
      resistance_to_prompt: z.boolean(),
      has_gender_bias: z.boolean(),
      has_role_stereotype: z.boolean(),
      has_body_stereotype: z.boolean(),
      stereotype_intensity: z.enum(['none', 'low', 'medium', 'high']),
    }),
    masking_evidence: z.array(MaskingEvidenceSchema),
    masking_verdict: z.enum(['none', 'low', 'medium', 'high']),
    masking_reasoning: z.string(),
  }),
  integrity_score_llm: z.object({
    score: z.number(),
    reasoning: z.string(),
  }),
})

export type AnalysisOutput = z.infer<typeof AnalysisSchema>
