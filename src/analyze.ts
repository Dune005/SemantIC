import { generateObject, generateText } from 'ai'
import { google, type GoogleLanguageModelOptions } from '@ai-sdk/google'
import { anthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { AnalysisSchema, type AnalysisOutput } from './schemas/analysis.js'
import { AestheticSchema, type AestheticOutput } from './schemas/aesthetic.js'
import { ANALYSIS_PROMPT } from './prompts/analysis.js'
import { ANALYSIS_PROMPT_EN } from './prompts/analysis.en.js'
import { AESTHETIC_PROMPT } from './prompts/aesthetic.js'
import { computeIntegrityScore, computeMaskingScore, deriveMaskingVerdict, type MaskingVerdict } from './scoring.js'
import { deriveContextReviewHints, type ContextReviewHint } from './context-hints.js'
import { runModalAesthetic, type ModalAestheticResult } from './aesthetic-modal.js'
import type { CodebookEvidence, MaskingEvidence } from './schemas/analysis.js'

const EVIDENCE_MIN_OBSERVATION_LEN = 10

function isValidBox(box: unknown): box is [number, number, number, number] {
  if (!Array.isArray(box) || box.length !== 4) return false
  const [y1, x1, y2, x2] = box
  if (![y1, x1, y2, x2].every(n => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= 1000)) return false
  if (y1 >= y2 || x1 >= x2) return false
  return true
}

function boxesOverlap(a: number[], b: number[]): boolean {
  const [ay1, ax1, ay2, ax2] = a
  const [by1, bx1, by2, bx2] = b
  return ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1
}

function overlapsAny(box: number[], others: { region_box_2d: number[] }[]): boolean {
  return others.some(o => boxesOverlap(box, o.region_box_2d))
}

function isValidEvidence(e: CodebookEvidence): boolean {
  if (!isValidBox(e.region_box_2d)) return false
  const obs = (e.specific_observation ?? '').trim()
  if (obs.length < EVIDENCE_MIN_OBSERVATION_LEN) return false
  return true
}

export interface EvidenceFilterReport {
  downgraded_flags: string[]
  dropped_evidence_count: number
}

export interface MaskingFilterReport {
  dropped_evidence_count: number
  drop_reasons: string[]
  verdict_downgraded: boolean
  verdict_before?: MaskingVerdict
  verdict_after?: MaskingVerdict
}

function applyEvidenceFilter(analysis: AnalysisOutput): EvidenceFilterReport {
  const cb = analysis.research_layer.codebook
  const report: EvidenceFilterReport = { downgraded_flags: [], dropped_evidence_count: 0 }

  const enforce = (
    flagKey: 'has_physics_issue' | 'has_anatomy_issue' | 'has_context_issue',
    evidenceKey: 'physics_evidence' | 'anatomy_evidence' | 'context_evidence',
  ) => {
    const before = cb[evidenceKey] ?? []
    if (!cb[flagKey]) {
      report.dropped_evidence_count += before.length
      cb[evidenceKey] = []
      return
    }
    const valid = before.filter(isValidEvidence)
    report.dropped_evidence_count += before.length - valid.length
    cb[evidenceKey] = valid
    if (valid.length === 0) {
      cb[flagKey] = false
      report.downgraded_flags.push(flagKey)
    }
  }

  enforce('has_physics_issue', 'physics_evidence')
  enforce('has_anatomy_issue', 'anatomy_evidence')
  enforce('has_context_issue', 'context_evidence')

  reconcileDominantErrorType(analysis, report.downgraded_flags)

  return report
}

const MASKING_ISSUE_MIN_LEN = 10

function applyMaskingEvidenceFilter(analysis: AnalysisOutput): MaskingFilterReport {
  const rl = analysis.research_layer
  const cb = rl.codebook
  const report: MaskingFilterReport = {
    dropped_evidence_count: 0,
    drop_reasons: [],
    verdict_downgraded: false,
  }

  const flagByLink: Record<MaskingEvidence['codebook_link'], boolean> = {
    physics: cb.has_physics_issue,
    anatomy: cb.has_anatomy_issue,
    context: cb.has_context_issue,
  }
  const evidenceByLink: Record<MaskingEvidence['codebook_link'], { region_box_2d: number[] }[]> = {
    physics: cb.physics_evidence,
    anatomy: cb.anatomy_evidence,
    context: cb.context_evidence,
  }

  const before = rl.masking_evidence ?? []
  const valid = before.filter(e => {
    if (!isValidBox(e.region_box_2d)) {
      report.drop_reasons.push(`invalid box (${e.codebook_link})`)
      return false
    }
    if ((e.masked_issue ?? '').trim().length < MASKING_ISSUE_MIN_LEN) {
      report.drop_reasons.push(`masked_issue too short (${e.codebook_link})`)
      return false
    }
    if (!flagByLink[e.codebook_link]) {
      report.drop_reasons.push(`codebook_link "${e.codebook_link}" without active flag`)
      return false
    }
    if (!rl.visual_drivers.includes(e.driver)) {
      report.drop_reasons.push(`driver "${e.driver}" not present in visual_drivers`)
      return false
    }
    if (!overlapsAny(e.region_box_2d, evidenceByLink[e.codebook_link])) {
      report.drop_reasons.push(`region of ${e.codebook_link}-masking does not overlap any ${e.codebook_link}_evidence region`)
      return false
    }
    return true
  })

  report.dropped_evidence_count = before.length - valid.length
  rl.masking_evidence = valid

  const verdictBefore = rl.masking_verdict
  if (valid.length === 0 && verdictBefore !== 'none') {
    rl.masking_verdict = 'none'
    rl.masking_reasoning = 'Verdict per Reconcile auf "none" gesetzt: keine validen Maskierungs-Evidenz-Einträge nach Filterung.'
    report.verdict_downgraded = true
    report.verdict_before = verdictBefore
    report.verdict_after = 'none'
  }

  return report
}

function reconcileDominantErrorType(analysis: AnalysisOutput, downgradedFlags: string[]): void {
  if (downgradedFlags.length === 0) return
  const cb = analysis.research_layer.codebook
  const flagToType: Record<string, 'physics' | 'anatomy' | 'context'> = {
    has_physics_issue: 'physics',
    has_anatomy_issue: 'anatomy',
    has_context_issue: 'context',
  }
  const currentType = analysis.research_layer.dominant_error_type
  const downgradedTypes = downgradedFlags.map(f => flagToType[f]).filter(Boolean)
  if (!downgradedTypes.includes(currentType as any)) return

  const activeTypes: ('physics' | 'anatomy' | 'context')[] = []
  if (cb.has_physics_issue) activeTypes.push('physics')
  if (cb.has_anatomy_issue) activeTypes.push('anatomy')
  if (cb.has_context_issue) activeTypes.push('context')

  if (activeTypes.length === 0) {
    analysis.research_layer.dominant_error_type = 'none'
  } else if (activeTypes.length === 1) {
    analysis.research_layer.dominant_error_type = activeTypes[0]
  } else {
    analysis.research_layer.dominant_error_type = 'mixed'
  }
}

const DEFAULT_MODEL = 'gemini-3-flash-preview'
const DEFAULT_AESTHETIC_MODEL = 'anthropic:claude-sonnet-4-6'
const DEFAULT_LANG: 'de' | 'en' = 'en'

type UseTextFallback = boolean
type ThinkingLevel = NonNullable<NonNullable<GoogleLanguageModelOptions['thinkingConfig']>['thinkingLevel']>
type MediaResolution = NonNullable<GoogleLanguageModelOptions['mediaResolution']>

export interface SemanticAnalysisOptions {
  prompt?: string
  context?: string
  mediaType?: string
  model?: string
  temperature?: number
  thinkingLevel?: ThinkingLevel
  mediaResolution?: MediaResolution
  lang?: 'de' | 'en'
}

function resolveModel(modelFlag?: string): { model: ReturnType<typeof google>; label: string; useTextFallback: UseTextFallback } {
  if (modelFlag?.startsWith('openrouter:')) {
    const modelId = modelFlag.slice('openrouter:'.length)
    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    })
    return { model: openrouter.chat(modelId) as any, label: `openrouter:${modelId}`, useTextFallback: true }
  }
  if (modelFlag?.startsWith('anthropic:')) {
    const modelId = modelFlag.slice('anthropic:'.length)
    return { model: anthropic(modelId) as any, label: `anthropic:${modelId}`, useTextFallback: true }
  }
  const modelId = modelFlag ?? DEFAULT_MODEL
  return { model: google(modelId), label: modelId, useTextFallback: false }
}

