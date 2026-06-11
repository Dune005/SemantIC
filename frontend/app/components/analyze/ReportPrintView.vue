<script setup lang="ts">
// ReportPrintView (report-print.md) – dedizierte Druckansicht für den
// „Als PDF exportieren"-Pfad (window.print(), kein jsPDF/html2canvas).
// Eigene FLACHE Render-Variante der Report-Daten: alle Befunde aufgeklappt,
// KEINE Interaktion, KEINE Debug-UI. Datenquelle = dasselbe AnalysisViewModel
// wie die BefundKarte PLUS der eingefrorene Submit-State (usage_form/Kontext/
// Prompt sind frontend-only, nicht im Pipeline-JSON → als Props hereingereicht).
//
// Sichtbarkeit ist self-contained: am Screen display:none, im @media print
// display:block (Codex-Review B: nicht auf Parent-scoped-CSS bauen). Die
// interaktive Stage/BefundKarte blendet analyze.vue im Druck aus.
//
// Harte Leitplanken: Status NUR aus overallVerdict.status (nie aus Score);
// faktische (Block 6) ≠ normative (Block 7) Maskierung getrennt; kein v-html;
// kein Debug/CLIP/reasoning; KEIN Links-Akzent-Streifen; Severity doppelt kodiert.
import { computed } from 'vue'
import ScoreBar from '~/components/ui/ScoreBar.vue'
import Chip from '~/components/ui/Chip.vue'
import NoteBlock from '~/components/ui/NoteBlock.vue'
import {
  severityFor,
  SEVERITY_WORD,
  STATUS_TO_SEVERITY,
  STATUS_WORD,
  DIMENSION_LABELS,
  READING_MODE_DESC,
  INPUT_COMPLETENESS_LABELS,
  NORMATIVE_VERDICT_LABELS,
  NORMATIVE_ASPECT_LABELS,
  HINT_SEVERITY_TO_SEVERITY,
  HINT_SEVERITY_LABEL,
  INTENT_LABELS,
  USAGE_FORM_LABELS,
  RISK_LEVEL_LABEL,
} from '~/lib/severity'
import type { AnalysisViewModel, UsageForm } from '~/types/analysis'

const props = withDefaults(
  defineProps<{
    viewModel: AnalysisViewModel
    heroScore: number | null
    generatedAt: string
    imageUrl?: string | null
    submittedUsageForm?: UsageForm | null
    submittedContext?: string | null
    submittedPrompt?: string | null
  }>(),
  { imageUrl: null, submittedUsageForm: null, submittedContext: null, submittedPrompt: null },
)

const vm = computed(() => props.viewModel)
const status = computed(() => vm.value.overallVerdict.status)
const statusSeverity = computed(() => STATUS_TO_SEVERITY[status.value])

// Hero: heroScore ist kontraktlich number; Fallback auf integrityScore (Variante A).
const hero = computed(() => props.heroScore ?? vm.value.integrityScore)
const heroSeverity = computed(() => severityFor(hero.value))

// Block 2: Eingabe-Zusammenfassung – Labels aus dem eingefrorenen Submit-State.
const intentLabel = computed(() => INTENT_LABELS[vm.value.intentAssessment.declaredIntent])
const usageFormLabel = computed(() =>
  props.submittedUsageForm ? USAGE_FORM_LABELS[props.submittedUsageForm] : 'nicht angegeben',
)

// Block 5: drei Dimensionen (Status-Wort aus Pipeline-Status, Farbe/Severity-Kürzel aus Score).
const dims = computed(() =>
  (['physics', 'semantics', 'bias'] as const).map((d) => {
    const dim = vm.value.dimensions[d]
    return {
      key: d,
      label: DIMENSION_LABELS[d],
      score: dim.score,
      severity: severityFor(dim.score),
      statusWord: STATUS_WORD[dim.status],
    }
  }),
)

// Block 9: alle Befunde flach (userHints + hiddenHints zusammengeführt, aufgeklappt).
const allHints = computed(() => [...vm.value.userHints, ...vm.value.hiddenHints])

