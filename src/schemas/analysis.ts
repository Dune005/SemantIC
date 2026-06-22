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

// Modellmarkierte mögliche Überdeckungs-Stellen (Treiber ↔ Befund), deterministisch
// validiert in applyMaskingEvidenceFilter. Kein Nachweis und keine Messung —
// das frühere masking_verdict/masking_score wurde entfernt (Beschluss 2026-06-07,
// spike-test/MASKIERUNG-GESAMTBEFUND.md). salient_region und confidence sind
// deskriptive Metadaten je Eintrag und werden nirgends zu einer Stufe aggregiert.
const MaskingEvidenceSchema = z.object({
  driver: z.enum(['CL', 'BK', 'WCG', 'HDT', 'MO', 'GF', 'DS', 'NL', 'MH']),
  masked_issue: z.string(),
  codebook_link: z.enum(['physics', 'anatomy', 'context']),
  region_box_2d: z.array(z.number()).length(4),
  salient_region: z.boolean(),
  confidence: z.enum(['low', 'medium', 'high']),
})

export type MaskingEvidence = z.infer<typeof MaskingEvidenceSchema>

// Rein deskriptive, sichtbare Overlay-Markierungen (eingeblendetes Wasserzeichen,
// Signatur, aufgelegtes Logo) – KEIN Echtheits-/Herkunftsurteil, KEIN Codebook-Befund,
// KEIN Score-Einfluss. Wird derzeit nicht weiterverarbeitet (kein Filter/Consumer) und
// ist eine rein additive Transparenz-Annotation (Beschluss 2026-06-22, pipeline-anpassung).
const ProvenanceMarkerSchema = z.object({
  type: z.enum(['watermark', 'logo', 'signature']),
  region_box_2d: z.array(z.number().int().min(0).max(1000)).length(4),
  description: z.string(),
  confidence: z.enum(['medium', 'high']),
})

export type ProvenanceMarker = z.infer<typeof ProvenanceMarkerSchema>

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
      // Historische Codebook-Variable (Phase-1-Parität). Wird von keinem
      // Konsumenten ausgewertet und ist KEINE kommunizierte Maskierungs-Stufe.
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
    normative_masking: z.object({
      verdict: z.enum(['low', 'medium', 'high', 'not_applicable']).describe(
        'Whether the image propagates an idealised norm. ' +
        'not_applicable = image offers no anchor for normative assessment ' +
        '(pure still-life without lifestyle/status, abstract graphic, technical diagram). ' +
        'low = could plausibly idealise but does not (documentary, neutral framing). ' +
        'medium = recognisable advertising aesthetic with at least one aspect. ' +
        'high = clear normative promise AND smooth attractive staging ' +
        'AND strong social norm carrier. Realism alone is never sufficient.',
      ),
      aspects: z.array(z.enum([
        'beauty_ideal',
        'lifestyle_aspiration',
        'status_signaling',
        'gender_norm',
        'success_norm',
      ])).max(3).describe(
        'Which idealised pattern(s) the image propagates. Max 3. ' +
        'Empty array if verdict is not_applicable or low without specific carrier.',
      ),
      reasoning: z.string().max(280).describe(
        'Short justification (max ~280 chars) for the verdict and aspects. ' +
        'Output in German. Analytical framing — describe the normative effect, ' +
        'do not moralise.',
      ),
    }).describe(
      'Normative masking — distinct from masking_evidence above. ' +
      'masking_evidence requires a Codebook flaw being aesthetically hidden. ' +
      'normative_masking is independent of any Codebook flaw: the image may ' +
      'have flaws or be flag-free; the verdict here only describes whether ' +
      'the surface propagates an idealised norm. The two are independent and ' +
      'the verdict here MUST NOT influence Codebook flags, severities, scores, ' +
      'masking_evidence or reading_mode.',
    ),
    provenance_markers: z.array(ProvenanceMarkerSchema)
      .max(3)
      .describe(
        'Purely descriptive catalog of clearly VISIBLE overlay markings that sit ON the image ' +
        'surface (watermark, signature, or an overlaid logo). NOT part of the depicted scene ' +
        '(no jewellery, reflections, light dots, patterns, or logos/text on clothing, products, ' +
        'signs or posters). type classifies the visible FORM only, not the origin. Directly ' +
        'legible text/names may be quoted verbatim, but never infer origin, authorship, ' +
        'generation or ownership of the image from them. NEVER an authenticity / AI-vs-real / ' +
        'manipulation / authorship verdict, and never a Codebook flaw: a marker here is NOT a ' +
        'physics/anatomy/context issue and MUST NOT influence any flag, severity, score, ' +
        'masking_evidence, normative_masking or reading_mode. description in German. Output [] ' +
        'when nothing is clearly visible; do not invent markers.',
      )
      .optional()
      .catch([]),
  }),
  integrity_score_llm: z.object({
    score: z.number(),
    reasoning: z.string(),
  }),
  intent_assessment: z.object({
    declared_intent: z.enum(['affirmative', 'critical', 'illustrative', 'unspecified']).describe(
      'Echo of the user-declared editorial intent. ' +
      'affirmative = use the image as-is to support the topic. ' +
      'critical = use the image to critically frame or question a topic. ' +
      'illustrative = use the image as a neutral example. ' +
      'unspecified = no intent declared (default).',
    ),
    intent_alignment: z.enum(['match', 'partial', 'mismatch', 'not_assessable']).describe(
      'How well the image fits the declared editorial intent. ' +
      'match = image clearly supports the intent. ' +
      'partial = image fits partially or with caveats. ' +
      'mismatch = image works against the intent (e.g. affirmative-looking image declared as critical). ' +
      'not_assessable = intent is unspecified or there is not enough signal to judge.',
    ),
    framing_risk: z.enum(['low', 'medium', 'high']).describe(
      'Risk that the combination of image + declared intent + context becomes ' +
      'editorially problematic — independent of the integrity findings. ' +
      'high = clear risk of misreading or harmful framing. low = combination is robust.',
    ),
    reasoning: z.string().max(280).describe(
      'Short justification (max ~280 chars) for the alignment and framing_risk values. ' +
      'Output language follows the rest of the analysis (German by default).',
    ),
  }),
})

export type AnalysisOutput = z.infer<typeof AnalysisSchema>
export type IntentAssessment = AnalysisOutput['intent_assessment']
export type DeclaredIntent = IntentAssessment['declared_intent']
export type NormativeMasking = AnalysisOutput['research_layer']['normative_masking']
export type NormativeMaskingVerdict = NormativeMasking['verdict']
export type NormativeMaskingAspect = NormativeMasking['aspects'][number]
