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
  NORMATIVE_ASPECT_LABELS,
} from '~/lib/severity'
import { buildInspectorSpots } from '~/lib/overlay-spots'
import { useReportT } from '~/composables/useReportT'
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

// Report-Sprache: eingefroren zu Analysebeginn (vm.reportLang, via analyze.vue-provide).
// rt()/rtp() übersetzen report.*-Keys in dieser festen Locale – NICHT in der UI-Locale.
const { rt, rtp, reportLang } = useReportT()

// Konkrete Bild-Befunde (= dimension_analysis.findings) – die im Bild beobachteten,
// verständlichen Einzelbefunde. Single Source für Sektion 02 (Nächster Schritt), den
// Bildbefunde-Tab und die Befund-Zählung. severity-sortiert (stark→gering). Faithful:
// Befundtext verbatim vom Modell, Label deterministisch aus der Kategorie abgeleitet
// (report.findingCategory.*; unbekannte Kategorien fallen auf humanizeCat zurück).
const FINDING_CATEGORY_CODES = new Set([
  'text_error',
  'light_consistency',
  'shadow',
  'reflection',
  'perspective',
  'proportion',
  'material',
  'anatomy',
  'role_stereotype',
  'body_stereotype',
  'gender_bias',
  'context_break',
  'hallucination',
])
const FINDING_SEV_RANK: Record<string, number> = { severe: 0, moderate: 1, minor: 2 }
const FINDING_SEVERITIES = new Set(['severe', 'moderate', 'minor'])
const findingSevWord = (sev: string) =>
  FINDING_SEVERITIES.has(sev) ? rt(`report.findingSeverity.${sev}`) : sev
const humanizeCat = (s: string) => s.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
const findingCatLabel = (cat: string) =>
  FINDING_CATEGORY_CODES.has(cat) ? rt(`report.findingCategory.${cat}`) : humanizeCat(cat)

const findings = computed(() => {
  const dimA = props.vm.debug.rawJson.analysis.dimension_analysis
  const out = (['physics', 'semantics', 'bias'] as const).flatMap((dim) =>
    (dimA[dim].findings ?? []).map((f) => ({
      dim,
      catLabel: findingCatLabel(f.category),
      text: f.finding,
      severity: f.severity,
    })),
  )
  return out.slice().sort((a, b) => (FINDING_SEV_RANK[a.severity] ?? 3) - (FINDING_SEV_RANK[b.severity] ?? 3))
})

const hero = computed(() => {
  const v = props.vm
  const lang = reportLang.value
  const status = v.overallVerdict.status
  const dimKeys = ['physics', 'semantics', 'bias'] as const
  const dims = dimKeys.map((key) => {
    const d = v.dimensions[key]
    return {
      key,
      name: DIMENSION_LABELS[key][lang],
      desc: DIMENSION_DESC[key][lang],
      score: d.score,
      severity: STATUS_TO_SEVERITY[d.status],
      word: STATUS_WORD[d.status][lang],
    }
  })
  const n = findings.value.length
  return {
    status,
    severity: STATUS_TO_SEVERITY[status],
    statusWord: STATUS_WORD[status][lang],
    headline: v.overallVerdict.headline.replace(/[.\s]+$/, ''),
    lead: v.overallVerdict.recommendation,
    metaText: rtp('report.cockpit.findingsCount', n),
    integrity: v.integrityScore,
    aesthetic: v.aestheticCombined,
    readingModeLabel: `${v.readingMode.label} (${v.readingMode.code})`,
    dims,
  }
})