// Block 3 trägt die zur Empfehlung gehörenden Notes (Haltung + Verwendungsform).
// Die normativeMaskingNote steht thematisch bei Block 7 (report-print.md §1 Block 7).
const hasNotes = computed(
  () => !!(vm.value.intentRecommendationNote || vm.value.usageFormNote),
)

// Headline: Schlusspunkt als chromatischen Akzent (kein Links-Streifen).
const headlineMain = computed(() => vm.value.overallVerdict.headline.replace(/\.$/, ''))
const headlineHasDot = computed(() => vm.value.overallVerdict.headline.endsWith('.'))
</script>

<template>
  <div class="report-print-view">
    <!-- Block 1: Dokument-Kopf -->
    <section class="print-block print-head">
      <h1 class="print-doc-title">SemantIC – Prüfbefund</h1>
      <p class="print-date mono">Geprüft am {{ generatedAt }}</p>
      <p class="print-disclaimer">
        SemantIC liefert begründete Hinweise, keine Beweise. Die Beurteilung, ob ein Bild in den
        jeweiligen Kontext passt, bleibt bei der nutzenden Person.
      </p>
    </section>

    <!-- Block 2: Eingabe-Zusammenfassung (inkl. eingefrorener usage_form) -->
    <section class="print-block">
      <h2 class="print-h2">Geprüfte Angaben</h2>
      <div class="print-input-grid">
        <div class="pimg">
          <img v-if="imageUrl" :src="imageUrl" alt="Geprüftes Bild" />
          <span v-else>Bild · 4:5</span>
        </div>
        <dl class="print-kv">
          <dt>Haltung</dt>
          <dd>{{ intentLabel }}</dd>
          <dt>Verwendungsform</dt>
          <dd>{{ usageFormLabel }}</dd>
          <dt>Nutzungskontext</dt>
          <dd>{{ submittedContext || 'nicht angegeben' }}</dd>
          <dt>Original-Prompt</dt>
          <dd>{{ submittedPrompt || 'nicht angegeben' }}</dd>
          <dt>Vollständigkeit</dt>
          <dd>
            {{ INPUT_COMPLETENESS_LABELS[vm.inputCompleteness] }}.
            <span v-if="vm.hasContextWarning" class="print-ctx-warn">Ohne Nutzungskontext bleibt die Bias-Einschätzung allgemeiner.</span>
          </dd>
        </dl>
      </div>
    </section>

    <!-- Block 3: Gesamturteil + die drei Notes -->
    <section class="print-block">
      <h2 class="print-h2">Gesamturteil</h2>
      <span class="print-status-word" :class="`sev-${statusSeverity}`">
        <span class="dot" :class="`bg-${statusSeverity}`" aria-hidden="true" />
        Status: {{ STATUS_WORD[status] }}
      </span>
      <p class="print-verdict-head">{{ headlineMain }}<span v-if="headlineHasDot" class="accent">.</span></p>
      <p class="print-rec">{{ vm.overallVerdict.recommendation }}</p>
      <div v-if="hasNotes" class="print-notes">
        <NoteBlock :content="vm.intentRecommendationNote" type="intent" />
        <NoteBlock :content="vm.usageFormNote" type="usage" />
      </div>
    </section>

    <!-- Block 4: Hero-Score / Integrität -->
    <section class="print-block">
      <h2 class="print-h2">Integritäts-Score</h2>
      <div class="print-hero">
        <span class="h" :class="`ink-${heroSeverity}`">{{ hero }}</span>
        <span class="den">/ 100 · {{ SEVERITY_WORD[heroSeverity] }}</span>
      </div>
      <ScoreBar
        :value="hero"
        :animate="false"
        :ariaLabel="`Integritäts-Score ${hero} von 100, ${SEVERITY_WORD[heroSeverity]}`"
      />
    </section>

    <!-- Block 5: Drei Dimensionen -->
    <section class="print-block">
      <h2 class="print-h2">Die drei Dimensionen</h2>
      <div class="print-dims">
        <div v-for="d in dims" :key="d.key" class="print-dim" :class="`sev-${d.severity}`">
          <div class="pn">{{ d.label }}</div>
          <div class="pv" :class="`ink-${d.severity}`">{{ d.score }}</div>
          <div class="pw">{{ d.statusWord }} ({{ SEVERITY_WORD[d.severity] }})</div>
        </div>
      </div>
    </section>

    <!-- Block 6: Maskierungs-Hinweis (beschreibend; ersetzt den früheren Differenz-Score) -->
    <section class="print-block">
      <h2 class="print-h2">Maskierungs-Hinweis</h2>
      <template v-if="vm.maskingReviewNote">
        <p class="print-line">{{ vm.maskingReviewNote.text }}</p>
        <ul v-if="vm.maskingMarkedSpots.length" class="print-spot-list">
          <li v-for="(s, i) in vm.maskingMarkedSpots" :key="`spot-${i}`" class="print-sub">
            <strong>{{ s.driverLabel }}</strong> könnte den {{ s.area }}-Befund überdecken: {{ s.text }}
          </li>
        </ul>
      </template>
      <p v-else class="print-sub">
        Kein Maskierungs-Hinweis – das Modell hat keine Stelle markiert, an der ein ästhetischer
        Treiber einen Befund überdecken könnte.
      </p>
    </section>

    <!-- Block 7: Normative Bildwirkung (immer; getrennt von Block 6; verändert den Status NICHT) -->
    <section class="print-block">
      <h2 class="print-h2">Normative Bildwirkung</h2>
      <template v-if="vm.normativeMasking.verdict !== 'not_applicable'">
        <p class="print-line">Idealisierende Norm: {{ NORMATIVE_VERDICT_LABELS[vm.normativeMasking.verdict] }}.</p>
        <div v-if="vm.normativeMasking.aspects.length" class="print-chips">
          <Chip v-for="a in vm.normativeMasking.aspects" :key="a" :label="NORMATIVE_ASPECT_LABELS[a]" />
        </div>
        <div v-if="vm.normativeMaskingNote" class="print-note-wrap">
          <NoteBlock :content="vm.normativeMaskingNote" type="masking" />
        </div>
      </template>
      <p v-else class="print-sub">Keine normative Bildwirkung erkannt – für dieses Bild nicht einschlägig.</p>
    </section>

    <!-- Block 8: Leseart + visuelle Treiber -->
    <section class="print-block">
      <h2 class="print-h2">Leseart &amp; visuelle Treiber</h2>
      <p class="print-line">{{ vm.readingMode.label }} ({{ vm.readingMode.code }})</p>
      <p class="print-sub">{{ READING_MODE_DESC[vm.readingMode.code] }}</p>
      <div v-if="vm.visualDrivers.length" class="print-chips">
        <Chip v-for="(drv, i) in vm.visualDrivers" :key="`${drv.code}-${i}`" :code="drv.code" :label="drv.label" />
      </div>
    </section>

    <!-- Block 9: Alle Befunde (aufgeklappt – userHints + hiddenHints) -->
    <section class="print-block">
      <h2 class="print-h2">Befunde</h2>
      <ul v-if="allHints.length" class="print-hints">
        <li v-for="(h, i) in allHints" :key="i" class="print-hint">
          <div class="ph-head">
            <span class="ph-sev" :class="`sev-${HINT_SEVERITY_TO_SEVERITY[h.severity]}`">{{ HINT_SEVERITY_LABEL[h.severity] }}</span>
            <span class="ph-text">{{ h.text }}</span>
          </div>
          <ul v-if="h.concreteFindings && h.concreteFindings.length" class="ph-concrete">
            <li v-for="(c, ci) in h.concreteFindings" :key="ci">{{ c.text }}</li>
          </ul>
        </li>
      </ul>
      <p v-else class="print-sub">
        Keine spezifischen Hinweise – das Tool hat nichts gefunden. Das heisst „nichts
        gefunden", nicht „fehlerfrei": Die eigene Sichtprüfung ersetzt es nicht.
      </p>
    </section>

    <!-- Block 10: Prüf-Hinweise (flach, je Item Severity + Prüffrage) -->
    <section class="print-block">
      <h2 class="print-h2">
        Prüf-Hinweise
        <span v-if="vm.hintsSortedBySeverity.length" class="print-count">({{ vm.hintsCountBySeverity.high }} hoch · {{ vm.hintsCountBySeverity.medium }} mittel · {{ vm.hintsCountBySeverity.low }} niedrig)</span>
      </h2>
      <div v-if="vm.hintsSortedBySeverity.length" class="print-checks">
        <div v-for="h in vm.hintsSortedBySeverity" :key="h.id" class="print-check">
          <div class="pc-head">
            <span class="ph-sev" :class="`sev-${HINT_SEVERITY_TO_SEVERITY[h.severity]}`">{{ HINT_SEVERITY_LABEL[h.severity] }}</span>
            <p class="pc-hint">{{ h.hint }}</p>
          </div>
          <p class="pc-q-label">Prüffrage</p>
          <p class="pc-q">{{ h.reviewQuestion }}</p>
        </div>
      </div>
      <p v-else class="print-sub">Keine regelbasierten Prüf-Hinweise für diesen Befund.</p>
    </section>

    <!-- Block 11: Bias-Achsen-Zusammenfassung -->
    <section class="print-block">
      <h2 class="print-h2">Bias-Achsen</h2>
      <p class="print-line" v-if="vm.biasAxesSummary.count > 0">
        {{ vm.biasAxesSummary.count }} {{ vm.biasAxesSummary.count === 1 ? 'Achse' : 'Achsen' }} erkannt
        · maximales Risiko: {{ RISK_LEVEL_LABEL[vm.biasAxesSummary.maxRisk] }}.
      </p>
      <p class="print-sub" v-else>Keine Bias-Achsen erkannt.</p>
    </section>

    <!-- Block 12: Methoden-Fussnote (nicht-technisch, ohne Debug/Modell-Versionen) -->
    <section class="print-block print-footnote">
      <p>
        Diese Einschätzung entsteht durch ein KI-Modell und ist diagnostisch – sie ersetzt keine
        redaktionelle Prüfung. Das letzte Urteil bleibt bei dir.
      </p>
    </section>
  </div>
