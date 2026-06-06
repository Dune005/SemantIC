import { generateObject, generateText } from 'ai'
import { google, type GoogleLanguageModelOptions } from '@ai-sdk/google'
import { anthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { AnalysisSchema, type AnalysisOutput, type DeclaredIntent } from './schemas/analysis.js'
import { AestheticSchema, type AestheticOutput } from './schemas/aesthetic.js'
import { ANALYSIS_PROMPT } from './prompts/analysis.js'
import { ANALYSIS_PROMPT_EN } from './prompts/analysis.en.js'
import { AESTHETIC_PROMPT } from './prompts/aesthetic.js'
import { computeIntegrityScore, computeMaskingScore, deriveMaskingVerdict, type MaskingVerdict } from './scoring.js'
import { deriveContextReviewHints, type ContextReviewHint } from './context-hints.js'
import { runModalAesthetic, type ModalAestheticResult } from './aesthetic-modal.js'
import {
  runClipAlignment,
  toClipAlignmentMeta,
  type ClipAlignmentMeta,
  type ClipTextEntry,
} from './clip-alignment-modal.js'
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

export interface ConsistencyReconcileReport {
  applied_rules: string[]
  score_caps: Array<{
    dimension: 'physics' | 'semantics' | 'bias'
    score_before: number
    score_after: number
    status_before: 'green' | 'yellow' | 'red'
    status_after: 'green' | 'yellow' | 'red'
    reason: string
  }>
  flag_changes: Array<{
    flag: 'has_anatomy_issue' | 'has_physics_issue' | 'has_context_issue'
    before: boolean
    after: boolean
    reason: string
  }>
  integrity_before: number
  integrity_after: number
  // Phase B (R6): Aggregate-Cap nach computeIntegrityScore. Stellt die
  // interne Konsistenz zwischen Codebook-Flag-Evidence und Score wieder her,
  // wenn die R2/R3/R4-Dimension-Caps den Score nicht weit genug gedrückt
  // haben (z.B. weil nur eine von drei Dimensionen gecappt wurde, aber das
  // arithmetische Mittel >80 bleibt).
  aggregate_cap?: {
    applied: boolean
    score_before: number
    score_after: number
    cap: number
    reason: string
    triggering_rules: string[]
  }
  // Finale Normalisierung von dominant_error_type gegen die Codebook-Flags.
  // Gesetzt, wenn der LLM-Wert inkonsistent zu den finalen Flags war und
  // korrigiert wurde (sonst undefined).
  dominant_error_type_change?: {
    before: string
    after: string
    active_types: string[]
  }
}

// Reconcile zwischen Codebook-Flags und Dimensions-Scores. Der LLM-Output ist
// gelegentlich inkonsistent: has_X_issue=true, aber dim.X.status=green/Score≥75.
// Dieser Layer überschreibt Score/Status NICHT, sondern setzt einen Cap auf 74,
// damit View-Model und integrity_score_local den Codebook-Befund respektieren.
// Plus: Anatomie-Reklassifizierung wenn physics-Findings Anatomy-Keywords nennen.
//
// Phase B-light (R6.1): nur _strong-Pfade, evidence_only entfernt nach B7-FP-Welle.
//   R2 physics:  Flag + Evidence + ≥moderate Finding → Cap 74
//   R3 anatomy:  Flag + (Evidence ODER anatomie-relevantes ≥moderate Finding) → Cap 74
//                 R3 darf weiterhin ohne Evidence triggern, weil R1
//                 has_anatomy_issue aus einem ≥moderate-Finding setzen kann.
//   R4 context:  Flag + Evidence + ≥moderate Finding → Cap 74
//   R5 bias:     (has_body || has_role || has_gender) + ≥moderate bias-Finding
//                 → Bias-Cap 74 (neuer Pfad, B-light, gegen CEO-Underrating)
// Begründung evidence_only-Wegfall: B7-Test (5 Bilder × 2 Modelle, 2026-05-19)
// zeigte FP-Welle auf clean Bildern (NB_kindergarden, NB_female_worker) —
// evidence_only-Pfad cappte clean Hartfälle auf 80, weil das LLM unter dem
// schärferen Severity-Prompt vereinzelt Codebook-Flags ohne moderate Finding
// setzte. _strong-Pfade bleiben aktiv, weil sie auf coffeeshop substanziell
// liefern (Phase-B-Hauptgewinn). 3.5-Flash-Severity-Kompression ist damit
// nicht vollständig adressiert (3.5 + B-light auf coffeeshop bleibt grün) —
// dokumentierte Restschwäche.
// Audit-Trail in `applied_rules` zeigt welcher Pfad getriggert hat (auch
// wenn der Score bereits durch eine andere Regel gecappt war); `score_caps`
// listet nur die effektiven Score-Änderungen.
const ANATOMY_KEYWORDS = /\b(finger|hand|hände|gesicht|antlitz|face|proport|gliedmass|extremit|limb|arm|fuss|fuß|leg)/i
const PLACEHOLDER_FINDING_PATTERNS = [
  /^\s*(noch\s+zu\s+pr[üu]fen|noch\s+unklar|needs?\s+(review|checking)|unclear\s+issue|tbd|to\s+be\s+(determined|reviewed)|no\s+(specific|concrete)\s+finding)\s*\.?\s*$/i,
  /^\s*(siehe|see)\s+(oben|above|below|details?)\s*\.?\s*$/i,
  /^\s*-+\s*$/,
]

function isSubstantiveFinding(findingText: string): boolean {
  const t = findingText.trim()
  if (t.length < 10) return false
  return !PLACEHOLDER_FINDING_PATTERNS.some(rx => rx.test(t))
}

type FindingSeverity = 'minor' | 'moderate' | 'severe'

function hasModerateOrSevere(
  findings: Array<{ finding: string; severity: FindingSeverity; category?: string }>,
  keywordFilter?: RegExp,
): boolean {
  return findings.some(f => {
    if (f.severity !== 'moderate' && f.severity !== 'severe') return false
    if (!isSubstantiveFinding(f.finding)) return false
    if (keywordFilter) {
      return keywordFilter.test(f.finding) || keywordFilter.test(f.category ?? '')
    }
    return true
  })
}

// Kanonische Status-Schwellen. Der Status (green/yellow/red) wird deterministisch
// aus dem Score abgeleitet — das LLM setzt Score und Status als separate Felder
// und lieferte sie gelegentlich widersprüchlich (z.B. Score 55 mit Status "red").
// Schwelle 75/55 konsistent mit dem Score-Cap (capDim) und Prompt-Region "≤55".
const STATUS_THRESHOLDS = { green: 75, yellow: 55 } as const

function deriveStatus(score: number): 'green' | 'yellow' | 'red' {
  if (score >= STATUS_THRESHOLDS.green) return 'green'
  if (score >= STATUS_THRESHOLDS.yellow) return 'yellow'
  return 'red'
}

// Klassifikation ist eine Anwendungsregel, kein eigenständiger LLM-Befund:
// bringt status aller drei Dimensionen mit dem (finalen) score in Einklang.
function applyStatusFromScore(analysis: AnalysisOutput): void {
  for (const dim of ['physics', 'semantics', 'bias'] as const) {
    const d = analysis.dimension_analysis[dim]
    d.status = deriveStatus(d.score)
  }
}

// Intent-Sanity: declared_intent='unspecified' bedeutet per Definition keine
// Grundlage für ein Alignment-Urteil. Wenn das LLM trotzdem 'match'/'partial'/
// 'mismatch' setzt, ist das ein Prompt-Quirk. Statt einen Refine im Schema
// (Crash bei generateObject) machen wir den Reparatur-Schritt deterministisch
// hier. declared_intent ≠ 'unspecified' bleibt unverändert.
function repairIntentAssessment(analysis: AnalysisOutput, requestedIntent: DeclaredIntent): {
  declared_intent_overridden?: { before: string; after: DeclaredIntent }
  intent_alignment_normalized?: { before: string; after: 'not_assessable' }
} {
  const ia = analysis.intent_assessment
  const report: ReturnType<typeof repairIntentAssessment> = {}
  // 1) Echo prüfen: declared_intent muss dem User-Input entsprechen.
  if (ia.declared_intent !== requestedIntent) {
    report.declared_intent_overridden = { before: ia.declared_intent, after: requestedIntent }
    ia.declared_intent = requestedIntent
  }
  // 2) Sanity: bei 'unspecified' ist alignment immer 'not_assessable'.
  if (ia.declared_intent === 'unspecified' && ia.intent_alignment !== 'not_assessable') {
    report.intent_alignment_normalized = { before: ia.intent_alignment, after: 'not_assessable' }
    ia.intent_alignment = 'not_assessable'
  }
  return report
}

// Normative-Masking-Sanity: deterministische Repair-Regeln, parallel zur
// Intent-Sanity. Skopus ist hart auf research_layer.normative_masking begrenzt
// — die Funktion liest und schreibt KEINE anderen Felder. Status-Isolation
// (Plan, Codex-Review #4).
function repairNormativeMasking(analysis: AnalysisOutput): {
  verdict_normalized?: { before: string; after: string; reason: string }
  aspects_truncated?: { before: number; after: number }
  reasoning_defaulted?: boolean
  context_inflation_downgrade?: { before: string; after: string }
} {
  const nm = analysis.research_layer.normative_masking
  const cb = analysis.research_layer.codebook
  const report: ReturnType<typeof repairNormativeMasking> = {}
  // Schema garantiert max 3 Aspects, aber wir prüfen defensiv (älter
  // generiertes JSON, manuelle Edits, künftige Schema-Lockerungen).
  if (nm.aspects.length > 3) {
    report.aspects_truncated = { before: nm.aspects.length, after: 3 }
    nm.aspects = nm.aspects.slice(0, 3)
  }
  // Sanity 1: not_applicable verlangt aspects=[]. Bei nicht-leerer Aspect-Liste
  // ist 'low' das schwächere, semantisch korrektere Verdict.
  if (nm.verdict === 'not_applicable' && nm.aspects.length > 0) {
    report.verdict_normalized = {
      before: nm.verdict,
      after: 'low',
      reason: 'not_applicable inkonsistent mit nicht-leeren aspects',
    }
    nm.verdict = 'low'
  }
  // Sanity 2: high ohne Aspect-Belege ist Inflation — Downgrade auf medium.
  else if (nm.verdict === 'high' && nm.aspects.length === 0) {
    report.verdict_normalized = {
      before: nm.verdict,
      after: 'medium',
      reason: 'high ohne aspects = inflationärer Befund',
    }
    nm.verdict = 'medium'
  }
  // Sanity 3: not_applicable mit Aspect-Liste leer → reasoning bekommt
  // mindestens einen Default-Hinweis, damit das Feld nicht stumm bleibt.
  if (nm.verdict === 'not_applicable' && (!nm.reasoning || nm.reasoning.trim() === '')) {
    nm.reasoning = 'Bild bietet keinen Anker für normative Bewertung.'
    report.reasoning_defaulted = true
  }
  // Sanity 4 (Round-3-Heuristik gegen Kontext-Inflation): wenn das LLM
  // ausschliesslich `lifestyle_aspiration` als Aspect setzt UND das Bild
  // KEINEN personenbezogenen Stereotyp-Flag trägt (kein has_gender_bias,
  // has_role_stereotype, has_body_stereotype), liest das Modell sehr
  // wahrscheinlich das Kontext-Label statt das tatsächliche Bild —
  // typisches Muster bei Stillleben / Symbolbildern in Lifestyle-Magazin-
  // Kontexten. Downgrade auf 'low' mit aspects=[]. Multi-Aspect-Verdicts
  // (z. B. status_signaling + success_norm + lifestyle_aspiration für ein
  // CEO-Porträt) bleiben unberührt.
  const onlyLifestyle = nm.aspects.length === 1 && nm.aspects[0] === 'lifestyle_aspiration'
  const hasPersonStereotype = cb.has_gender_bias || cb.has_role_stereotype || cb.has_body_stereotype
  if (
    (nm.verdict === 'medium' || nm.verdict === 'high') &&
    onlyLifestyle &&
    !hasPersonStereotype
  ) {
    report.context_inflation_downgrade = { before: nm.verdict, after: 'low' }
    nm.verdict = 'low'
    nm.aspects = []
    // Reasoning überschreiben, damit es nicht weiter von lifestyle_aspiration
    // redet, während verdict/aspects leer sind (Codex-Review Round 3).
    nm.reasoning =
      'Kein sichtbarer normativer Träger im Bild; Kontextlabel allein zählt nicht als lifestyle_aspiration.'
  }
  return report
}

function applyConsistencyReconcile(analysis: AnalysisOutput): ConsistencyReconcileReport {
  const cb = analysis.research_layer.codebook
  const dims = analysis.dimension_analysis
  const report: ConsistencyReconcileReport = {
    applied_rules: [],
    score_caps: [],
    flag_changes: [],
    integrity_before: Math.round((dims.physics.score + dims.semantics.score + dims.bias.score) / 3),
    integrity_after: 0,
  }

  // R1: Anatomie-Reklassifizierung — wenn physics-Findings mit ≥moderate Severity
  // Anatomy-Keywords nennen, aber has_anatomy_issue=false ist, dann den Flag
  // setzen. Minor-Findings reklassifizieren wir nicht, weil sie häufig auch bei
  // sauberen Bildern auftreten (V25-Befund: Anatomy-Kategorie wird overused).
  if (!cb.has_anatomy_issue) {
    const anatomyHit = dims.physics.findings.find(f =>
      (f.severity === 'moderate' || f.severity === 'severe') &&
      isSubstantiveFinding(f.finding) &&
      (ANATOMY_KEYWORDS.test(f.finding) || ANATOMY_KEYWORDS.test(f.category ?? '')),
    )
    if (anatomyHit) {
      cb.has_anatomy_issue = true
      report.applied_rules.push('R1_anatomy_reclassify')
      report.flag_changes.push({
        flag: 'has_anatomy_issue',
        before: false,
        after: true,
        reason: `Physik-Finding mit ≥moderate Severity nennt Anatomie-Keyword: "${anatomyHit.finding.slice(0, 80)}…"`,
      })
    }
  }

  // Helper für Score-Cap.
  // applied_rules wird IMMER gepusht (Audit-Trail: welche Regel hat getriggert),
  // score_caps nur bei tatsächlicher Score-Änderung. Damit zeigt der Audit
  // beide Regeln, wenn z.B. R2_physics_cap_strong und R3_anatomy_cap_strong
  // beide auf physics getriggert haben, obwohl nur der erste Cap effektiv ist.
  const capDim = (
    key: 'physics' | 'semantics' | 'bias',
    cap: number,
    reason: string,
    ruleLabel: string,
  ) => {
    const d = dims[key]
    report.applied_rules.push(ruleLabel)
    if (d.score <= cap) return
    const statusBefore = d.status
    const scoreBefore = d.score
    d.score = cap
    d.status = deriveStatus(cap)
    report.score_caps.push({
      dimension: key,
      score_before: scoreBefore,
      score_after: d.score,
      status_before: statusBefore,
      status_after: d.status,
      reason,
    })
  }

  // R2: Physik-Cap — Flag + Evidence + ≥moderate Finding.
  if (
    cb.has_physics_issue &&
    (cb.physics_evidence ?? []).length >= 1 &&
    hasModerateOrSevere(dims.physics.findings)
  ) {
    capDim('physics', 74, 'has_physics_issue=true mit valider Evidence und ≥moderate Finding', 'R2_physics_cap_strong')
  }

  // R3: Anatomy-Cap (lebt im physics-Block laut Schema). Trigger: Flag plus
  // (Evidence ODER anatomie-relevantes ≥moderate Finding). R3 darf weiterhin
  // ohne Evidence triggern, weil R1 has_anatomy_issue aus einem ≥moderate
  // Anatomie-Finding setzen kann.
  if (cb.has_anatomy_issue) {
    const anatomyStrong = hasModerateOrSevere(dims.physics.findings, ANATOMY_KEYWORDS)
    const hasAnatomyEvidence = (cb.anatomy_evidence ?? []).length >= 1
    if (anatomyStrong) {
      const reason = hasAnatomyEvidence
        ? 'has_anatomy_issue=true mit valider anatomy_evidence und anatomie-relevantem ≥moderate Finding'
        : 'has_anatomy_issue=true mit anatomie-relevantem ≥moderate Finding (R1-Reklassifizierung möglich, ohne Evidence)'
      capDim('physics', 74, reason, 'R3_anatomy_cap_strong')
    }
  }

  // R4: Context-Cap — analog R2.
  if (
    cb.has_context_issue &&
    (cb.context_evidence ?? []).length >= 1 &&
    hasModerateOrSevere(dims.semantics.findings)
  ) {
    capDim('semantics', 74, 'has_context_issue=true mit valider Evidence und ≥moderate Finding', 'R4_context_cap_strong')
  }

  // R5: Bias-Cap (B-light, gegen CEO-Underrating). Trigger: ein Stereotyp-
  // Flag aktiv UND mind. ein ≥moderate bias-Finding. Cap auf bias-Dimension,
  // nicht auf physics/semantics. Begründung: V25-Counter-Stereotyp-Erfahrung
  // hat reine Codebook-Flag-Trigger (ohne moderate-Finding) als instabil
  // belegt. Hier verlangen wir BEIDES (Flag UND moderate Finding), das
  // schützt vor V25-FPs und cappt CEO-typische Body-Stereotyp-Bilder.
  const hasStereotypeFlag = cb.has_body_stereotype || cb.has_role_stereotype || cb.has_gender_bias
  if (hasStereotypeFlag && hasModerateOrSevere(dims.bias.findings)) {
    const activeFlags: string[] = []
    if (cb.has_body_stereotype) activeFlags.push('has_body_stereotype')
    if (cb.has_role_stereotype) activeFlags.push('has_role_stereotype')
    if (cb.has_gender_bias) activeFlags.push('has_gender_bias')
    capDim('bias', 74, `Stereotyp-Flag aktiv (${activeFlags.join(', ')}) und ≥moderate bias-Finding`, 'R5_bias_cap_strong')
  }

  report.integrity_after = Math.round((dims.physics.score + dims.semantics.score + dims.bias.score) / 3)

  return report
}

// Phase B-light (R6.1): Aggregate-Cap nach computeIntegrityScore. Trigger ist
// ausschliesslich, dass der Reconcile-Layer einen R2/R3/R4/R5-Strong-Trigger
// gefeuert hat (RECONCILE_DIM_CAP_RULES). Ein reiner Codebook-Flag mit
// Evidence ohne R*-Trigger reicht NICHT — das war der versteckte
// evidence_only-Restpfad, der in B7 die Kindergarden-FP-Welle ausgelöst hat.
// UND der aggregierte integrity_score > AGGREGATE_CAP_THRESHOLD (strict >)
// → deckeln auf AGGREGATE_CAP. Bias wird über R5 ebenfalls aggregiert
// (gegen CEO-Underrating), aber nur sofern R5_bias_cap_strong getriggert
// hat — die V25-Schutzklausel verlangt Flag UND moderate Finding.
//
// Score-Hygiene: hat KEINE direkte UI-Verdict-Wirkung (overallVerdict im
// View-Model leitet sich aus Dimension-Status + Hints ab). Die UI-Ampel
// wird durch R2/R3/R4/R5-Dimension-Caps auf yellow geschoben. B5 reduziert
// die intern erkennbare Inkonsistenz zwischen Codebook-Flag-Evidence und
// integrity_score_local.
//
// Hinweis: `reconcileReport.integrity_after` bleibt der Wert NACH
// Dimension-Reconcile (R1-R5), nicht nach Aggregate-Cap. Der finale
// `integrity_score_local` ist immer der Return-Wert dieser Funktion;
// `aggregate_cap.score_after` macht die Differenz nachvollziehbar.
const AGGREGATE_CAP_THRESHOLD = 80
const AGGREGATE_CAP = 80
const RECONCILE_DIM_CAP_RULES = new Set([
  'R2_physics_cap_strong',
  'R3_anatomy_cap_strong',
  'R4_context_cap_strong',
  'R5_bias_cap_strong',
])

function applyAggregateCap(
  rawIntegrity: number,
  _analysis: AnalysisOutput,
  report: ConsistencyReconcileReport,
): number {
  const triggeringRules = report.applied_rules.filter(r => RECONCILE_DIM_CAP_RULES.has(r))

  if (triggeringRules.length === 0 || rawIntegrity <= AGGREGATE_CAP_THRESHOLD) {
    return rawIntegrity
  }

  const capped = AGGREGATE_CAP
  report.aggregate_cap = {
    applied: true,
    score_before: rawIntegrity,
    score_after: capped,
    cap: AGGREGATE_CAP,
    reason: `Reconcile-Dimension-Cap aktiv (${triggeringRules.join(', ')}), aber integrity_score > ${AGGREGATE_CAP_THRESHOLD}. Aggregate-Cap reduziert auf ${AGGREGATE_CAP} (Score-Hygiene, keine UI-Verdict-Wirkung).`,
    triggering_rules: triggeringRules,
  }
  return capped
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

  // dominant_error_type-Normalisierung läuft nicht mehr hier, sondern final
  // nach applyConsistencyReconcile (siehe runSemanticAnalysis).
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

// Finale Normalisierung: bringt dominant_error_type mit den — nach Evidenz-
// Filter UND Consistency-Reconcile — gültigen Codebook-Flags in Einklang.
// Greift NUR ein, wenn der LLM-Wert inkonsistent ist; ein bereits konsistenter
// Wert bleibt unangetastet (inkl. legitimer LLM-Wahl eines konkreten Typs bei
// ≥2 aktiven Flags). Ändert ausschliesslich dominant_error_type, keine Flags
// oder Scores. Gibt den Audit-Eintrag zurück, wenn korrigiert wurde, sonst null.
//
// Aufruf bewusst am Ende der Pipeline (nach applyConsistencyReconcile), damit
// auch dort gesetzte flag_changes erfasst werden. Frühere Variante lief nur im
// Evidenz-Filter und nur bei Flag-Downgrades — beides per Reconcile-Test
// (2026-05-20) als Lücke belegt.
export function reconcileDominantErrorType(
  analysis: AnalysisOutput,
): NonNullable<ConsistencyReconcileReport['dominant_error_type_change']> | null {
  const cb = analysis.research_layer.codebook
  const current = analysis.research_layer.dominant_error_type

  const activeTypes: ('physics' | 'anatomy' | 'context')[] = []
  if (cb.has_physics_issue) activeTypes.push('physics')
  if (cb.has_anatomy_issue) activeTypes.push('anatomy')
  if (cb.has_context_issue) activeTypes.push('context')

  let consistent: boolean
  let normalized: AnalysisOutput['research_layer']['dominant_error_type']
  if (activeTypes.length === 0) {
    consistent = current === 'none'
    normalized = 'none'
  } else if (activeTypes.length === 1) {
    consistent = current === activeTypes[0]
    normalized = activeTypes[0]
  } else {
    // ≥2 aktive Flags: 'mixed' oder ein konkreter aktiver Typ ist legitim.
    consistent = current === 'mixed' || (activeTypes as string[]).includes(current)
    normalized = 'mixed'
  }

  if (consistent) return null

  analysis.research_layer.dominant_error_type = normalized
  return { before: current, after: normalized, active_types: [...activeTypes] }
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
  declaredIntent?: DeclaredIntent
  mediaType?: string
  model?: string
  temperature?: number
  thinkingLevel?: ThinkingLevel
  mediaResolution?: MediaResolution
  lang?: 'de' | 'en'
  // Etappe 6 (additiv): Abbruch-/Timeout-Durchgriff. Wird an die vier AI-SDK-Calls
  // (Analyse + Aesthetik, je generateText/generateObject) als abortSignal gereicht.
  // Die parallelen Modal-Nebencalls (runModalAesthetic/runClipAlignment) behalten
  // bewusst ihre eigenen Controller – sie sind nicht token-teuer (Kostenschutz-Kern
  // liegt bei den AI-SDK-Calls); ein Durchreichen waere ein groesserer Eingriff.
  signal?: AbortSignal
}

// Format: <enum-id> (<short gloss>). Das LLM muss den exakten Enum-Wert
// (links vom Klammer-Gloss) in intent_assessment.declared_intent echoen.
// Der Gloss ist nur als menschlich lesbare Erinnerung für das LLM da.
const DECLARED_INTENT_LABELS_EN: Record<DeclaredIntent, string> = {
  affirmative: 'affirmative (use the image as-is to support the topic)',
  critical: 'critical (use the image to critically frame or question the topic)',
  illustrative: 'illustrative (use the image as a neutral example or generic illustration)',
  unspecified: 'unspecified (no editorial intent declared by the user)',
}

const DECLARED_INTENT_LABELS_DE: Record<DeclaredIntent, string> = {
  affirmative: 'affirmative (affirmativ — Bild soll das Thema bestätigend stützen)',
  critical: 'critical (kritisch — Bild soll das Thema kritisch einordnen oder hinterfragen)',
  illustrative: 'illustrative (illustrativ — Bild dient als neutrales Beispiel oder generische Illustration)',
  unspecified: 'unspecified (nicht angegeben — keine redaktionelle Haltung erklärt)',
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
    "masking_reasoning": "...",
    "normative_masking": {
      "verdict": "low | medium | high | not_applicable",
      "aspects": ["beauty_ideal", "status_signaling"],
      "reasoning": "..."
    }
  },
  "integrity_score_llm": {
    "score": 0-100,
    "reasoning": "..."
  },
  "intent_assessment": {
    "declared_intent": "affirmative | critical | illustrative | unspecified",
    "intent_alignment": "match | partial | mismatch | not_assessable",
    "framing_risk": "low | medium | high",
    "reasoning": "..."
  }
}

WICHTIG: Verwende EXAKT diese Feldnamen. Keine Umbenennung, keine Verschachtelung unter "phase1"/"phase2" etc.
"declared_intent" muss EXAKT den vom User erklärten Wert echoen (siehe "Erklärte redaktionelle Haltung" im Input). Bei "nicht angegeben" → "unspecified" + "intent_alignment"="not_assessable".`

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
    "masking_reasoning": "...",
    "normative_masking": {
      "verdict": "low | medium | high | not_applicable",
      "aspects": ["beauty_ideal", "status_signaling"],
      "reasoning": "..."
    }
  },
  "integrity_score_llm": {
    "score": 0-100,
    "reasoning": "..."
  },
  "intent_assessment": {
    "declared_intent": "affirmative | critical | illustrative | unspecified",
    "intent_alignment": "match | partial | mismatch | not_assessable",
    "framing_risk": "low | medium | high",
    "reasoning": "..."
  }
}

IMPORTANT: use EXACTLY these field names. No renaming, no nesting under "phase1"/"phase2" etc.
Enum values are English IDs as shown. Free-text fields (finding, observation, reasoning,
reason_for_relevance, masked_issue, masking_reasoning, intent_assessment.reasoning, etc.)
must be written in German per the LANGUAGE POLICY.
"declared_intent" must EXACTLY echo the user-declared value (see "Declared editorial intent"
in the user input). When unspecified → "declared_intent"="unspecified" + "intent_alignment"="not_assessable".`

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
    consistency_reconcile?: ConsistencyReconcileReport
    laion_aesthetic?: ModalAestheticResult
    laion_aesthetic_error?: string
    clip_alignment?: ClipAlignmentMeta
    clip_alignment_error?: string
    test_config?: {
      temperature?: number
      thinkingLevel?: ThinkingLevel
      mediaResolution?: MediaResolution
    }
    analysis_sampling?: SamplingSnapshot
    aesthetic_sampling?: SamplingSnapshot
  }
}

