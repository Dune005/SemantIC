<script setup lang="ts">
// BefundKarte (primitives.md §6) – zentrale Ergebnis-Karte. Rendert AUSSCHLIESSLICH
// aus AnalysisViewModel (+ Nicht-ViewModel-Meta: Bild/usageForm/Identität).
// Harte Leitplanken:
//  - Status NUR aus vm.overallVerdict.status (NIE aus Score neu berechnet).
//  - Hero-Score = vm.integrityScore (Variante A: Hero-Zahl + ScoreBar). Farbe via
//    severityFor; Hero-Status-Tag deutsch aus STATUS_WORD (Defekt #7, kein "Conditional").
//  - Faktische (maskingScore/-Verdict) vs. normative Maskierung (normativeMasking) getrennt.
//  - Die drei Notes als NoteBlock UNTER der Empfehlung, nicht in userHints.
//  - KEIN v-html – alle Texte sind Interpolation; reasoning nur in Disclosure.
import { computed, reactive } from 'vue'
import ScoreBar from '~/components/ui/ScoreBar.vue'
import Chip from '~/components/ui/Chip.vue'
import DimBadge from '~/components/ui/DimBadge.vue'
import HintItem from '~/components/ui/HintItem.vue'
import NoteBlock from '~/components/ui/NoteBlock.vue'
import Disclosure from '~/components/ui/Disclosure.vue'
import {
  severityFor,
  SEVERITY_WORD,
  STATUS_TO_SEVERITY,
  STATUS_WORD,
  DIMENSION_LABELS,
  DIMENSION_DESC,
  MASKING_VERDICT_LABELS,
  MASKING_TO_SEVERITY,
  READING_MODE_DESC,
  DOMINANT_ERROR_LABELS,
  INPUT_COMPLETENESS_LABELS,
  NORMATIVE_VERDICT_LABELS,
  NORMATIVE_ASPECT_LABELS,
  HINT_SEVERITY_TO_SEVERITY,
  HINT_SEVERITY_LABEL,
} from '~/lib/severity'
import type { AnalysisViewModel, UsageForm } from '~/types/analysis'

const props = withDefaults(
  defineProps<{
    vm: AnalysisViewModel
    imageUrl?: string | null
    submittedUsageForm?: UsageForm | null
    sampleId?: string
    timestamp?: string
    imageAspect?: '4:5' | '3:4' | '1:1'
  }>(),
  { imageUrl: null, submittedUsageForm: null, imageAspect: '4:5' },
)

const open = reactive({ hidden: false, detail: false, deep: false })

const status = computed(() => props.vm.overallVerdict.status)
const statusSeverity = computed(() => STATUS_TO_SEVERITY[status.value])
const heroSeverity = computed(() => severityFor(props.vm.integrityScore))

// Headline: letzten Satzpunkt als chromatischen Akzent abtrennen (Akzent, NICHT links).
const headlineMain = computed(() => props.vm.overallVerdict.headline.replace(/\.$/, ''))
const headlineHasDot = computed(() => props.vm.overallVerdict.headline.endsWith('.'))

// Mono-Pre-Comment (kein LLM-Text), aus Status + Leseart + Laufzeit konstruiert.
const PRE_FLAG = { green: '--ok', yellow: '--review', red: '--reject' } as const
const preComment = computed(() => {
  const t = (props.vm.debug.durationMs / 1000).toFixed(1)
  return `// integrity ${PRE_FLAG[status.value]} · reading ${props.vm.readingMode.code} · 3 dimensions · t = ${t}s`
})

// Top-Strip-Marker: Severity-Echo der drei Dimensions-Status (aus Pipeline-Status).
const dimMarkers = computed(() =>
  (['physics', 'semantics', 'bias'] as const).map((d) => STATUS_TO_SEVERITY[props.vm.dimensions[d].status]),
)

// Faktische Maskierung (eigene Skala, NICHT severityFor).
const maskingSign = computed(() =>
  props.vm.maskingScore >= 0 ? `+${props.vm.maskingScore}` : `−${Math.abs(props.vm.maskingScore)}`,
)
const maskingSeverity = computed(() => MASKING_TO_SEVERITY[props.vm.maskingVerdict])
const maskingWord = computed(() => MASKING_VERDICT_LABELS[props.vm.maskingVerdict])