</template>

<style scoped>
/* Sichtbarkeit self-contained: am Screen verborgen, nur im Druck sichtbar.
   (Codex-Review B: nicht auf Parent-scoped-CSS verlassen.) */
.report-print-view {
  display: none;
}

@media print {
  .report-print-view {
    display: block !important;
    background: #ffffff;
    color: var(--ink);
  }
  /* Jeder Block – und jeder einzelne Befund/Prüf-Hinweis – bleibt zusammen. */
  .print-block,
  .print-hint,
  .print-check {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .print-block h1,
  .print-block h2 {
    break-after: avoid;
  }
}

/* ── Block-Grundgerüst (Variante C, Halbgeviertstrich, kein Links-Streifen) ── */
.print-block {
  margin-bottom: 22px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--line-soft);
}
.print-block:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

/* Block 1: Kopf */
.print-doc-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ink);
}
.print-date {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 12px;
  color: var(--muted);
  margin-top: 6px;
  letter-spacing: 0.04em;
}
.print-disclaimer {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
  margin-top: 10px;
  max-width: 70ch;
}

/* Block-Überschrift */
.print-h2 {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--ink-soft);
  margin-bottom: 12px;
}
.print-count {
  margin-left: 6px;
  letter-spacing: 0.04em;
  color: var(--muted);
  text-transform: none;
}