const JSON_SUFFIX = '\n\nAntworte ausschliesslich mit einem validen JSON-Objekt. Kein Markdown, keine Erklärungen – nur das JSON.'

const JSON_SUFFIX_EN = '\n\nRespond exclusively with a single valid JSON object. No markdown, no explanations — only the JSON. Remember: enum values stay as specified (English IDs), all free-text fields must be written in German per the LANGUAGE POLICY above.'

const AESTHETIC_JSON_SKELETON = `

Dein JSON-Output MUSS exakt diese Feldnamen verwenden:

{"aesthetic_score": 0-100, "aesthetic_reasoning": "..."}

WICHTIG: Das Feld heisst "aesthetic_score", NICHT "score".`

const ANALYSIS_JSON_SKELETON = `

Dein JSON-Output MUSS exakt diese Top-Level-Struktur und Feldnamen verwenden:

{
  "input_completeness": {
    "image": true,
    "usage_context": true,
    "original_prompt": true,
    "analysis_note": "..."
  },
  "bias_axis_analysis": {
    "axes_derived_from": "prompt_and_context | context_only | image_only | none",
    "axes": [
      {
        "axis_id": "...",
        "label": "...",
        "relevance": "high | medium | low",
        "reason_for_relevance": "...",
        "analysis_questions": ["..."],
        "observed_evidence": [
          { "observation": "...", "interpretation": "...", "supports_bias_finding": true }
        ],
        "risk_level": "low | medium | high",
        "confidence": "low | medium | high",
        "codebook_mapping": ["..."]
      }
    ],
    "no_axes_reason": null
  },
  "dimension_analysis": {
    "physics": {
      "score": 0-100,
      "status": "green | yellow | red",
      "findings": [{ "finding": "...", "severity": "minor | moderate | severe", "category": "..." }]
    },
    "semantics": { "score": 0-100, "status": "...", "findings": [...] },
    "bias": { "score": 0-100, "status": "...", "findings": [...] }
  },
  "research_layer": {
    "reading_mode": "WA | DA | CI | AA | MI",
    "reading_mode_label": "...",
    "reading_mode_masking_logic": "...",
    "visual_drivers": ["CL", "BK", "WCG", "HDT", "MO", "GF", "DS", "NL", "MH"],
    "visual_drivers_labels": ["..."],
    "dominant_error_type": "physics | anatomy | context | mixed | none",
    "codebook": {
      "visual_realism_level": "low | medium | high",
      "has_physics_issue": false,
      "physics_evidence": [],
      "has_anatomy_issue": false,
      "anatomy_evidence": [],
      "has_context_issue": false,
      "context_evidence": [],
      "hallucination_present": false,
      "resistance_to_prompt": false,
      "has_gender_bias": false,
      "has_role_stereotype": false,
      "has_body_stereotype": false,
      "stereotype_intensity": "none | low | medium | high"
    },
    "masking_evidence": [
      {
        "driver": "CL | BK | WCG | HDT | MO | GF | DS | NL | MH",
        "masked_issue": "...",
        "codebook_link": "physics | anatomy | context",
        "region_box_2d": [200, 350, 600, 700],
        "salient_region": true,
        "confidence": "low | medium | high"
      }
    ],
    "masking_verdict": "none | low | medium | high",
    "masking_reasoning": "..."
  },
  "integrity_score_llm": {
    "score": 0-100,
    "reasoning": "..."
  }
}

WICHTIG: Verwende EXAKT diese Feldnamen. Keine Umbenennung, keine Verschachtelung unter "phase1"/"phase2" etc.`

