<script setup lang="ts">
// DiagnoseCockpit (Etappe 2) – Root des Diagnose-Cockpits. Ersetzt im Screen-Pfad die
// lineare BefundKarte (Swap erst Etappe 5). Spiegelt deren Props-Schnittstelle (+ submitted*),
// erzeugt benannte computed-Projektionen (render-fertig) und verteilt sie an die Panel-Kinder.
// Sortierung/Labels/Nullfälle bleiben hier – die visuellen Kinder bekommen nur fertige Daten.
import { computed } from 'vue'
import type { AnalysisViewModel, UsageForm } from '~/types/analysis'
import {
  STATUS_TO_SEVERITY,
  STATUS_WORD,
  DIMENSION_LABELS,
  DIMENSION_DESC,
  RISK_LEVEL_LABEL,
  INTENT_LABELS,
  NORMATIVE_VERDICT_LABELS,
} from '~/lib/severity'
import { buildInspectorSpots } from '~/lib/overlay-spots'
import CockpitVerdikt from './CockpitVerdikt.vue'
import BildInspektor from './BildInspektor.vue'
import CockpitEntscheidung from './CockpitEntscheidung.vue'
import CockpitProtokoll from './CockpitProtokoll.vue'

const props = withDefaults(
  defineProps<{
    vm: AnalysisViewModel
    imageUrl?: string | null
    submittedUsageForm?: UsageForm | null
    submittedContext?: string | null
    submittedPrompt?: string | null
    sampleId?: string
    timestamp?: string
    imageAspect?: '4:5' | '3:4' | '1:1'
  }>(),
  {
    imageUrl: null,
    submittedUsageForm: null,
    submittedContext: null,
    submittedPrompt: null,
    sampleId: undefined,
    timestamp: undefined,
    imageAspect: '4:5',
  },
)

const HEDGE = 'Das Gesamturteil folgt aus den Befunden, nicht aus dem Integritätswert.'

// Konkrete Bild-Befunde (= dimension_analysis.findings) – die im Bild beobachteten,
// verständlichen Einzelbefunde. Single Source für Sektion 02 (Nächster Schritt), den
// Bildbefunde-Tab und die Befund-Zählung. severity-sortiert (stark→gering). Faithful:
// Befundtext verbatim vom Modell, Label deterministisch aus der Kategorie abgeleitet.
const FINDING_CATEGORY_LABEL: Record<string, string> = {
  text_error: 'Text/Anzeige',
  light_consistency: 'Lichtkonsistenz',
  shadow: 'Schatten',
  reflection: 'Spiegelung',
  perspective: 'Perspektive',
  proportion: 'Proportion',
  material: 'Material',
  anatomy: 'Anatomie',
  role_stereotype: 'Rollenbild',
  body_stereotype: 'Körperbild',
  gender_bias: 'Geschlechterbild',
  context_break: 'Kontextbruch',
  hallucination: 'Halluzination',
}
const FINDING_SEV_RANK: Record<string, number> = { severe: 0, moderate: 1, minor: 2 }
const FINDING_SEV_WORD: Record<string, string> = { severe: 'stark', moderate: 'mittel', minor: 'gering' }
const humanizeCat = (s: string) => s.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())

const findings = computed(() => {
  const dimA = props.vm.debug.rawJson.analysis.dimension_analysis
  const out = (['physics', 'semantics', 'bias'] as const).flatMap((dim) =>
    (dimA[dim].findings ?? []).map((f) => ({
      dim,
      catLabel: FINDING_CATEGORY_LABEL[f.category] ?? humanizeCat(f.category),
      text: f.finding,
      severity: f.severity,
    })),
  )
  return out.slice().sort((a, b) => (FINDING_SEV_RANK[a.severity] ?? 3) - (FINDING_SEV_RANK[b.severity] ?? 3))
})

const hero = computed(() => {
  const v = props.vm
  const status = v.overallVerdict.status
  const dimKeys = ['physics', 'semantics', 'bias'] as const
  const dims = dimKeys.map((key) => {
    const d = v.dimensions[key]
    return {
      key,
      name: DIMENSION_LABELS[key],
      desc: DIMENSION_DESC[key],
      score: d.score,
      severity: STATUS_TO_SEVERITY[d.status],
      word: STATUS_WORD[d.status],
    }
  })
  const n = findings.value.length
  return {
    status,
    severity: STATUS_TO_SEVERITY[status],
    statusWord: STATUS_WORD[status],
    headline: v.overallVerdict.headline.replace(/[.\s]+$/, ''),
    lead: v.overallVerdict.recommendation,
    hedge: HEDGE,
    metaText: `${n} ${n === 1 ? 'Befund' : 'Befunde'} erfasst`,
    integrity: v.integrityScore,
    aesthetic: v.aestheticCombined,
    readingModeLabel: `${v.readingMode.label} (${v.readingMode.code})`,
    dims,
  }
})

