<script setup lang="ts">
// BefundKarte (Frontend 1.1, Etappe 2) – zentrale Ergebnis-Karte. Rendert AUSSCHLIESSLICH
// aus AnalysisViewModel (+ Nicht-ViewModel-Meta: Bild/usageForm/Identität).
// Vue-Port des abgenommenen Design-Sheets (Konzept_Frontend/prototypen/befund-karte-1.1-etappe2.html).
// Vier Blöcke (Inverted Pyramid):
//   1 Gesamturteil · 2 Diagnose auf einen Blick · 3 Was jetzt zu tun ist · 4 Warum dieses Urteil?
// Harte Leitplanken:
//  - Status NUR aus vm.overallVerdict.status (NIE aus Score neu berechnet).
//  - Variante B: Hero-Score-Zahl + ScoreBar-Marker NEUTRAL (--ink, Messwert). Urteilsfarbe
//    trägt das Gesamturteil/Status-Tag + die dezente Flächen-/Track-/Dim-Tönung (= Urteil,
//    nicht Score-Position). Doppelkodierung (Farbe + Wort) bleibt Pflicht.
//  - KEIN v-html – alle Texte sind Interpolation; reasoning nur in der Vertiefung.
import { computed, reactive, ref, onMounted, onBeforeUnmount } from 'vue'
import ScoreBar from '~/components/ui/ScoreBar.vue'
import Chip from '~/components/ui/Chip.vue'
import DimBadge from '~/components/ui/DimBadge.vue'
import HintItem from '~/components/ui/HintItem.vue'
import NoteBlock from '~/components/ui/NoteBlock.vue'
import Disclosure from '~/components/ui/Disclosure.vue'
import {
  STATUS_TO_SEVERITY,
  STATUS_WORD,
  DIMENSION_LABELS,
  DIMENSION_DESC,
  READING_MODE_DESC,
  NORMATIVE_VERDICT_LABELS,
  NORMATIVE_ASPECT_LABELS,
  RISK_LEVEL_LABEL,
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

const open = reactive({ deep: false })

const status = computed(() => props.vm.overallVerdict.status)
const statusSeverity = computed(() => STATUS_TO_SEVERITY[status.value])

// Headline: letzten Satzpunkt als chromatischen Akzent abtrennen (Akzent, NICHT links).
const headlineMain = computed(() => props.vm.overallVerdict.headline.replace(/\.$/, ''))
const headlineHasDot = computed(() => props.vm.overallVerdict.headline.endsWith('.'))

// Top-Strip-Marker: Severity-Echo der drei Dimensions-Status (aus Pipeline-Status).
const dimMarkers = computed(() =>
  (['physics', 'semantics', 'bias'] as const).map((d) => STATUS_TO_SEVERITY[props.vm.dimensions[d].status]),
)

const dims = computed(() =>
  (['physics', 'semantics', 'bias'] as const).map((d) => ({
    key: d,
    label: DIMENSION_LABELS[d],
    desc: DIMENSION_DESC[d],
    score: props.vm.dimensions[d].score,
    status: props.vm.dimensions[d].status,
    sev: STATUS_TO_SEVERITY[props.vm.dimensions[d].status],
  })),
)

const SEV_DOT = { safe: 'bg-safe', warn: 'bg-warn', crit: 'bg-crit', neutral: 'bg-surface-2' } as const
const STATUS_BG = {
  safe: 'bg-safe text-surface',
  warn: 'bg-warn text-ink',
  crit: 'bg-crit text-surface',
} as const

// Block 3: Empfehlungs-Bedingungen (Haltung + Verwendungsform). normativeMaskingNote NICHT
// hier – sie steht in der Vertiefung (Block 4).
const hasNotes = computed(
  () => !!(props.vm.intentRecommendationNote || props.vm.usageFormNote),
)

// Count-up der Hero-Zahl (Variante-B-konform: nur der Zahlenwert zählt hoch, neutral).
// prefers-reduced-motion → sofort der Endwert. Echter Wert steht zusätzlich im ScoreBar-aria.
const displayScore = ref(0)
let rafId: number | null = null
onMounted(() => {
  const target = props.vm.integrityScore
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  if (reduce) {
    displayScore.value = target
    return
  }
  const dur = 520
  let start: number | null = null
  const step = (ts: number) => {
    if (start === null) start = ts
    const p = Math.min((ts - start) / dur, 1)
    displayScore.value = Math.round((1 - Math.pow(1 - p, 3)) * target)
    if (p < 1) rafId = requestAnimationFrame(step)
    else displayScore.value = target
  }
  rafId = requestAnimationFrame(step)
})
onBeforeUnmount(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
})
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

    <!-- Block 1 · Gesamturteil (Status-Quelle = overallVerdict.status) -->
    <div class="verdict-display">
      <div class="verdict-label">
        <span class="status-dot" :class="SEV_DOT[statusSeverity]" aria-hidden="true" />
        Gesamturteil
      </div>
      <h2 class="head">{{ headlineMain }}<span v-if="headlineHasDot" class="accent">.</span></h2>
      <span class="status-word" :class="STATUS_BG[statusSeverity]">
        <span aria-hidden="true">●</span> Status: {{ STATUS_WORD[status] }}
      </span>
    </div>

    <!-- Block 2 · Diagnose auf einen Blick: Bild + Score + Dimensionen -->
    <div class="diag">
      <div class="block-head">Diagnose auf einen Blick</div>
      <div class="body">
        <div class="imgwrap">
          <div class="img">
            <img v-if="imageUrl" :src="imageUrl" alt="Geprüftes Bild" class="abs-img" />
            <div v-else class="ph"><span>Bild · {{ imageAspect }}</span></div>
          </div>
        </div>
        <div class="data" :class="`tint-${statusSeverity}`">
          <div class="lab">&gt; integrity-score</div>
          <div class="hero-line">
            <!-- Variante B: Zahl NEUTRAL (--ink) – Messwert, keine Severity-Farbe.
                 aria-hidden: der count-up zählt visuell hoch; der echte Wert steht im ScoreBar-aria. -->
            <span class="hero" aria-hidden="true">{{ displayScore }}</span>
            <span class="hero-den" aria-hidden="true">/ 100</span>
            <!-- Urteil farbig (separates Status-Element) -->
            <span class="hero-status" :class="STATUS_BG[statusSeverity]">{{ STATUS_WORD[status] }}</span>
          </div>
          <ScoreBar
            variant="meter"
            :tone="statusSeverity"
            :value="vm.integrityScore"
            :ariaLabel="`Integritätsscore ${vm.integrityScore} von 100. Das Gesamturteil wird unabhängig vom Score bestimmt.`"
          />
          <div class="lines">
            <div class="l">
              <span class="prompt">&gt;</span><span class="key">aesthetic</span>
              <span class="val">{{ vm.aestheticCombined }} / 100</span>
            </div>
            <div class="l">
              <span class="prompt">&gt;</span><span class="key">reading</span>
              <span class="val">{{ vm.readingMode.label }} ({{ vm.readingMode.code }})</span>
            </div>
          </div>
        </div>
      </div>
      <ul class="dims" aria-label="Die drei Dimensionen">
        <li v-for="d in dims" :key="d.key" class="d" :class="`tint-${d.sev}`">
          <DimBadge :label="d.label" :desc="d.desc" :score="d.score" :status="d.status" />
        </li>
      </ul>
      <p class="diag-note">
        Der Score ist ein <strong>Messwert</strong> – das Gesamturteil berücksichtigt zusätzlich
        Kontext und Risiken. Ein hoher Score bedeutet daher nicht automatisch „unkritisch".
      </p>
      <!-- Beschreibender Maskierungs-Hinweis (ersetzt den früheren masking·Δ-Score).
           Erscheint nur, wenn die Pipeline validierte Treiber↔Befund-Verknüpfungen markiert hat. -->
      <p v-if="vm.maskingReviewNote" class="diag-note">
        <strong>Maskierungs-Hinweis:</strong> {{ vm.maskingReviewNote.text }}
      </p>
    </div>

    <!-- Block 3 · Was jetzt zu tun ist (Empfehlung + flache Bedingungen) -->
    <div class="recommendation">
      <div class="block-head">Was jetzt zu tun ist</div>
      <p class="rec-text">{{ vm.overallVerdict.recommendation }}</p>
      <div v-if="hasNotes" class="notes">
        <NoteBlock :content="vm.intentRecommendationNote" type="intent" flat />
        <NoteBlock :content="vm.usageFormNote" type="usage" flat />
      </div>
    </div>

    <!-- Block 4 · Warum dieses Urteil? (Befunde + eine Vertiefung) -->
    <div class="why">
      <div class="block-head">Warum dieses Urteil?</div>
      <ul v-if="vm.userHints.length" class="hint-list">
        <HintItem v-for="(h, i) in vm.userHints" :key="i" :hint="h" />
      </ul>
      <p v-else class="no-finding">
        Keine spezifischen Auffälligkeiten – das Tool sieht aktuell keine kritischen Befunde.
      </p>
    </div>
    <div class="disclosure-wrap">
      <Disclosure v-model:open="open.deep" title="Analyse vertiefen">
        <div class="deep">
          <p class="deep-label">Normative Bildwirkung</p>
          <template v-if="vm.normativeMasking.verdict !== 'not_applicable'">
            <p class="deep-text">
              Idealisierende Norm: {{ NORMATIVE_VERDICT_LABELS[vm.normativeMasking.verdict] }}.
              <template v-if="vm.normativeMasking.reasoning"> {{ vm.normativeMasking.reasoning }}</template>
            </p>
            <div v-if="vm.normativeMasking.aspects.length" class="deep-chips">
              <Chip v-for="a in vm.normativeMasking.aspects" :key="a" :label="NORMATIVE_ASPECT_LABELS[a]" />
            </div>
            <p v-if="vm.normativeMaskingNote" class="deep-text">{{ vm.normativeMaskingNote }}</p>
          </template>
          <p v-else class="deep-text">Keine normative Bildwirkung erkannt – für dieses Bild nicht einschlägig.</p>

          <template v-if="vm.biasAxesSummary.count > 0">
            <p class="deep-label">Bias-Achsen</p>
            <p class="deep-text">
              {{ vm.biasAxesSummary.count }} {{ vm.biasAxesSummary.count === 1 ? 'Achse' : 'Achsen' }} erkannt
              · maximales Risiko: {{ RISK_LEVEL_LABEL[vm.biasAxesSummary.maxRisk] }}.
            </p>
          </template>

          <p class="deep-label">Leseart</p>
          <p class="deep-text">{{ READING_MODE_DESC[vm.readingMode.code] }}</p>

          <!-- Die Stellen hinter dem Maskierungs-Hinweis – «prüfbarer Hinweis»
               heisst: hier steht, WO und WAS am Bild nachgeschaut werden kann. -->
          <template v-if="vm.maskingMarkedSpots.length">
            <p class="deep-label">Markierte Stellen (Maskierungs-Hinweis)</p>
            <ul class="spot-list">
              <li v-for="(s, i) in vm.maskingMarkedSpots" :key="`spot-${i}`" class="deep-text">
                <strong>{{ s.driverLabel }}</strong> könnte den {{ s.area }}-Befund überdecken: {{ s.text }}
              </li>
            </ul>
          </template>

          <!-- F5: Befunde unterhalb der Sichtbarkeits-Schwelle – ein Klick entfernt
               statt unsichtbar (Print zeigte sie schon immer). -->
          <template v-if="vm.hiddenHints.length">
            <p class="deep-label">Weitere Befunde</p>
            <ul class="hint-list">
              <HintItem v-for="(h, i) in vm.hiddenHints" :key="`hidden-${i}`" :hint="h" />
            </ul>
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
/* Vue-Port des abgenommenen Design-Sheets. Tokens aus tokens.css. Severity doppelt
   kodiert (Farbe + Wort). Kein Links-Akzent-Streifen. */
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