// Priority „Nächster Schritt": die Top-3 konkreten Befunde als verständliche
// Prüf-Schritte (Label = Kategorie, Beschreibung = Modell-Befundtext verbatim).
const priority = computed(() => {
  const status = props.vm.overallVerdict.status
  const items = findings.value.slice(0, 3).map((f) => ({ label: f.catLabel, description: f.text }))
  // Verdict-bewusster Leerzustand: Status gelb/rot ohne einzelnen Bildbefund (flag-/cap-getrieben)
  // darf nicht als „nichts zu tun" lesen. Kein kuratierter Topic-Text – nur ein Verweis aufs Urteil.
  const verdictDrivenEmpty = items.length === 0 && status !== 'green'
  // Grüner Leerfall: keine Befunde + Status grün → positiver Hinweis statt „prüfe zuerst die Befunde".
  const greenEmpty = items.length === 0 && status === 'green'
  const copy = verdictDrivenEmpty
    ? rt('report.cockpit.priorityCopy.verdictDrivenEmpty')
    : greenEmpty
      ? rt('report.cockpit.priorityCopy.greenEmpty')
      : rt('report.cockpit.priorityCopy.default')
  return {
    headline: rt(`report.cockpit.priorityHeadline.${status}`),
    copy,
    items,
    emptyNote: verdictDrivenEmpty ? rt('report.cockpit.priorityEmptyNote') : undefined,
  }
})

// Bild-Overlay (Etappe 3): rohe evidenceSpots → render-fertige InspectorSpots
// (F2-Qualifikation + Layer + Treiber-Label, deterministisch in lib/overlay-spots).
const inspectorSpots = computed(() => buildInspectorSpots(props.vm.evidenceSpots, props.vm.reportLang))

// Sichtbare Bildmarkierung (provenance_markers) – BEWUSST getrennt von inspectorSpots/
// qualifiesAsBox (kein Befund). Vollständig durchgereicht (auch entartete Boxen): der
// BildInspektor zeigt den Hinweistext immer und filtert nur die Box-Darstellung per
// isValidBox. region_box_2d (Zod: number[]) → Box-Tupel (Schema garantiert length 4).
const provenanceMarkers = computed(() =>
  props.vm.provenanceMarkers.map((m, i) => ({
    id: `M${i + 1}`,
    box: m.region_box_2d as [number, number, number, number],
    description: m.description,
    confidence: m.confidence,
  })),
)

// ── Prüfprotokoll-Projektionen (render-fertig) ───────────────────────────────
// Wörter aus report.align/report.framing (feste Report-Sprache); Ton bleibt TS-Map.
const ALIGN_TONE = {
  match: 'safe',
  partial: 'warn',
  mismatch: 'crit',
  not_assessable: 'neutral',
} as const
const FRAMING_TONE = { low: 'safe', medium: 'warn', high: 'crit' } as const
const REALISM_LEVELS = new Set(['high', 'medium', 'low'])
const ERROR_TYPES = new Set(['physics', 'anatomy', 'context', 'mixed', 'none'])