// Priority „Nächster Schritt": die Top-3 konkreten Befunde als verständliche
// Prüf-Schritte (Label = Kategorie, Beschreibung = Modell-Befundtext verbatim).
const PRIORITY_HEADLINE = {
  green: 'Freigabe möglich',
  yellow: 'Sichtprüfung vor Freigabe',
  red: 'Vor Freigabe überarbeiten',
} as const

const priority = computed(() => ({
  headline: PRIORITY_HEADLINE[props.vm.overallVerdict.status],
  copy: 'Kein pauschaler Ausschluss. Prüfe zuerst die konkret benannten Befunde und entscheide im Nutzungskontext.',
  items: findings.value.slice(0, 3).map((f) => ({ label: f.catLabel, description: f.text })),
}))

// Bild-Overlay (Etappe 3): rohe evidenceSpots → render-fertige InspectorSpots
// (F2-Qualifikation + Layer + Treiber-Label, deterministisch in lib/overlay-spots).
const inspectorSpots = computed(() => buildInspectorSpots(props.vm.evidenceSpots))

// ── Prüfprotokoll-Projektionen (render-fertig) ───────────────────────────────
const ALIGN_LABEL = {
  match: { w: 'stimmig', tone: 'safe' },
  partial: { w: 'teilweise', tone: 'warn' },
  mismatch: { w: 'unstimmig', tone: 'crit' },
  not_assessable: { w: 'nicht beurteilbar', tone: 'neutral' },
} as const
const FRAMING_LABEL = {
  low: { w: 'gering', tone: 'safe' },
  medium: { w: 'mittel', tone: 'warn' },
  high: { w: 'hoch', tone: 'crit' },
} as const
const REALISM_LABEL: Record<string, string> = { high: 'hoch', medium: 'mittel', low: 'niedrig' }
const ERROR_TYPE_SHORT: Record<string, string> = {
  physics: 'Physik',
  anatomy: 'Anatomie',
  context: 'Kontext',
  mixed: 'gemischt',
  none: 'keiner',
}

const FINDING_SEV_TONE: Record<string, 'crit' | 'warn' | 'minor'> = {
  severe: 'crit',
  moderate: 'warn',
  minor: 'minor',
}
const findingRows = computed(() =>
  findings.value.map((f, i) => ({
    id: `F${i + 1}`,
    category: `${DIMENSION_LABELS[f.dim]} · ${f.catLabel}`,
    text: f.text,
    severityWord: FINDING_SEV_WORD[f.severity] ?? f.severity,
    severityTone: FINDING_SEV_TONE[f.severity] ?? 'warn',
  })),
)

const maskingNote = computed(() => {
  const note = props.vm.maskingReviewNote
  if (!note) return null
  return {
    text: note.text,
    links: props.vm.maskingMarkedSpots.map((s) => ({ code: s.driverCode, label: s.driverLabel, area: s.area })),
  }
})

const biasAxes = computed(() =>
  props.vm.biasAxesDetails.map((ax) => {
    const supports = ax.evidence.some((e) => e.supportsBiasFinding)
    return {
      label: ax.label,
      meta: supports
        ? [`Risiko ${RISK_LEVEL_LABEL[ax.riskLevel]}`, `Konfidenz ${RISK_LEVEL_LABEL[ax.confidence]}`]
        : ['Deskriptive Prüfachse', 'kein Bias-Befund'],
      pairs: ax.evidence.map((e) => ({
        observation: e.observation,
        interpretation: e.interpretation,
        supports: e.supportsBiasFinding,
      })),
    }
  }),
)

const context = computed(() => {
  const v = props.vm
  const ia = v.intentAssessment
  const norm = v.normativeMasking
  return {
    items: [
      { k: 'Erklärte Haltung', v: INTENT_LABELS[ia.declaredIntent], tone: 'ink' as const },
      { k: 'Passung', v: ALIGN_LABEL[ia.intentAlignment].w, tone: ALIGN_LABEL[ia.intentAlignment].tone },
      { k: 'Framing-Risiko', v: FRAMING_LABEL[ia.framingRisk].w, tone: FRAMING_LABEL[ia.framingRisk].tone },
      { k: 'Nutzungskontext', v: props.submittedContext || 'nicht übergeben', tone: 'ink' as const },
      { k: 'Original-Prompt', v: props.submittedPrompt || 'nicht vorhanden', tone: 'ink' as const },
    ],
    drivers: v.visualDrivers.map((d) => ({ code: d.code, label: d.label })),
    normative:
      norm.verdict !== 'not_applicable'
        ? { verdictWord: NORMATIVE_VERDICT_LABELS[norm.verdict], reasoning: norm.reasoning }
        : null,
    notes: [v.intentRecommendationNote, v.usageFormNote, v.normativeMaskingNote].filter(
      (n): n is string => typeof n === 'string' && n.length > 0,
    ),
  }
})

const readingModeMaskingLogic = computed(() => props.vm.readingModeMaskingLogic)
const protokollCounts = computed(() => ({
  findings: findings.value.length,
  bias: props.vm.biasAxesDetails.length,
}))