interface SamplingSnapshot {
  temperature: number
  topK: number
  topP?: number
  seed?: number
}

// Best-Effort-Determinismus laut Google-Empfehlung (siehe Recherche 2026-05-18).
// Reduziert sichtbares Sampling-Rauschen so weit wie möglich; Vision-Pipeline
// kann trotzdem Restvarianz produzieren (GPU-Numerik, nicht-seedbares Pre-Processing,
// Modell-Updates über Zeit). Wir akzeptieren das und dokumentieren es in 6.3.
const DETERMINISTIC_SAMPLING = {
  temperature: 0,
  topK: 1,
  topP: 1,
  seed: 42,
} as const

// Per-Provider-Sampling: Anthropic ignoriert seed komplett und top_p, sobald
// temperature gesetzt ist; OpenRouter ist heterogen. Für non-Google-Provider
// senden wir deshalb nur temperature + topK und dokumentieren das in meta.
function buildSampling(useTextFallback: boolean, overrideTemperature?: number): SamplingSnapshot {
  const temperature =
    typeof overrideTemperature === 'number' ? overrideTemperature : DETERMINISTIC_SAMPLING.temperature
  if (useTextFallback) {
    return {
      temperature,
      topK: DETERMINISTIC_SAMPLING.topK,
    }
  }
  return {
    temperature,
    topK: DETERMINISTIC_SAMPLING.topK,
    topP: DETERMINISTIC_SAMPLING.topP,
    seed: DETERMINISTIC_SAMPLING.seed,
  }
}