const ANALYSIS_JSON_SKELETON_EN = `

Your JSON output MUST use exactly this top-level structure and these field names:

{
  "input_completeness": {
    "image": true,
    "usage_context": true,
    "original_prompt": true,
    "analysis_note": "..."
  },
  "bias_axis_analysis": {
    "axes_derived_from": "prompt_and_context | context_only | image_only | none",
    "axes": [
      {
        "axis_id": "...",
        "label": "...",
        "relevance": "high | medium | low",
        "reason_for_relevance": "...",
        "analysis_questions": ["..."],
        "observed_evidence": [
          { "observation": "...", "interpretation": "...", "supports_bias_finding": true }
        ],
        "risk_level": "low | medium | high",
        "confidence": "low | medium | high",
        "codebook_mapping": ["..."]
      }
    ],
    "no_axes_reason": null
  },
  "dimension_analysis": {
    "physics": {
      "score": 0-100,
      "status": "green | yellow | red",
      "findings": [{ "finding": "...", "severity": "minor | moderate | severe", "category": "..." }]
    },
    "semantics": { "score": 0-100, "status": "...", "findings": [...] },
    "bias": { "score": 0-100, "status": "...", "findings": [...] }
  },
  "research_layer": {
    "reading_mode": "WA | DA | CI | AA | MI",
    "reading_mode_label": "...",
    "reading_mode_masking_logic": "...",
    "visual_drivers": ["CL", "BK", "WCG", "HDT", "MO", "GF", "DS", "NL", "MH"],
    "visual_drivers_labels": ["..."],
    "dominant_error_type": "physics | anatomy | context | mixed | none",
    "codebook": {
      "visual_realism_level": "low | medium | high",
      "has_physics_issue": false,
      "physics_evidence": [],
      "has_anatomy_issue": false,
      "anatomy_evidence": [],
      "has_context_issue": false,
      "context_evidence": [],
      "hallucination_present": false,
      "resistance_to_prompt": false,
      "has_gender_bias": false,
      "has_role_stereotype": false,
      "has_body_stereotype": false,
      "stereotype_intensity": "none | low | medium | high"
    },
    "masking_evidence": [
      {
        "driver": "CL | BK | WCG | HDT | MO | GF | DS | NL | MH",
        "masked_issue": "...",
        "codebook_link": "physics | anatomy | context",
        "region_box_2d": [200, 350, 600, 700],
        "salient_region": true,
        "confidence": "low | medium | high"
      }
    ],
    "masking_verdict": "none | low | medium | high",
    "masking_reasoning": "..."
  },
  "integrity_score_llm": {
    "score": 0-100,
    "reasoning": "..."
  }
}

IMPORTANT: use EXACTLY these field names. No renaming, no nesting under "phase1"/"phase2" etc.
Enum values are English IDs as shown. Free-text fields (finding, observation, reasoning,
reason_for_relevance, masked_issue, masking_reasoning, etc.) must be written in German
per the LANGUAGE POLICY.`