/* Block-Titel (Klartext-Fragen) */
.block-head {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--ink-soft);
}

/* Block 1 · Gesamturteil */
.verdict-display {
  padding: 30px 32px 26px;
  border-bottom: 1.5px solid var(--ink);
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
  font-size: 54px;
  font-weight: 700;
  line-height: 0.98;
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

/* Block 2 · Diagnose auf einen Blick */
.diag {
  border-bottom: 1.5px solid var(--ink);
}
.diag > .block-head {
  padding: 20px 32px 0;
}
.body {
  display: grid;
  grid-template-columns: 280px 1fr;
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
  padding: 22px 32px;
}
/* Flächen-Tönung = Urteil (gleichmässig, nicht Score-Position) */
.data.tint-safe {
  background: rgba(44, 140, 102, 0.07);
}
.data.tint-warn {
  background: rgba(200, 146, 31, 0.1);
}
.data.tint-crit {
  background: rgba(205, 66, 57, 0.07);
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
  margin: 6px 0 14px;
  flex-wrap: wrap;
}
/* Variante B: Hero-Zahl neutral – KEINE Severity-Farbe */
.hero {
  font-size: 74px;
  font-weight: 700;
  line-height: 0.9;
  letter-spacing: -0.04em;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
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
  margin-top: 34px;
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
/* Dim-Strip (drei Dimensionen) */
.dims {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: var(--canvas);
  border-top: 1.5px solid var(--ink);
  list-style: none;
}
.dims .d {
  padding: 18px 24px;
  border-right: 1px solid var(--line-strong);
}
.dims .d:last-child {
  border-right: none;
}
.dims .d.tint-safe {
  background: rgba(44, 140, 102, 0.09);
}
.dims .d.tint-warn {
  background: rgba(200, 146, 31, 0.12);
}
.dims .d.tint-crit {
  background: rgba(205, 66, 57, 0.09);
}

/* Fixer Entkopplungs-Hinweis */
.diag-note {
  padding: 13px 32px 16px;
  background: var(--canvas);
  border-top: 1px solid var(--line);
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--muted);
}

/* Block 3 · Was jetzt zu tun ist */
.recommendation {
  padding: 22px 32px 24px;
  border-bottom: 1.5px solid var(--ink);
}
.recommendation .block-head {
  margin-bottom: 10px;
}
.rec-text {
  font-size: 16px;
  line-height: 1.5;
  color: var(--ink);
  max-width: 62ch;
}
.notes {
  margin-top: 8px;
}
/* flache NoteBlocks: Haarlinie zwischen den Items (kein Box-Stapel) */
.notes > div + div {
  border-top: 1px solid var(--line-soft);
}

/* Block 4 · Warum dieses Urteil? */
.why {
  padding: 22px 32px;
  background: var(--surface);
}
.why .block-head {
  margin-bottom: 12px;
}
.hint-list {
  list-style: none;
  display: flex;
  flex-direction: column;
}
.no-finding {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.5;
}

/* Vertiefung (eine Disclosure) */
.disclosure-wrap {
  padding: 0 32px;
  background: var(--canvas);
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
.deep-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 8px;
}
.spot-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.card-footnote {
  padding: 16px 32px;
  background: var(--canvas);
  border-top: 1.5px solid var(--ink);
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
    font-size: 62px;
  }
  .head {
    font-size: 40px;
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