const dominantErrorLabel = computed(() =>
  props.vm.dominantErrorType !== 'none' ? DOMINANT_ERROR_LABELS[props.vm.dominantErrorType] : null,
)
const firstHint = computed(() => props.vm.userHints[0] ?? null)

const dims = computed(() =>
  (['physics', 'semantics', 'bias'] as const).map((d) => ({
    key: d,
    label: DIMENSION_LABELS[d],
    desc: DIMENSION_DESC[d],
    score: props.vm.dimensions[d].score,
    status: props.vm.dimensions[d].status,
  })),
)

const SEV_DOT = { safe: 'bg-safe', warn: 'bg-warn', crit: 'bg-crit', neutral: 'bg-surface-2' } as const
const STATUS_BG = {
  safe: 'bg-safe text-surface',
  warn: 'bg-warn text-ink',
  crit: 'bg-crit text-surface',
} as const
const RISK_BADGE = {
  neutral: 'bg-surface-2 text-ink-soft border border-line-strong',
  warn: 'bg-warn text-ink',
  crit: 'bg-crit text-surface',
} as const

const hasNotes = computed(
  () => !!(props.vm.intentRecommendationNote || props.vm.normativeMaskingNote || props.vm.usageFormNote),
)
const hasDeepDetails = computed(
  () =>
    !!props.vm.normativeMasking.reasoning ||
    !!props.vm.intentAssessment.reasoning ||
    props.vm.biasAxesSummary.count > 0,
)
</script>