const FINDING_SEV_TONE: Record<string, 'crit' | 'warn' | 'minor'> = {
  severe: 'crit',
  moderate: 'warn',
  minor: 'minor',
}
const findingRows = computed(() =>
  findings.value.map((f, i) => ({
    id: `F${i + 1}`,
    category: `${DIMENSION_LABELS[f.dim][reportLang.value]} · ${f.catLabel}`,
    text: f.text,
    severityWord: findingSevWord(f.severity),
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
    const lang = reportLang.value
    const supports = ax.evidence.some((e) => e.supportsBiasFinding)
    return {
      label: ax.label,
      meta: supports
        ? [
            rt('report.common.risk', { level: RISK_LEVEL_LABEL[ax.riskLevel][lang] }),
            rt('report.cockpit.bias.confidence', { level: RISK_LEVEL_LABEL[ax.confidence][lang] }),
          ]
        : [rt('report.cockpit.bias.descriptiveAxis'), rt('report.cockpit.bias.noBiasFinding')],
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
  const lang = reportLang.value
  const ia = v.intentAssessment
  const norm = v.normativeMasking
  return {
    items: [
      { k: rt('report.cockpit.context.declaredIntent'), v: INTENT_LABELS[ia.declaredIntent][lang], tone: 'ink' as const },
      { k: rt('report.cockpit.context.alignment'), v: rt(`report.align.${ia.intentAlignment}`), tone: ALIGN_TONE[ia.intentAlignment] },
      { k: rt('report.cockpit.context.framingRisk'), v: rt(`report.framing.${ia.framingRisk}`), tone: FRAMING_TONE[ia.framingRisk] },
      { k: rt('report.cockpit.context.usageContext'), v: props.submittedContext || rt('report.cockpit.context.contextNotProvided'), tone: 'ink' as const },
      { k: rt('report.cockpit.context.originalPrompt'), v: props.submittedPrompt || rt('report.cockpit.context.promptNotProvided'), tone: 'ink' as const },
    ],
    drivers: v.visualDrivers.map((d) => ({ code: d.code, label: d.label })),
    normative:
      norm.verdict !== 'not_applicable'
        ? {
            verdictWord: NORMATIVE_VERDICT_LABELS[norm.verdict][lang],
            reasoning: norm.reasoning,
            // Dedupe: das Schema garantiert keine eindeutigen Aspekte → kein Vue-Key-Konflikt.
            aspects: [...new Set(norm.aspects.map((a) => NORMATIVE_ASPECT_LABELS[a][lang]))],
          }
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
  const realismRaw = String(d.rawJson.analysis.research_layer.codebook.visual_realism_level)
  // Dezimaltrennzeichen folgt der Report-Sprache (de: Komma, en: Punkt).
  const seconds = (d.durationMs / 1000).toFixed(1)
  const durationText = `${reportLang.value === 'de' ? seconds.replace('.', ',') : seconds} s`
  const errType = props.vm.dominantErrorType
  return [
    { k: rt('report.cockpit.meta.analysisModel'), v: d.modelLabel },
    { k: rt('report.cockpit.meta.aestheticModel'), v: d.aestheticModelLabel ?? '–' },
    { k: rt('report.cockpit.meta.duration'), v: durationText },
    { k: rt('report.cockpit.meta.realism'), v: REALISM_LEVELS.has(realismRaw) ? rt(`report.realism.${realismRaw}`) : realismRaw },
    { k: rt('report.cockpit.meta.errorType'), v: ERROR_TYPES.has(errType) ? rt(`report.errorType.${errType}`) : errType },
    { k: rt('report.common.integrity'), v: String(props.vm.integrityScore) },
    { k: rt('report.common.aesthetic'), v: String(props.vm.aestheticCombined) },
    { k: rt('report.cockpit.meta.laion'), v: d.v25Aesthetic !== null ? String(d.v25Aesthetic) : '–' },
  ]
})

const contextDate = computed(() => props.timestamp ?? null)
</script>

<template>
  <section class="cockpit" :aria-label="rt('report.cockpit.sectionAria')">
    <div class="contextline">
      <span>{{ rt('report.cockpit.contextline') }}</span>
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
      :meta-text="hero.metaText"
      :integrity="hero.integrity"
      :aesthetic="hero.aesthetic"
      :reading-mode-label="hero.readingModeLabel"
      :dims="hero.dims"
    />

    <div class="workbench">
      <BildInspektor :image-url="imageUrl" :image-alt="rt('report.cockpit.imageAlt')" :spots="inspectorSpots" :provenance-markers="provenanceMarkers" />
      <CockpitEntscheidung
        :headline="priority.headline"
        :copy="priority.copy"
        :items="priority.items"
        :empty-note="priority.emptyNote"
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
      <summary>{{ rt('report.cockpit.meta.summary') }}</summary>
      <div class="meta__grid">
        <div v-for="(m, i) in metaRows" :key="i" class="meta__cell">
          <span>{{ m.k }}</span><strong>{{ m.v }}</strong>
        </div>
      </div>
    </details>

    <footer class="cockpit-footer">
      <p class="cockpit-footer__lead">{{ rt('report.cockpit.footerLead') }}</p>
      <p class="cockpit-footer__note">
        <span class="cockpit-footer__dot" aria-hidden="true" />{{ rt('report.cockpit.footerNote') }}
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