export async function runSemanticAnalysis(
  imageBase64: string,
  options?: SemanticAnalysisOptions
): Promise<SemanticAnalysisResult> {
  const mediaType = options?.mediaType ?? 'image/jpeg'
  const lang = options?.lang ?? DEFAULT_LANG
  const analysisPrompt = lang === 'en' ? ANALYSIS_PROMPT_EN : ANALYSIS_PROMPT
  const declaredIntent: DeclaredIntent = options?.declaredIntent ?? 'unspecified'
  const intentLabel = lang === 'en'
    ? DECLARED_INTENT_LABELS_EN[declaredIntent]
    : DECLARED_INTENT_LABELS_DE[declaredIntent]
  // Injection-Haertung (Etappe 6): User-Freitext (prompt/context) in benannte
  // XML-Tags wrappen + escapen, damit ein eingeschleustes </…> nicht aus der
  // Datenzone ausbricht und als Instruktion gelesen wird. intentLabel ist eine
  // kontrollierte Enum-Map (kein Freitext) → nicht escapen.
  const escapeXml = (s: string): string =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  // Nullish-Semantik wie zuvor (Codex-Review A): leerer String bleibt leer,
  // nur null/undefined -> Platzhalter (keine Verhaltensaenderung ggü. dem alten `??`).
  const promptField = options?.prompt != null ? escapeXml(options.prompt) : (lang === 'en' ? 'not provided' : 'nicht vorhanden')
  const contextField = options?.context != null ? escapeXml(options.context) : (lang === 'en' ? 'not provided' : 'nicht vorhanden')
  const userText = lang === 'en'
    ? `Original prompt:\n<original_prompt>${promptField}</original_prompt>\nUsage context:\n<usage_context>${contextField}</usage_context>\nDeclared editorial intent: ${intentLabel}`
    : `Original-Prompt:\n<original_prompt>${promptField}</original_prompt>\nNutzungskontext:\n<usage_context>${contextField}</usage_context>\nErklärte redaktionelle Haltung: ${intentLabel}`
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
  const analysisSampling = buildSampling(analysisResolved.useTextFallback, options?.temperature)
  const aestheticSampling = buildSampling(aestheticResolved.useTextFallback)
  const analysisGenerationSettings = {
    ...analysisSampling,
    ...(hasGoogleOptions && !analysisResolved.useTextFallback ? { providerOptions: { google: googleOptions } } : {}),
  }
  const aestheticGenerationSettings = {
    ...aestheticSampling,
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
      // Log-Filter (Etappe 6): rohen LLM-Text NICHT in Produktion loggen
      // (Server-Spec: kein LLM-Rohtext im Log). Lokal/CLI/web bleibt er fuers
      // R-Reihen-Debugging sichtbar; in Prod nur per explizitem Opt-in.
      const rawLogAllowed = process.env.NODE_ENV !== 'production' || process.env.SEMANTIC_DEBUG_RAW === '1'
      if (rawLogAllowed) {
        console.error(`\n[${parseLabel}] JSON-Parsing fehlgeschlagen. Roher Text (erste 500 Zeichen):`)
        console.error(text.slice(0, 500))
      } else {
        console.error(`[${parseLabel}] JSON-Parsing fehlgeschlagen (Rohtext unterdrueckt, ${text.length} Zeichen).`)
      }
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
        abortSignal: options?.signal,
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
      abortSignal: options?.signal,
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
        ...aestheticGenerationSettings,
        abortSignal: options?.signal,
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
      ...aestheticGenerationSettings,
      abortSignal: options?.signal,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', image: imageBuffer, mediaType: mediaType },
        ],
      }],
    }).then(r => r.object)
  }

  // CLIP-Text-Inputs vorbereiten: trim + nur non-empty in den Texts-Array.
  // Beide leer => Modal-Call wird ganz uebersprungen (skipped-Pfad).
  // typeof-Check verhindert .trim()-Wurf bei untypisierten Callern.
  const clipTexts: ClipTextEntry[] = []
  const promptTrimmed = typeof options?.prompt === 'string' ? options.prompt.trim() : ''
  const contextTrimmed = typeof options?.context === 'string' ? options.context.trim() : ''
  if (promptTrimmed.length > 0) clipTexts.push({ id: 'prompt', text: promptTrimmed })
  if (contextTrimmed.length > 0) clipTexts.push({ id: 'context', text: contextTrimmed })

  type ClipPromise =
    | { ok: true; value: ClipAlignmentMeta }
    | { ok: false; error: string }
  const clipCall: Promise<ClipPromise> = clipTexts.length === 0
    ? Promise.resolve<ClipPromise>({
        ok: true,
        value: { skipped: true, reason: 'no_text_input' },
      })
    : runClipAlignment(imageBase64, clipTexts)
        // .then().catch() statt .then(success, error), damit auch ein Wurf im
        // Success-Mapping (toClipAlignmentMeta) gefangen wird.
        .then<ClipPromise>(r => ({ ok: true as const, value: toClipAlignmentMeta(r) }))
        .catch(err => {
          const msg = err instanceof Error ? err.message : String(err)
          console.warn(`[CLIP] Modal-CLIP fehlgeschlagen: ${msg}`)
          return { ok: false as const, error: msg }
        })

  const start = Date.now()
  const [analysis, aesthetic, laionResult, clipResult] = await Promise.all([
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
    clipCall,
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

  const reconcileReport = applyConsistencyReconcile(analysis)
  if (reconcileReport.applied_rules.length > 0) {
    console.warn(`[R5 Consistency-Reconcile] Regeln angewendet: ${reconcileReport.applied_rules.join(', ')}; Score-Caps: ${reconcileReport.score_caps.map(c => `${c.dimension} ${c.score_before}→${c.score_after}`).join(', ')}`)
  }

  // Status deterministisch aus dem (finalen, ggf. gecappten) Score ableiten.
  applyStatusFromScore(analysis)

  // Intent-Sanity: declared_intent muss dem User-Input entsprechen,
  // intent_alignment 'not_assessable' wenn declared_intent='unspecified'.
  const intentRepair = repairIntentAssessment(analysis, declaredIntent)
  if (intentRepair.declared_intent_overridden) {
    console.warn(
      `[Intent-Repair] declared_intent normalisiert: ${intentRepair.declared_intent_overridden.before} → ${intentRepair.declared_intent_overridden.after} (User-Input überschreibt LLM-Echo)`,
    )
  }
  if (intentRepair.intent_alignment_normalized) {
    console.warn(
      `[Intent-Repair] intent_alignment normalisiert: ${intentRepair.intent_alignment_normalized.before} → not_assessable (declared_intent='unspecified')`,
    )
  }

  // Normative-Masking-Sanity (Plan: nach Intent-Repair, vor dominant_error_type-
  // Reconcile). Skopus hart auf research_layer.normative_masking begrenzt.
  const normRepair = repairNormativeMasking(analysis)
  if (normRepair.verdict_normalized) {
    console.warn(
      `[Normative-Masking-Repair] verdict normalisiert: ${normRepair.verdict_normalized.before} → ${normRepair.verdict_normalized.after} (${normRepair.verdict_normalized.reason})`,
    )
  }
  if (normRepair.aspects_truncated) {
    console.warn(
      `[Normative-Masking-Repair] aspects gekürzt: ${normRepair.aspects_truncated.before} → ${normRepair.aspects_truncated.after}`,
    )
  }
  if (normRepair.reasoning_defaulted) {
    console.warn(
      `[Normative-Masking-Repair] reasoning leer bei not_applicable → Default-Text gesetzt`,
    )
  }
  if (normRepair.context_inflation_downgrade) {
    console.warn(
      `[Normative-Masking-Repair] Kontext-Inflation entdeckt (nur lifestyle_aspiration, kein Personen-Stereotyp): ${normRepair.context_inflation_downgrade.before} → ${normRepair.context_inflation_downgrade.after}`,
    )
  }

  // Finale dominant_error_type-Normalisierung — nach allen flag-mutierenden
  // Schritten (Evidenz-Filter + Consistency-Reconcile).
  const detChange = reconcileDominantErrorType(analysis)
  if (detChange) {
    reconcileReport.dominant_error_type_change = detChange
    console.warn(
      `[Reconcile] dominant_error_type normalisiert: ${detChange.before} → ${detChange.after} ` +
      `(aktive Fehlertypen: ${detChange.active_types.join(', ') || 'keine'})`,
    )
  }

  const duration_ms = Date.now() - start
  const rawLocalIntegrity = computeIntegrityScore(analysis.dimension_analysis)
  const localIntegrity = applyAggregateCap(rawLocalIntegrity, analysis, reconcileReport)
  if (reconcileReport.aggregate_cap?.applied) {
    console.warn(
      `[R6 Aggregate-Cap] integrity_score gedeckelt: ${reconcileReport.aggregate_cap.score_before} → ${reconcileReport.aggregate_cap.score_after} ` +
      `(Trigger: ${reconcileReport.aggregate_cap.triggering_rules.join(', ')})`,
    )
  }
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
    maskingScore,
  )
  if (maskingVerdict !== verdictBeforeReconcile) {
    analysis.research_layer.masking_verdict = maskingVerdict
    const sourceLabel = aestheticCombinedSource === 'sonnet+v25'
      ? `Mittel aus Sonnet ${sonnetAesthetic} und V2.5 ${v25Normalized}`
      : `Sonnet ${sonnetAesthetic} (V2.5 nicht verfügbar)`
    analysis.research_layer.masking_reasoning =
      `Verdict per Reconcile auf "${maskingVerdict}" gesetzt (Vorher: "${verdictBeforeReconcile}"). ` +
      `Evidenzbasierte Ableitung (${analysis.research_layer.masking_evidence.length} Einträge); ` +
      `Plausibilitäts-Deckel auf 'low' greift bei Maskierungs-Score ≤ 0. ` +
      `Hier: Ästhetik ${aestheticCombined}/100 (${sourceLabel}) − Integrität ${localIntegrity} = Maskierungs-Score ${maskingScore}.`
    if (!maskingReport.verdict_downgraded) {
      maskingReport.verdict_downgraded = true
      maskingReport.verdict_before = verdictBeforeReconcile
    }
    maskingReport.verdict_after = maskingVerdict
    console.warn(`[R4.2.2 Masking-Filter] masking_verdict via maskingScore+evidence reconcile: ${verdictBeforeReconcile} → ${maskingVerdict} (maskingScore=${maskingScore}, combined=${aestheticCombined}, source=${aestheticCombinedSource})`)
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
      consistency_reconcile: reconcileReport,
      ...(laionResult.ok ? { laion_aesthetic: laionResult.value } : { laion_aesthetic_error: laionResult.error }),
      ...(clipResult.ok ? { clip_alignment: clipResult.value } : { clip_alignment_error: clipResult.error }),
      ...(typeof options?.temperature === 'number' || options?.thinkingLevel || options?.mediaResolution
        ? {
            test_config: {
              ...(typeof options?.temperature === 'number' ? { temperature: options.temperature } : {}),
              ...(options?.thinkingLevel ? { thinkingLevel: options.thinkingLevel } : {}),
              ...(options?.mediaResolution ? { mediaResolution: options.mediaResolution } : {}),
            },
          }
        : {}),
      analysis_sampling: analysisSampling,
      aesthetic_sampling: aestheticSampling,
    },
  }
}