<template>
  <article class="combo-card" aria-label="Analyse-Ergebnis">
    <!-- Top-Strip: Identifier + Severity-Echo der drei Dimensionen -->
    <div class="strip">
      <span>{{ sampleId ?? 'SEMANTIC' }}</span>
      <span class="marker" aria-hidden="true">
        <span v-for="(m, i) in dimMarkers" :key="i" :class="SEV_DOT[m]" />
      </span>
    </div>

    <!-- Verdict-Display: Gesamturteil (Status-Quelle = overallVerdict.status) -->
    <div class="verdict-display">
      <div class="pre">{{ preComment }}</div>
      <div class="verdict-label">
        <span class="status-dot" :class="SEV_DOT[statusSeverity]" aria-hidden="true" />
        Gesamturteil
      </div>
      <h2 class="head">{{ headlineMain }}<span v-if="headlineHasDot" class="accent">.</span></h2>
      <span class="status-word" :class="STATUS_BG[statusSeverity]">
        <span aria-hidden="true">●</span> Status: {{ STATUS_WORD[status] }}
      </span>
    </div>

    <!-- Empfehlung + die drei Notes (separate Blöcke unter recommendation) -->
    <div class="recommendation">
      <div class="rec-label">Empfehlung</div>
      <p class="rec-text">{{ vm.overallVerdict.recommendation }}</p>
      <div v-if="hasNotes" class="notes">
        <NoteBlock :content="vm.intentRecommendationNote" type="intent" />
        <NoteBlock :content="vm.normativeMaskingNote" type="masking">
          <template v-if="vm.normativeMasking.aspects.length" #chips>
            <Chip v-for="a in vm.normativeMasking.aspects" :key="a" :label="NORMATIVE_ASPECT_LABELS[a]" />
          </template>
        </NoteBlock>
        <NoteBlock :content="vm.usageFormNote" type="usage" />
      </div>
    </div>

    <!-- Body: Bild links, Hero-Integritätswert + Daten rechts -->
    <div class="body">
      <div class="imgwrap">
        <div class="img">
          <img v-if="imageUrl" :src="imageUrl" alt="Geprüftes Bild" class="abs-img" />
          <div v-else class="ph"><span>Bild · {{ imageAspect }}</span></div>
        </div>
      </div>
      <div class="data">
        <div class="lab">&gt; integrity-score</div>
        <div class="hero-line">
          <span class="hero" :class="`ink-${heroSeverity}`">{{ vm.integrityScore }}</span>
          <span class="hero-den">/ 100</span>
          <!-- Defekt #7: deutsches Status-Wort, Farbe aus overallVerdict.status -->
          <span class="hero-status" :class="STATUS_BG[statusSeverity]">{{ STATUS_WORD[status] }}</span>
        </div>
        <ScoreBar
          :value="vm.integrityScore"
          :aria-label="`Integritäts-Score ${vm.integrityScore} von 100, ${SEVERITY_WORD[heroSeverity]}`"
        />

        <div class="lines">
          <div class="l">
            <span class="prompt">&gt;</span><span class="key">aesthetic</span>
            <span class="val">{{ vm.aestheticCombined }} / 100</span>
          </div>
          <div class="l">
            <span class="prompt">&gt;</span><span class="key">masking · Δ</span>
            <span class="val">{{ maskingSign }} <span class="tag" :class="maskingSeverity">[{{ maskingWord }}]</span></span>
          </div>
          <div class="l">
            <span class="prompt">&gt;</span><span class="key">reading</span>
            <span class="val">{{ vm.readingMode.label }} ({{ vm.readingMode.code }})</span>
          </div>
          <div v-if="dominantErrorLabel" class="l">
            <span class="prompt">&gt;</span><span class="key">error-type</span>
            <span class="val">{{ dominantErrorLabel }}</span>
          </div>
          <div v-if="firstHint" class="l finding">
            <span class="prompt">&gt;</span><span class="key">finding</span>
            <span class="val">{{ firstHint.text }}
              <span class="tag" :class="HINT_SEVERITY_TO_SEVERITY[firstHint.severity]">[{{ HINT_SEVERITY_LABEL[firstHint.severity] }}]</span>
            </span>
          </div>
        </div>

        <div class="context-note" :class="{ 'is-warn': vm.hasContextWarning }">
          <span class="ico" aria-hidden="true">i</span>
          <span>{{ INPUT_COMPLETENESS_LABELS[vm.inputCompleteness] }}.</span>
        </div>
      </div>
    </div>

    <!-- Dim-Strip: drei Dimensionen (DimBadge), Severity doppelt kodiert -->
    <ul class="dims" aria-label="Die drei Dimensionen">
      <li v-for="d in dims" :key="d.key" class="d">
        <DimBadge :label="d.label" :desc="d.desc" :score="d.score" :status="d.status" />
      </li>
    </ul>

    <!-- Maskierungs-Score (faktisch) -->
    <div class="card-section">
      <div class="section-label">Maskierungs-Score</div>
      <div class="bias-summary">
        <span class="risk-badge" :class="RISK_BADGE[maskingSeverity]">{{ maskingSign }} · {{ maskingWord }}</span>
        <span>Differenz zwischen visueller Wirkung ({{ vm.aestheticCombined }}) und inhaltlicher Integrität ({{ vm.integrityScore }}).</span>
      </div>
    </div>

    <!-- Leseart + visuelle Treiber -->
    <div class="card-section">
      <div class="section-label">Leseart &amp; visuelle Treiber</div>
      <p class="reading-desc">{{ READING_MODE_DESC[vm.readingMode.code] }}</p>
      <div v-if="vm.visualDrivers.length" class="driver-chips" role="list" aria-label="Visuelle Treiber">
        <Chip v-for="(drv, i) in vm.visualDrivers" :key="`${drv.code}-${i}`" :code="drv.code" :label="drv.label" role="listitem" />
      </div>
    </div>

    <!-- Befunde (Progressive Disclosure Ebene 1: userHints) -->
    <div class="card-section">
      <div class="section-label">Befunde</div>
      <ul v-if="vm.userHints.length" class="hint-list">
        <HintItem v-for="(h, i) in vm.userHints" :key="i" :hint="h" />
      </ul>
      <p v-else class="text-[14px] text-muted">Keine spezifischen Hinweise – das Tool sieht aktuell keine auffälligen Befunde.</p>
    </div>

    <!-- Ebene 2: weitere (versteckte) Hinweise -->
    <div v-if="vm.hiddenHints.length" class="disclosure-wrap">
      <Disclosure v-model:open="open.hidden" title="Weitere Hinweise" :count="`(${vm.hiddenHints.length})`">
        <ul class="hint-list">
          <HintItem v-for="(h, i) in vm.hiddenHints" :key="i" :hint="h" />
        </ul>
      </Disclosure>
    </div>

    <!-- Ebene 2: Befunde im Detail (regelbasierte Prüfhinweise + Prüffragen) -->
    <div v-if="vm.hintsSortedBySeverity.length" class="disclosure-wrap">
      <Disclosure
        v-model:open="open.detail"
        title="Befunde im Detail"
        :count="`(${vm.hintsCountBySeverity.high} hoch · ${vm.hintsCountBySeverity.medium} mittel · ${vm.hintsCountBySeverity.low} niedrig)`"
      >
        <div class="acc-list">
          <div v-for="h in vm.hintsSortedBySeverity" :key="h.id" class="acc-item">
            <p class="acc-hint">{{ h.hint }}</p>
            <p class="q-label">Prüffrage</p>
            <p class="q-text">{{ h.reviewQuestion }}</p>
          </div>
        </div>
      </Disclosure>
    </div>

    <!-- Ebene 3: Einordnung / reasoning (auf Wunsch) -->
    <div v-if="hasDeepDetails" class="disclosure-wrap">
      <Disclosure v-model:open="open.deep" title="Einordnung &amp; Details">
        <div class="deep">
          <template v-if="vm.normativeMasking.verdict !== 'not_applicable'">
            <p class="deep-label">Normative Maskierung</p>
            <p class="deep-text">
              Idealisierende Norm: {{ NORMATIVE_VERDICT_LABELS[vm.normativeMasking.verdict] }}.
              <template v-if="vm.normativeMasking.reasoning"> {{ vm.normativeMasking.reasoning }}</template>
            </p>
          </template>
          <template v-if="vm.biasAxesSummary.count > 0">
            <p class="deep-label">Bias-Achsen</p>
            <p class="deep-text">
              {{ vm.biasAxesSummary.count }} Achse(n) erkannt · maximales Risiko: {{ vm.biasAxesSummary.maxRisk }}.
            </p>
          </template>
          <template v-if="vm.intentAssessment.reasoning">
            <p class="deep-label">Haltung</p>
            <p class="deep-text">{{ vm.intentAssessment.reasoning }}</p>
          </template>
        </div>
      </Disclosure>
    </div>

    <div class="card-footnote">
      Diese Befunde sind Hinweise, kein abschliessendes Urteil. Das letzte Urteil bleibt bei dir.
    </div>
  </article>