export interface SemanticAnalysisResult {
  analysis: AnalysisOutput
  aesthetic: AestheticOutput
  computed: {
    integrity_score_local: number
    aesthetic_combined: number
    aesthetic_combined_source: 'sonnet+v25' | 'sonnet_only'
    masking_score: number
    masking_verdict: MaskingVerdict
  }
  context_review_hints: ContextReviewHint[]
  meta: {
    model: string
    aesthetic_model?: string
    duration_ms: number
    evidence_filter?: EvidenceFilterReport
    masking_filter?: MaskingFilterReport
    laion_aesthetic?: ModalAestheticResult
    laion_aesthetic_error?: string
    test_config?: {
      temperature?: number
      thinkingLevel?: ThinkingLevel
      mediaResolution?: MediaResolution
    }
  }
}

export async function runSemanticAnalysis(
  imageBase64: string,
  options?: SemanticAnalysisOptions
): Promise<SemanticAnalysisResult> {
  const mediaType = options?.mediaType ?? 'image/jpeg'
  const lang = options?.lang ?? DEFAULT_LANG
  const analysisPrompt = lang === 'en' ? ANALYSIS_PROMPT_EN : ANALYSIS_PROMPT
  const userText = lang === 'en'
    ? `Original prompt: ${options?.prompt ?? 'not provided'}\nUsage context: ${options?.context ?? 'not provided'}`
    : `Original-Prompt: ${options?.prompt ?? 'nicht vorhanden'}\nNutzungskontext: ${options?.context ?? 'nicht vorhanden'}`
  const imageBuffer = Buffer.from(imageBase64, 'base64')
  const analysisResolved = resolveModel(options?.model)
  const aestheticResolved = resolveModel(DEFAULT_AESTHETIC_MODEL)

  const googleOptions: GoogleLanguageModelOptions = {}
  if (options?.thinkingLevel) {
    googleOptions.thinkingConfig = { thinkingLevel: options.thinkingLevel }
  }
  if (options?.mediaResolution) {
    googleOptions.mediaResolution = options.mediaResolution
  }
  const hasGoogleOptions = Object.keys(googleOptions).length > 0
  const analysisGenerationSettings = {
    ...(typeof options?.temperature === 'number' ? { temperature: options.temperature } : {}),
    ...(hasGoogleOptions && !analysisResolved.useTextFallback ? { providerOptions: { google: googleOptions } } : {}),
  }

  const extractJson = (text: string): string => {
    const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlock) return codeBlock[1].trim()
    const braceMatch = text.match(/\{[\s\S]*\}/)
    if (braceMatch) return braceMatch[0]
    return text.trim()
  }

  const parseWithFallback = <T>(text: string, schema: { parse: (v: unknown) => T }, parseLabel: string): T => {
    const raw = extractJson(text)
    try {
      return schema.parse(JSON.parse(raw))
    } catch (e) {
      console.error(`\n[${parseLabel}] JSON-Parsing fehlgeschlagen. Roher Text (erste 500 Zeichen):`)
      console.error(text.slice(0, 500))
      throw e
    }
  }

  const analysisCall = (): Promise<AnalysisOutput> => {
    const skeleton = lang === 'en' ? ANALYSIS_JSON_SKELETON_EN : ANALYSIS_JSON_SKELETON
    const suffix = lang === 'en' ? JSON_SUFFIX_EN : JSON_SUFFIX
    if (analysisResolved.useTextFallback) {
      return generateText({
        model: analysisResolved.model,
        system: analysisPrompt + skeleton + suffix,
        ...analysisGenerationSettings,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: userText },
            { type: 'image', image: imageBuffer, mediaType: mediaType },
          ],
        }],
      }).then(r => parseWithFallback(r.text, AnalysisSchema, 'Analysis'))
    }
    return generateObject({
      model: analysisResolved.model,
      schema: AnalysisSchema,
      system: analysisPrompt,
      ...analysisGenerationSettings,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: userText },
          { type: 'image', image: imageBuffer, mediaType: mediaType },
        ],
      }],
    }).then(r => r.object)
  }

  const aestheticCall = (): Promise<AestheticOutput> => {
    if (aestheticResolved.useTextFallback) {
      return generateText({
        model: aestheticResolved.model,
        system: AESTHETIC_PROMPT + AESTHETIC_JSON_SKELETON + JSON_SUFFIX,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', image: imageBuffer, mediaType: mediaType },
          ],
        }],
      }).then(r => parseWithFallback(r.text, AestheticSchema, 'Aesthetic'))
    }
    return generateObject({
      model: aestheticResolved.model,
      schema: AestheticSchema,
      system: AESTHETIC_PROMPT,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', image: imageBuffer, mediaType: mediaType },
        ],
      }],
    }).then(r => r.object)
  }

  const start = Date.now()
  const [analysis, aesthetic, laionResult] = await Promise.all([
    analysisCall(),
    aestheticCall(),
    runModalAesthetic(imageBase64).then(
      r => ({ ok: true as const, value: r }),
      err => {
        const msg = err instanceof Error ? err.message : String(err)
        console.warn(`[R4.7.2] Modal-Aesthetic fehlgeschlagen: ${msg}`)
        return { ok: false as const, error: msg }
      },
    ),
  ])

  const evidenceReport = applyEvidenceFilter(analysis)
  if (evidenceReport.downgraded_flags.length > 0) {
    console.warn(`[R4.1 Evidence-Filter] Flags ohne valide Evidenz auf false gesetzt: ${evidenceReport.downgraded_flags.join(', ')}`)
  }
  if (evidenceReport.dropped_evidence_count > 0) {
    console.warn(`[R4.1 Evidence-Filter] ${evidenceReport.dropped_evidence_count} invalide Evidence-Einträge entfernt (Box oder Beobachtung unzureichend)`)
  }

  const maskingReport = applyMaskingEvidenceFilter(analysis)
  if (maskingReport.dropped_evidence_count > 0) {
    console.warn(`[R4.2 Masking-Filter] ${maskingReport.dropped_evidence_count} invalide masking_evidence-Einträge entfernt (${maskingReport.drop_reasons.join('; ')})`)
  }
  if (maskingReport.verdict_downgraded) {
    console.warn(`[R4.2 Masking-Filter] masking_verdict downgegradet: ${maskingReport.verdict_before} → ${maskingReport.verdict_after}`)
  }

  const duration_ms = Date.now() - start
  const localIntegrity = computeIntegrityScore(analysis.dimension_analysis)
  const sonnetAesthetic = aesthetic.aesthetic_score
  const v25Normalized = laionResult.ok ? laionResult.value.normalized : null
  const aestheticCombined = v25Normalized !== null
    ? Math.round((sonnetAesthetic + v25Normalized) / 2)
    : sonnetAesthetic
  const aestheticCombinedSource: 'sonnet+v25' | 'sonnet_only' = v25Normalized !== null
    ? 'sonnet+v25'
    : 'sonnet_only'
  const maskingScore = computeMaskingScore(aestheticCombined, localIntegrity)
  const verdictBeforeReconcile = analysis.research_layer.masking_verdict
  const maskingVerdict = deriveMaskingVerdict(
    analysis.research_layer.masking_evidence,
    aestheticCombined,
  )
  if (maskingVerdict !== verdictBeforeReconcile) {
    analysis.research_layer.masking_verdict = maskingVerdict
    const sourceLabel = aestheticCombinedSource === 'sonnet+v25'
      ? `Mittel aus Sonnet ${sonnetAesthetic} und V2.5 ${v25Normalized}`
      : `Sonnet ${sonnetAesthetic} (V2.5 nicht verfügbar)`
    analysis.research_layer.masking_reasoning =
      `Verdict per Reconcile auf "${maskingVerdict}" gesetzt (Vorher: "${verdictBeforeReconcile}"). ` +
      `Deterministische Ableitung aus Evidenz (${analysis.research_layer.masking_evidence.length} Einträge) und kombiniertem Ästhetik-Score (${aestheticCombined}/100; ${sourceLabel}; Floor <75 deckelt auf 'low').`
    if (!maskingReport.verdict_downgraded) {
      maskingReport.verdict_downgraded = true
      maskingReport.verdict_before = verdictBeforeReconcile
    }
    maskingReport.verdict_after = maskingVerdict
    console.warn(`[R4.2 Masking-Filter] masking_verdict via aesthetic_combined+evidence reconcile: ${verdictBeforeReconcile} → ${maskingVerdict} (combined=${aestheticCombined}, source=${aestheticCombinedSource})`)
  }
  const hints = deriveContextReviewHints({
    readingMode: analysis.research_layer.reading_mode,
    visualDrivers: analysis.research_layer.visual_drivers,
    physicsScore: analysis.dimension_analysis.physics.score,
    semanticsScore: analysis.dimension_analysis.semantics.score,
    biasScore: analysis.dimension_analysis.bias.score,
    aestheticScore: aestheticCombined,
    hasUsageContext: Boolean(options?.context?.trim()),
    biasFlags: {
      hasGenderBias: analysis.research_layer.codebook.has_gender_bias,
      hasRoleStereotype: analysis.research_layer.codebook.has_role_stereotype,
      hasBodyStereotype: analysis.research_layer.codebook.has_body_stereotype,
    },
    codebookFlags: {
      hasPhysicsIssue: analysis.research_layer.codebook.has_physics_issue,
      hasAnatomyIssue: analysis.research_layer.codebook.has_anatomy_issue,
      hasContextIssue: analysis.research_layer.codebook.has_context_issue,
    },
  })

  return {
    analysis,
    aesthetic,
    computed: {
      integrity_score_local: localIntegrity,
      aesthetic_combined: aestheticCombined,
      aesthetic_combined_source: aestheticCombinedSource,
      masking_score: maskingScore,
      masking_verdict: maskingVerdict,
    },
    context_review_hints: hints,
    meta: {
      model: analysisResolved.label,
      aesthetic_model: aestheticResolved.label,
      duration_ms,
      evidence_filter: evidenceReport,
      masking_filter: maskingReport,
      ...(laionResult.ok ? { laion_aesthetic: laionResult.value } : { laion_aesthetic_error: laionResult.error }),
      ...(typeof options?.temperature === 'number' || options?.thinkingLevel || options?.mediaResolution
        ? {
            test_config: {
              ...(typeof options?.temperature === 'number' ? { temperature: options.temperature } : {}),
              ...(options?.thinkingLevel ? { thinkingLevel: options.thinkingLevel } : {}),
              ...(options?.mediaResolution ? { mediaResolution: options.mediaResolution } : {}),
            },
          }
        : {}),
    },
  }
}