/* Block 2: Eingabe-Zusammenfassung */
.print-input-grid {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 16px 24px;
  align-items: start;
}
.pimg {
  position: relative;
  aspect-ratio: 4 / 5;
  max-width: 180px;
  border: 1px solid var(--line);
  background: repeating-linear-gradient(45deg, rgba(35, 37, 29, 0.5) 0 1px, transparent 1px 18px), var(--surface-2);
}
.pimg img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.pimg span {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.18em;
  color: var(--muted);
}
.print-kv {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 7px 16px;
  font-size: 14px;
  line-height: 1.5;
  align-content: start;
}
.print-kv dt {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 500;
}
.print-kv dd {
  color: var(--ink);
  word-break: break-word;
}
.print-ctx-warn {
  display: block;
  margin-top: 4px;
  font-size: 13px;
  color: var(--warn-ink);
  line-height: 1.45;
}

/* Block 3: Gesamturteil */
.print-status-word {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 12px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  border: 1px solid var(--ink);
  border-radius: 3px;
  padding: 5px 10px;
  color: var(--ink);
}
.print-status-word .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex: 0 0 auto;
}
.print-verdict-head {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.08;
  color: var(--ink);
}
.print-verdict-head .accent {
  color: var(--accent);
}
.print-rec {
  margin-top: 12px;
  font-size: 15px;
  line-height: 1.5;
  color: var(--ink);
  max-width: 64ch;
}
.print-notes {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}
.print-note-wrap {
  margin-top: 14px;
}