</template>

<style scoped>
/* primitives.md §6 – Goldstandard-DOM (befund-karte-stil-07 / analyze-report.html).
   Tokens aus tokens.css. Severity doppelt kodiert. Kein Links-Akzent-Streifen. */
.combo-card {
  border: 1.5px solid var(--ink);
  background: var(--canvas);
  border-radius: var(--r);
  overflow: hidden;
}

/* Top-Strip */
.strip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 18px;
  background: var(--ink);
  color: var(--surface);
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 500;
}
.strip .marker {
  display: flex;
  gap: 4px;
}
.strip .marker span {
  display: inline-block;
  width: 10px;
  height: 10px;
}

/* Verdict-Display */
.verdict-display {
  padding: 30px 32px 26px;
  border-bottom: 1.5px solid var(--ink);
}
.verdict-display .pre {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--muted);
  margin-bottom: 14px;
}
.verdict-label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--ink-soft);
}
.status-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  flex: 0 0 auto;
}
.head {
  font-size: 62px;
  font-weight: 700;
  line-height: 0.96;
  letter-spacing: -0.03em;
  color: var(--ink);
}
.head .accent {
  color: var(--accent);
}
.status-word {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 16px;
  padding: 5px 10px;
  border: 1px solid var(--ink);
  border-radius: 3px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

/* Empfehlung + Notes */
.recommendation {
  padding: 22px 32px 24px;
  border-bottom: 1.5px solid var(--ink);
}
.rec-label {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--ink-soft);
  margin-bottom: 8px;
}
.rec-text {
  font-size: 16px;
  line-height: 1.5;
  color: var(--ink);
  max-width: 62ch;
}
.notes {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 18px;
}