// ── Meta (Pipeline-Rohwerte) ─────────────────────────────────────────────────
const metaRows = computed(() => {
  const d = props.vm.debug
  const realismRaw = d.rawJson.analysis.research_layer.codebook.visual_realism_level
  return [
    { k: 'Analyse-Modell', v: d.modelLabel },
    { k: 'Ästhetik-Modell', v: d.aestheticModelLabel ?? '–' },
    { k: 'Laufzeit', v: `${(d.durationMs / 1000).toFixed(1).replace('.', ',')} s` },
    { k: 'Realismus', v: REALISM_LABEL[String(realismRaw)] ?? String(realismRaw) },
    { k: 'Fehlertyp', v: ERROR_TYPE_SHORT[props.vm.dominantErrorType] ?? props.vm.dominantErrorType },
    { k: 'Integrität', v: String(props.vm.integrityScore) },
    { k: 'Ästhetik', v: String(props.vm.aestheticCombined) },
    { k: 'LAION norm.', v: d.v25Aesthetic !== null ? String(d.v25Aesthetic) : '–' },
  ]
})

const contextDate = computed(() => props.timestamp ?? null)
</script>

<template>
  <section class="cockpit" aria-label="Diagnose-Cockpit – Analysebericht">
    <div class="contextline">
      <span>Analysebericht</span>
      <span class="contextline__rule" aria-hidden="true" />
      <span v-if="contextDate">{{ contextDate }}</span>
      <span v-else>SemantIC · Visual Integrity Validator</span>
    </div>

    <CockpitVerdikt
      :status="hero.status"
      :severity="hero.severity"
      :status-word="hero.statusWord"
      :headline="hero.headline"
      :lead="hero.lead"
      :hedge="hero.hedge"
      :meta-text="hero.metaText"
      :integrity="hero.integrity"
      :aesthetic="hero.aesthetic"
      :reading-mode-label="hero.readingModeLabel"
      :dims="hero.dims"
    />

    <div class="workbench">
      <BildInspektor :image-url="imageUrl" image-alt="Analysiertes KI-Bild im Diagnose-Cockpit" :spots="inspectorSpots" />
      <CockpitEntscheidung
        :headline="priority.headline"
        :copy="priority.copy"
        :items="priority.items"
        :integrity="hero.integrity"
        :aesthetic="hero.aesthetic"
      />
    </div>

    <CockpitProtokoll
      :findings="findingRows"
      :masking-note="maskingNote"
      :bias-axes="biasAxes"
      :context="context"
      :reading-mode-masking-logic="readingModeMaskingLogic"
      :counts="protokollCounts"
    />

    <details class="meta">
      <summary>Pipeline-Metadaten &amp; Rohwerte</summary>
      <div class="meta__grid">
        <div v-for="(m, i) in metaRows" :key="i" class="meta__cell">
          <span>{{ m.k }}</span><strong>{{ m.v }}</strong>
        </div>
      </div>
    </details>

    <footer class="cockpit-footer">
      <p class="cockpit-footer__lead">Hinweise, kein Nachweis. Die letzte Entscheidung bleibt bei dir.</p>
      <p class="cockpit-footer__note">
        <span class="cockpit-footer__dot" aria-hidden="true" />Befunde sind unverifizierte Modell-Behauptungen.
      </p>
    </footer>
  </section>
</template>

<style scoped>
.cockpit {
  width: min(1380px, 100%);
  margin: 0 auto;
  padding: 30px clamp(20px, 4vw, 48px) 72px;
}
.contextline {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  color: var(--subtle);
  font-family: var(--mono);
  font-size: 10.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.contextline__rule {
  width: 34px;
  height: 1px;
  background: var(--line-strong);
}
.workbench {
  display: grid;
  grid-template-columns: minmax(0, 1.38fr) minmax(390px, 0.72fr);
  gap: 18px;
  margin-top: 18px;
  align-items: start;
}
@media (max-width: 980px) {
  .workbench {
    grid-template-columns: 1fr;
  }
}
.meta {
  margin-top: 18px;
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--canvas);
}
.meta summary {
  min-height: 48px;
  padding: 13px 17px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  list-style: none;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.meta summary::-webkit-details-marker {
  display: none;
}
.meta summary::before {
  content: '+';
  color: var(--ink);
  font-size: 15px;
  line-height: 1;
}
.meta[open] summary::before {
  content: '–';
}
.meta__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--line);
  border-top: 1px solid var(--line);
}
.meta__cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 17px;
  background: var(--canvas);
}
.meta__cell span {
  color: var(--subtle);
  font-family: var(--mono);
  font-size: 9.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.meta__cell strong {
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 600;
}
@media (max-width: 760px) {
  .meta__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.cockpit-footer {
  margin-top: 28px;
  padding-top: 22px;
  border-top: 1px solid var(--line);
}
.cockpit-footer__lead {
  margin: 0;
  color: var(--ink-soft);
  font-size: 14px;
}
.cockpit-footer__note {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0 0;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.03em;
}
.cockpit-footer__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--warn);
}
</style>