/* Block 4: Hero-Score */
.print-hero {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 14px;
}
.print-hero .h {
  font-size: 64px;
  font-weight: 700;
  line-height: 0.9;
  letter-spacing: -0.04em;
  color: var(--ink);
}
.print-hero .den {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 14px;
  font-weight: 500;
  color: var(--muted);
  letter-spacing: 0.04em;
}

/* Block 5: Dimensionen */
.print-dims {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid var(--line-strong);
}
.print-dim {
  padding: 14px 16px;
  border-right: 1px solid var(--line-strong);
}
.print-dim:last-child {
  border-right: none;
}
.print-dim .pn {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 600;
}
.print-dim .pv {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.03em;
  margin: 4px 0 2px;
  color: var(--ink);
}
.print-dim .pw {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--ink-soft);
}

/* Block 6/7/8/11: Zeilen + Chips */
.print-line {
  font-size: 15px;
  color: var(--ink);
  line-height: 1.5;
}
.print-sub {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.5;
  margin-top: 6px;
}
.print-spot-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.print-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 12px;
}

/* Block 9: Befunde (flach) */
.print-hints {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.print-hint .ph-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.ph-sev {
  flex: 0 0 auto;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 2px;
}
.ph-text {
  font-size: 15px;
  color: var(--ink);
  line-height: 1.5;
}
.ph-concrete {
  list-style: disc;
  margin: 8px 0 0 28px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ph-concrete li {
  font-size: 14px;
  color: var(--ink-soft);
  line-height: 1.5;
}

/* Block 10: Prüf-Hinweise */
.print-checks {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.print-check {
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--surface);
  padding: 12px 14px;
}
.pc-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.pc-hint {
  font-size: 14px;
  color: var(--ink);
  line-height: 1.5;
}
.pc-q-label {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--subtle);
  font-weight: 600;
  margin: 10px 0 4px;
}
.pc-q {
  font-size: 14px;
  color: var(--ink-soft);
  line-height: 1.5;
}

/* Block 12: Fussnote */
.print-footnote p {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
  max-width: 70ch;
}

/* Severity-Farben (doppelt kodiert: Farbe + Wort) */
.ink-safe { color: var(--safe-ink); }
.ink-warn { color: var(--warn-ink); }
.ink-crit { color: var(--crit-ink); }
.ink-muted { color: var(--muted); }
.bg-safe { background: var(--safe); }
.bg-warn { background: var(--warn); }
.bg-crit { background: var(--crit); }
.ph-sev.sev-safe { background: var(--safe); color: var(--surface); }
.ph-sev.sev-warn { background: var(--warn); color: var(--ink); }
.ph-sev.sev-crit { background: var(--crit); color: var(--surface); }
.ph-sev.sev-neutral { background: var(--surface-2); color: var(--ink-soft); border: 1px solid var(--line-strong); }
</style>