/* Body */
.body {
  display: grid;
  grid-template-columns: 280px 1fr;
  border-bottom: 1.5px solid var(--ink);
  background: var(--surface);
}
.imgwrap {
  border-right: 1.5px solid var(--ink);
  padding: 18px;
  background: var(--canvas);
}
.img {
  position: relative;
  aspect-ratio: 4 / 5;
  border: 1px solid var(--line);
  background: repeating-linear-gradient(45deg, rgba(35, 37, 29, 0.5) 0 1px, transparent 1px 18px), var(--surface-2);
}
.abs-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.img .ph {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.img .ph span {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.22em;
  color: var(--muted);
  background: var(--canvas);
  padding: 4px 8px;
}
.data {
  padding: 26px 32px;
}
.lab {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--ink-soft);
}
.hero-line {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin: 6px 0 16px;
  flex-wrap: wrap;
}
.hero {
  font-size: 82px;
  font-weight: 700;
  line-height: 0.9;
  letter-spacing: -0.04em;
  color: var(--ink);
}
.hero.ink-safe {
  color: var(--safe-ink);
}
.hero.ink-warn {
  color: var(--warn-ink);
}
.hero.ink-crit {
  color: var(--crit-ink);
}
.hero-den {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 18px;
  font-weight: 500;
  color: var(--muted);
  letter-spacing: 0.04em;
}
.hero-status {
  margin-left: auto;
  padding: 5px 9px;
  border: 1px solid var(--ink);
  border-radius: 3px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.lines {
  margin-top: 24px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 13px;
  line-height: 1.65;
}
.lines .l {
  display: grid;
  grid-template-columns: 18px 130px 1fr;
  align-items: baseline;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid var(--line-soft);
}
.lines .l:last-child {
  border-bottom: none;
}
.lines .l .prompt {
  color: var(--ink);
  font-weight: 600;
}
.lines .l .key {
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 500;
  font-size: 11px;
}
.lines .l .val {
  font-weight: 600;
  color: var(--ink);
}
.lines .l.finding {
  align-items: start;
}
.lines .l.finding .val {
  font-weight: 500;
  color: var(--ink-soft);
  line-height: 1.55;
}
.lines .tag {
  display: inline-block;
  margin-left: 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
}
.lines .tag.warn {
  color: var(--warn-ink);
}
.lines .tag.crit {
  color: var(--crit-ink);
}
.lines .tag.neutral {
  color: var(--muted);
}
.context-note {
  display: flex;
  align-items: baseline;
  gap: 9px;
  margin-top: 14px;
  padding: 11px 14px;
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--canvas);
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
}
.context-note.is-warn {
  border-color: var(--warn);
  color: var(--ink-soft);
}
.context-note .ico {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  color: var(--ink-soft);
  font-size: 12px;
}

/* Dim-Strip */
.dims {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: var(--canvas);
  border-bottom: 1.5px solid var(--ink);
  list-style: none;
}
.dims .d {
  padding: 20px 24px;
  border-right: 1px solid var(--line-strong);
}
.dims .d:last-child {
  border-right: none;
}

/* Card-Sections */
.card-section {
  padding: 22px 32px;
  background: var(--surface);
  border-bottom: 1px solid var(--line);
}
.section-label {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--ink-soft);
  margin-bottom: 12px;
}
.reading-desc {
  font-size: 14px;
  line-height: 1.5;
  color: var(--ink-soft);
  margin-bottom: 12px;
}
.driver-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.bias-summary {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 13px;
  color: var(--ink-soft);
}
.risk-badge {
  padding: 3px 8px;
  border-radius: 2px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.hint-list {
  list-style: none;
  display: flex;
  flex-direction: column;
}

/* Disclosures (padding-Rahmen analog Prototyp) */
.disclosure-wrap {
  padding: 0 32px;
  background: var(--canvas);
}
.acc-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.acc-item {
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--surface);
  padding: 12px 14px;
}
.acc-hint {
  font-size: 14px;
  color: var(--ink);
  line-height: 1.5;
}
.q-label {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--subtle);
  font-weight: 600;
  margin: 12px 0 4px;
}
.q-text {
  font-size: 14px;
  color: var(--ink-soft);
  line-height: 1.5;
}
.deep {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.deep-label {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--subtle);
  font-weight: 600;
  margin-top: 8px;
}
.deep-text {
  font-size: 14px;
  color: var(--ink-soft);
  line-height: 1.5;
}
.card-footnote {
  padding: 16px 32px;
  background: var(--canvas);
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
}

@media (max-width: 880px) {
  .body {
    grid-template-columns: 1fr;
  }
  .imgwrap {
    border-right: none;
    border-bottom: 1.5px solid var(--ink);
  }
  .hero {
    font-size: 64px;
  }
  .head {
    font-size: 46px;
  }
}
@media (max-width: 600px) {
  .dims {
    grid-template-columns: 1fr;
  }
  .dims .d {
    border-right: none;
    border-bottom: 1px solid var(--line-strong);
  }
  .dims .d:last-child {
    border-bottom: none;
  }
}
</style>
