<script setup lang="ts">
// ReportPrintView (report-print.md) – dedizierte Druckansicht für den
// „Als PDF exportieren"-Pfad (window.print(), kein jsPDF/html2canvas).
// Eigene FLACHE Render-Variante der Report-Daten: alle Befunde aufgeklappt,
// KEINE Interaktion, KEINE Debug-UI. Datenquelle = dasselbe AnalysisViewModel
// wie das Cockpit PLUS der eingefrorene Submit-State (usage_form/Kontext/
// Prompt sind frontend-only, nicht im Pipeline-JSON → als Props hereingereicht).
//
// Layout (Redesign 2026-07-13): zwei Seiten-Wrapper. Seite 1 = Urteil
// (Urteilskarte in Cockpit-Anmutung + Dimensionen + geprüfte Angaben mit
// Marker-Overlay), Seite 2 = Befunde & Prüfung. Print-flach: keine Animationen,
// keine Schatten/Verläufe – Statuswort + Hairlines tragen die Aussage auch ohne
// gedruckte Hintergründe. Ziel: typischer Befund = 2 Seiten; bei befundreichen
// Analysen gewinnt Vollständigkeit über die Seitenzahl.
//
// Sichtbarkeit ist self-contained: am Screen display:none, im @media print
// display:block (Codex-Review B: nicht auf Parent-scoped-CSS bauen). Die
// interaktive Stage/Cockpit-Ansicht blendet analyze.vue im Druck aus.
//
// Harte Leitplanken: Status NUR aus overallVerdict.status (nie aus Score);
// Dimensions-Farben statusgetrieben (STATUS_TO_SEVERITY, nie severityFor);
// faktische ≠ normative Maskierung getrennt; kein v-html; kein Debug/CLIP/
// Intent-Reasoning (normativeMasking.reasoning ist davon AUSGENOMMEN – der
// Screen zeigt es ebenfalls, DiagnoseCockpit context.normative.reasoning);
// KEIN Links-Akzent-Streifen; Severity doppelt kodiert.
// Dedup NUR bei normalisierter Textgleichheit – nie allein wegen gleicher
// Quelle (Codex-Review: Anatomie-Hints tragen dimension:'physics'; Kontext-
// Spot ≠ Halluzinations-Finding; Bias hat strukturell keine Spots).
import { computed } from 'vue'
import Chip from '~/components/ui/Chip.vue'
import {
  STATUS_TO_SEVERITY,
  STATUS_WORD,
  DIMENSION_LABELS,
  DIMENSION_DESC,
  INPUT_COMPLETENESS_LABELS,
  NORMATIVE_ASPECT_LABELS,
  HINT_SEVERITY_TO_SEVERITY,
  HINT_SEVERITY_LABEL,
  INTENT_LABELS,
  USAGE_FORM_LABELS,
  RISK_LEVEL_LABEL,
} from '~/lib/severity'
import { useReportT } from '~/composables/useReportT'
import type {
  AnalysisViewModel,
  UsageForm,
  InspectorSpot,
  ConsolidatedHint,
} from '~/types/analysis'
import { buildInspectorSpots } from '~/lib/overlay-spots'

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

// Statik in der eingefrorenen Report-Sprache (vm.reportLang via analyze.vue-provide),
// nicht in der reaktiven UI-Locale – ein Sprachwechsel mischt das PDF nicht.
const { rt, rtp, reportLang } = useReportT()

// Hero: heroScore ist kontraktlich number; Fallback auf integrityScore (Variante A).
// Kein eigenes Severity-Wort am Score (wie am Screen) – das Urteil trägt der Status.
const hero = computed(() => props.heroScore ?? vm.value.integrityScore)
const clampPct = (n: number) => Math.max(0, Math.min(100, n))
const readingModeLabel = computed(() => `${vm.value.readingMode.label} (${vm.value.readingMode.code})`)

// Eingabe-Zusammenfassung – Labels aus dem eingefrorenen Submit-State.
const intentLabel = computed(() => INTENT_LABELS[vm.value.intentAssessment.declaredIntent][reportLang.value])
const usageFormLabel = computed(() =>
  props.submittedUsageForm
    ? USAGE_FORM_LABELS[props.submittedUsageForm][reportLang.value]
    : rt('report.common.notProvided'),
)

// Dimensionen: Farbe/Severity STATUSGETRIEBEN (wie DiagnoseCockpit), der Score
// steuert nur Zahl + Gauge-Füllstand.
const dims = computed(() =>
  (['physics', 'semantics', 'bias'] as const).map((d) => {
    const dim = vm.value.dimensions[d]
    const lang = reportLang.value
    return {
      key: d,
      label: DIMENSION_LABELS[d][lang],
      desc: DIMENSION_DESC[d][lang],
      score: dim.score,
      severity: STATUS_TO_SEVERITY[dim.status],
      statusWord: STATUS_WORD[dim.status][lang],
    }
  }),
)

// Headline: Schlusspunkt als chromatischer Akzent (kein Links-Streifen).
const headlineMain = computed(() => vm.value.overallVerdict.headline.replace(/\.$/, ''))
const headlineHasDot = computed(() => vm.value.overallVerdict.headline.endsWith('.'))

// ── Lokalisierte Bildbefunde: F2-Projektion wie der Bild-Inspektor ────────────
const allSpots = computed(() => buildInspectorSpots(vm.value.evidenceSpots, vm.value.reportLang))
// Bild-Overlay (Seite 1): nur sicher verortete Boxen (F2-Schwelle) werden gedruckt;
// unsichere Spots erscheinen ausschliesslich in den Textlisten.
const boxedSpots = computed(() => allSpots.value.filter((s) => s.qualifiesAsBox))
const codebookSpots = computed(() => allSpots.value.filter((s) => s.source !== 'masking'))
const maskingSpots = computed(() => allSpots.value.filter((s) => s.source === 'masking'))

function spotSourceLabel(s: InspectorSpot): string {
  if (s.source === 'masking') {
    const masking = rt('report.spotSource.masking')
    return s.driverLabel ? `${masking} · ${s.driverLabel}` : masking
  }
  return rt(`report.spotSource.${s.source}`)
}
// Box [y_min, x_min, y_max, x_max], normiert 0–1000 → %-Position auf dem Bild.
// Das Overlay liegt auf einem shrink-wrap-Wrapper (Wrapper = Bildfläche, kein
// object-fit-Beschnitt) → Prozentwerte sind geometrisch korrekt.
function boxStyle(box: readonly [number, number, number, number]) {
  const [y1, x1, y2, x2] = box
  return {
    top: `${y1 / 10}%`,
    left: `${x1 / 10}%`,
    width: `${(x2 - x1) / 10}%`,
    height: `${(y2 - y1) / 10}%`,
  }
}

// ── Konsolidierter Befundblock (ersetzt „Lokalisierte Bildbefunde" + „Befunde") ──
// Hints (userHints + hiddenHints, aufgeklappt) als Gruppen; die Codebook-Spots
// werden per Topic↔Source ZUGEORDNET (Gruppierung, keine Löschregel). Jeder Spot
// erscheint genau einmal; Spots ohne passenden Hint landen in der Restliste.
// concreteFindings entfallen nur bei normalisierter Textgleichheit mit einem
// zugeordneten Spot (echte Dopplung), sonst bleiben sie stehen.
const TOPIC_TO_SPOT_SOURCE: Partial<Record<ConsolidatedHint['topic'], InspectorSpot['source']>> = {
  physics: 'physics',
  anatomy: 'anatomy',
  context_logic: 'context',
}
const normText = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim()

// Kategorie-Tag pro Topic – ersetzt den generischen Hint-Satz als Kopfzeile,
// sobald konkrete Belege (Spots/Findings) den Inhalt tragen (Straffung 2026-07-17).
// Texte: report.print.topicTag.* (feste Report-Sprache).
const topicTag = (topic: ConsolidatedHint['topic']): string => rt(`report.print.topicTag.${topic}`)

// Prüffragen den Befunden zuordnen – über die vorhandenen rule:<id>-Signale
// (Codex-Review: NICHT über Reihenfolge oder Textähnlichkeit). Nicht zuordenbare
// Fragen erscheinen als Restliste; context_missing ist mit der Eingabe-Warnung
// (hasContextWarning, Seite 1) konsolidiert und entfällt hier.
function ruleQuestionFor(h: ConsolidatedHint): { id: string; question: string } | null {
  const rule = vm.value.hintsSortedBySeverity.find((r) => h.signals.includes(`rule:${r.id}`))
  return rule ? { id: rule.id, question: rule.reviewQuestion } : null
}

// Anzeige-Text der Gruppe: mit Belegen trägt das Kategorie-Tag die Kopfzeile
// (kein generischer Satz mehr). Ohne Belege bleibt ein Satz stehen – für
// Halluzination als positiver, nicht lokalisierter Befund präzisiert; für
// bias_combined und masking als Verweis, wenn die jeweilige Detail-Sektion
// («Bias-Achsen» bzw. «Maskierung & Bildwirkung») die Inhalte ohnehin liefert.
function groupText(h: ConsolidatedHint, evidenceCount: number): string | null {
  if (evidenceCount > 0) return null
  if (h.topic === 'hallucination') {
    return rt('report.print.groupText.hallucination')
  }
  if (h.topic === 'bias_combined' && vm.value.biasAxesDetails.length > 0) {
    return rt('report.print.groupText.biasCombined')
  }
  if (h.topic === 'masking' && hasFactualMasking.value) {
    return rt('report.print.groupText.masking')
  }
  return h.text
}

const findingGroups = computed(() => {
  const usedSpotIds = new Set<string>()
  const matchedRuleIds = new Set<string>()
  const groups = [...vm.value.userHints, ...vm.value.hiddenHints].map((h) => {
    const source = TOPIC_TO_SPOT_SOURCE[h.topic]
    const spots = source
      ? codebookSpots.value.filter((s) => s.source === source && !usedSpotIds.has(s.id))
      : []
    spots.forEach((s) => usedSpotIds.add(s.id))
    const spotTexts = new Set(spots.map((s) => normText(s.text)))
    const findings = (h.concreteFindings ?? []).filter((c) => !spotTexts.has(normText(c.text)))
    const rule = ruleQuestionFor(h)
    if (rule) matchedRuleIds.add(rule.id)
    return {
      hint: h,
      spots,
      findings,
      tag: topicTag(h.topic),
      text: groupText(h, spots.length + findings.length),
      question: rule?.question ?? null,
    }
  })
  const restSpots = codebookSpots.value.filter((s) => !usedSpotIds.has(s.id))
  return { groups, restSpots, matchedRuleIds }
})
const hasFindingContent = computed(
  () => findingGroups.value.groups.length > 0 || findingGroups.value.restSpots.length > 0,
)

// Restliste: regelbasierte Prüffragen ohne zugeordneten Befund (z.B. visual_overload).
const extraQuestions = computed(() =>
  vm.value.hintsSortedBySeverity.filter(
    (r) => r.id !== 'context_missing' && !findingGroups.value.matchedRuleIds.has(r.id),
  ),
)

// Nullfälle (Codex-Review: Semantiken nicht vermischen): leere Sektionen werden
// nicht mehr als Erklär-Leertext gerendert, sondern in EINER Sammelzeile mit
// je eigener Formulierung ausgewiesen. Prüf-Hinweise gehören nicht hinein
// (keine Befunddimension); positive Signale ohne Spot bleiben Befunde.
const hasFactualMasking = computed(
  () => !!vm.value.maskingReviewNote || maskingSpots.value.length > 0,
)
const hasNormative = computed(() => vm.value.normativeMasking.verdict !== 'not_applicable')
const hasBiasAxes = computed(
  () => vm.value.biasAxesSummary.count > 0 || vm.value.biasAxesDetails.length > 0,
)
const notReported = computed(() => {
  const parts: string[] = []
  if (!hasFactualMasking.value) parts.push(rt('report.print.notReportedItems.noFactualMasking'))
  if (!hasNormative.value) parts.push(rt('report.print.notReportedItems.noNormative'))
  if (!hasBiasAxes.value) parts.push(rt('report.print.notReportedItems.noBiasAxes'))
  return parts
})

// Laien-Übersetzung der normativen Bildwirkung (nur Print – der Screen behält
// die Fachbegriffe in der Progressive Disclosure). «Idealisierende Norm: mittel»
// und die NORMATIVE_*-Notes waren für Nicht-Fachpublikum unverständlich
// (Nutzer-Feedback 2026-07-17). Gleiche Datenlage, klarere Sprache; die
// Intent-Differenzierung der high-Notes bleibt erhalten.
// Texte: report.print.normative* (feste Report-Sprache).
const NORMATIVE_DEGREES = new Set(['low', 'medium', 'high'])
const normativeSentence = computed(() => {
  const v = vm.value.normativeMasking.verdict
  if (!NORMATIVE_DEGREES.has(v)) return null
  return rt('report.print.normativeSentence', { degree: rt(`report.print.normativeDegree.${v}`) })
})
const printNormativeNote = computed(() => {
  if (!vm.value.normativeMaskingNote) return null
  const v = vm.value.normativeMasking.verdict
  if (v === 'high') return rt(`report.print.normativeHighNote.${vm.value.intentAssessment.declaredIntent}`)
  if (v === 'medium') return rt('report.print.normativeMediumNote')
  return null
})

// Leseart: EINE Maskierungs-Logik-Zeile. Seit @pipeline/vocab liefert das
// ViewModel immer einen nicht-leeren vocab-String – defensiver Leerstring genügt
// (kein READING_MODE_DESC-Fallback mehr).
const readingModeLogic = computed(() => vm.value.readingModeMaskingLogic?.trim() ?? '')
</script>

<template>
  <div class="report-print-view">
    <!-- ═══ SEITE 1: URTEIL ═══════════════════════════════════════════════ -->
    <div class="print-page print-page--summary">
      <!-- Dokument-Kopf -->
      <header class="print-head">
        <div class="print-head__row">
          <h1 class="print-doc-title">{{ rt('report.print.docTitle') }}</h1>
          <p class="print-date">{{ rt('report.print.checkedOn', { date: generatedAt }) }}</p>
        </div>
        <!-- Einziger genereller Disclaimer des Dokuments (Codex-Review: gehört auf
             Seite 1, weil diese am ehesten allein weitergegeben wird). -->
        <p class="print-disclaimer">
          {{ rt('report.print.disclaimer') }}
        </p>
      </header>

      <!-- Urteilskarte: Verdikt links, Integritäts-Panel rechts (Cockpit-Anmutung, print-flach) -->
      <section class="print-verdict-card">
        <div class="pv-verdict">
          <span class="pv-status">
            <span class="pv-status__dot" :class="`bg-${statusSeverity}`" aria-hidden="true" />
            {{ rt('report.common.statusWord', { word: STATUS_WORD[status][reportLang] }) }}
          </span>
          <p class="pv-headline">{{ headlineMain }}<span v-if="headlineHasDot" class="accent">.</span></p>
          <p class="pv-rec">{{ vm.overallVerdict.recommendation }}</p>
        </div>
        <div class="pv-score">
          <p class="pv-eyebrow">{{ rt('report.common.integrity') }}</p>
          <div class="pv-score__head">
            <span class="pv-score__num">{{ hero }}</span><span class="pv-score__den">/ 100</span>
          </div>
          <div class="pv-bar" :class="`fill-${statusSeverity}`">
            <span class="pv-bar__fill" :style="{ width: `${clampPct(hero)}%` }" />
            <span class="pv-bar__marker" :style="{ left: `${clampPct(hero)}%` }" />
          </div>
          <div class="pv-bar__ends" aria-hidden="true"><span>0</span><span>50</span><span>100</span></div>
          <div class="pv-lines">
            <div class="pv-line">
              <span class="pv-line__k">{{ rt('report.common.aesthetic') }}</span>
              <span class="pv-line__v">{{ vm.aestheticCombined }} / 100<em class="pv-line__note">{{ rt('report.common.noVerdict') }}</em></span>
            </div>
            <div class="pv-line">
              <span class="pv-line__k">{{ rt('report.common.readingMode') }}</span>
              <!-- Nur das Kürzel – der volle Name folgt im Leseart-Block; das 240px-Panel
                   würde das Label sonst hässlich umbrechen (Codex-Review). -->
              <span class="pv-line__v">{{ vm.readingMode.code }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Dimensionen: statusgetriebene Dreierzeile mit Mini-Gauge -->
      <section class="print-block">
        <h2 class="print-h2">{{ rt('report.print.dimensionsTitle') }}</h2>
        <div class="print-dims">
          <div v-for="d in dims" :key="d.key" class="print-dim">
            <div class="pd-name">{{ d.label }}</div>
            <div class="pd-desc">{{ d.desc }}</div>
            <div class="pd-row">
              <span class="pd-score">{{ d.score }}</span>
              <span class="pd-den">/ 100</span>
              <span class="pd-word" :class="`ink-${d.severity}`">{{ d.statusWord }}</span>
            </div>
            <div class="pd-gauge">
              <span class="pd-gauge__fill" :class="`bg-${d.severity}`" :style="{ width: `${clampPct(d.score)}%` }" />
            </div>
          </div>
        </div>
      </section>

      <!-- Geprüfte Angaben: Bild mit Marker-Overlay + eingefrorener Submit-State -->
      <section class="print-block">
        <h2 class="print-h2">{{ rt('report.print.checkedInputs') }}</h2>
        <div class="print-input-grid">
          <div class="print-figure">
            <div v-if="imageUrl" class="print-img-wrap">
              <img :src="imageUrl" :alt="rt('report.print.imageAlt')" />
              <span
                v-for="s in boxedSpots"
                :key="s.id"
                class="print-spot-box"
                :style="boxStyle(s.box)"
                aria-hidden="true"
              >
                <span class="print-spot-box__id">{{ s.id }}</span>
              </span>
            </div>
            <p v-else class="print-img-missing">{{ rt('report.print.imageMissing') }}</p>
            <p v-if="imageUrl && boxedSpots.length" class="print-figure-caption">
              {{ rt('report.print.figureCaption') }}
            </p>
          </div>
          <dl class="print-kv">
            <!-- Empfehlungs-Notes stehen HIER als «Einordnung» (algorithmische Rahmung
                 der Empfehlung, keine Nutzereingabe – Codex-Review), nicht mehr als
                 Banner unter dem Urteil. -->
            <dt>{{ rt('report.print.kv.intent') }}</dt>
            <dd>
              {{ intentLabel }}
              <span v-if="vm.intentRecommendationNote" class="print-kv-note">{{ rt('report.print.recommendationContext', { note: vm.intentRecommendationNote }) }}</span>
            </dd>
            <dt>{{ rt('report.print.kv.usageForm') }}</dt>
            <dd>
              {{ usageFormLabel }}
              <span v-if="vm.usageFormNote" class="print-kv-note">{{ rt('report.print.recommendationContext', { note: vm.usageFormNote }) }}</span>
            </dd>
            <dt>{{ rt('report.print.kv.usageContext') }}</dt>
            <dd>{{ submittedContext || rt('report.common.notProvided') }}</dd>
            <dt>{{ rt('report.print.kv.originalPrompt') }}</dt>
            <dd>{{ submittedPrompt || rt('report.common.notProvided') }}</dd>
            <dt>{{ rt('report.print.kv.completeness') }}</dt>
            <dd>
              {{ INPUT_COMPLETENESS_LABELS[vm.inputCompleteness][reportLang] }}.
              <span v-if="vm.hasContextWarning" class="print-ctx-warn">{{ rt('report.print.contextWarn') }}</span>
            </dd>
          </dl>
        </div>
      </section>

      <!-- Leseart & visuelle Treiber (Einordnung → Seite 1): EINE kompakte Zeile -->
      <section class="print-block">
        <h2 class="print-h2">{{ rt('report.print.readingDriversTitle') }}</h2>
        <p class="print-line"><strong>{{ readingModeLabel }}</strong> · {{ readingModeLogic }}</p>
        <div v-if="vm.visualDrivers.length" class="print-chips">
          <Chip v-for="(drv, i) in vm.visualDrivers" :key="`${drv.code}-${i}`" :code="drv.code" :label="drv.label" />
        </div>
      </section>
    </div>

    <!-- ═══ SEITE 2: BEFUNDE & PRÜFUNG ════════════════════════════════════ -->
    <div class="print-page print-page--details">
      <!-- Konsolidierter Befundblock: Hints als Gruppen, Spots als Belege darunter -->
      <section class="print-block">
        <h2 class="print-h2">{{ rt('report.print.findingsTitle') }}</h2>
        <div v-if="hasFindingContent" class="print-findings">
          <!-- Zweistufig statt dreistufig: Kategorie-Tag + Severity als Kopf, die
               konkreten Belege tragen den Inhalt; die zugeordnete Prüffrage hängt
               direkt an der Karte (ersetzt die separate Prüf-Hinweise-Sektion). -->
          <div v-for="(g, gi) in findingGroups.groups" :key="gi" class="print-finding">
            <div class="pf-head">
              <span class="pf-sev" :class="`sev-${HINT_SEVERITY_TO_SEVERITY[g.hint.severity]}`">{{ HINT_SEVERITY_LABEL[g.hint.severity][reportLang] }}</span>
              <span class="pf-tag">{{ g.tag }}</span>
              <span v-if="g.text" class="pf-text">{{ g.text }}</span>
            </div>
            <ul v-if="g.spots.length || g.findings.length" class="pf-evidence">
              <li v-for="s in g.spots" :key="s.id" class="pf-spot">
                <span class="pf-spot__id">{{ s.id }}</span>
                <span class="pf-spot__body">
                  {{ s.text }}
                  <span v-if="!s.qualifiesAsBox" class="pf-spot__meta">{{ rt('report.print.noSecureLocation') }}</span>
                </span>
              </li>
              <li v-for="(c, ci) in g.findings" :key="`c-${ci}`" class="pf-concrete">{{ c.text }}</li>
            </ul>
            <p v-if="g.question" class="pf-question"><span class="pn-label">{{ rt('report.print.reviewQuestion') }}</span>{{ g.question }}</p>
          </div>
          <div v-if="findingGroups.restSpots.length" class="print-finding">
            <div class="pf-head">
              <span class="pf-sev sev-neutral">{{ rt('report.print.imageSpot') }}</span>
              <span class="pf-text">{{ rt('report.print.moreLocatedFindings') }}</span>
            </div>
            <ul class="pf-evidence">
              <li v-for="s in findingGroups.restSpots" :key="s.id" class="pf-spot">
                <span class="pf-spot__id">{{ s.id }}</span>
                <span class="pf-spot__body">
                  {{ s.text }} <span class="pf-spot__meta">{{ spotSourceLabel(s) }}<template v-if="!s.qualifiesAsBox"> · {{ rt('report.print.noSecureLocation') }}</template></span>
                </span>
              </li>
            </ul>
          </div>
          <p v-if="codebookSpots.length" class="print-caption">
            {{ rt('report.print.pakCaption') }}<template v-if="boxedSpots.length">{{ rt('report.print.pakCaptionSuffix') }}</template>.
          </p>
        </div>
        <p v-else class="print-sub">
          {{ rt('report.print.noFindings') }}
        </p>
        <!-- Prüffragen ohne zugeordneten Befund (z.B. visual_overload) als kompakte
             Restliste – die früheren generischen Erklärabsätze entfallen im PDF. -->
        <div v-if="extraQuestions.length" class="print-extra-questions">
          <p class="print-sublabel">{{ rt('report.print.moreQuestions') }}</p>
          <div v-for="h in extraQuestions" :key="h.id" class="print-check">
            <div class="pc-head">
              <span class="pf-sev" :class="`sev-${HINT_SEVERITY_TO_SEVERITY[h.severity]}`">{{ HINT_SEVERITY_LABEL[h.severity][reportLang] }}</span>
              <p class="pc-q">{{ h.reviewQuestion }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Maskierung & Bildwirkung: faktisch ≠ normativ – nur gerenderte Unterabschnitte
           mit Inhalt; Nullfälle laufen in die «Nicht ausgewiesen»-Sammelzeile unten. -->
      <section v-if="hasFactualMasking || hasNormative" class="print-block">
        <h2 class="print-h2">{{ rt('report.print.maskingTitle') }}</h2>
        <div v-if="hasFactualMasking" class="print-subblock">
          <p class="print-sublabel">{{ rt('report.print.factualMasking') }}</p>
          <p v-if="vm.maskingReviewNote" class="print-line">{{ vm.maskingReviewNote.text }}</p>
          <ul v-if="maskingSpots.length" class="pf-evidence pf-evidence--tight">
            <li v-for="s in maskingSpots" :key="s.id" class="pf-spot">
              <span class="pf-spot__id">{{ s.id }}</span>
              <span class="pf-spot__body">
                {{ s.text }} <span class="pf-spot__meta">{{ spotSourceLabel(s) }}<template v-if="!s.qualifiesAsBox"> · {{ rt('report.print.noSecureLocation') }}</template></span>
              </span>
            </li>
          </ul>
        </div>
        <div v-if="hasNormative" class="print-subblock">
          <p class="print-sublabel">{{ rt('report.print.idealization') }}</p>
          <p v-if="normativeSentence" class="print-line">{{ normativeSentence }}</p>
          <p v-if="vm.normativeMasking.reasoning" class="print-sub">{{ vm.normativeMasking.reasoning }}</p>
          <div v-if="vm.normativeMasking.aspects.length" class="print-chips">
            <Chip v-for="a in [...new Set(vm.normativeMasking.aspects)]" :key="a" :label="NORMATIVE_ASPECT_LABELS[a][reportLang]" />
          </div>
          <p v-if="printNormativeNote" class="print-note-line">
            <span class="pn-label">{{ rt('report.print.hintLabel') }}</span>{{ printNormativeNote }}
          </p>
        </div>
      </section>

      <!-- Bias-Achsen (nur mit Inhalt – Nullfall siehe Sammelzeile) -->
      <section v-if="hasBiasAxes" class="print-block">
        <h2 class="print-h2">{{ rt('report.common.biasAxes') }}</h2>
        <p class="print-line" v-if="vm.biasAxesSummary.count > 0">
          {{ rtp('report.common.axesDetected', vm.biasAxesSummary.count) }}
          · {{ rt('report.common.maxRisk', { level: RISK_LEVEL_LABEL[vm.biasAxesSummary.maxRisk][reportLang] }) }}.
        </p>
        <div v-for="ax in vm.biasAxesDetails" :key="ax.axisId" class="print-axis">
          <p class="print-axis__head">{{ ax.label }} · {{ rt('report.common.risk', { level: RISK_LEVEL_LABEL[ax.riskLevel][reportLang] }) }}</p>
          <template v-for="(e, i) in ax.evidence" :key="`ev-${i}`">
            <p class="print-sub"><strong>{{ rt('report.print.observationLabel') }}</strong> {{ e.observation }}</p>
            <p class="print-sub">
              <strong>{{ rt('report.print.readingLabel') }}</strong> {{ e.interpretation }}<template v-if="!e.supportsBiasFinding"> {{ rt('report.print.noBiasSupport') }}</template>
            </p>
          </template>
        </div>
      </section>

      <!-- Sichtbare Bildmarkierung (Provenienzmarker – kein Befund, getrennt von
           P/A/K/M-Spots). Bewusst leichte Sublabel-Überschrift: nur 1–2 Zeilen
           Inhalt, eine volle H2 würde die Mini-Sektion übergewichten. -->
      <section v-if="vm.provenanceMarkers.length" class="print-block">
        <h2 class="print-h2 print-h2--light">{{ rt('report.print.provTitle') }}</h2>
        <p v-for="(m, i) in vm.provenanceMarkers" :key="i" class="print-sub print-sub--first">
          {{ m.description }} – {{ rt('report.print.detectionConfidence', { level: rt(`report.common.confidence.${m.confidence}`) }) }}
        </p>
        <p class="print-caption print-caption--tight">
          {{ rt('report.print.provCaption') }}
        </p>
      </section>

      <!-- Nullfall-Sammelzeile: ersetzt die früheren Erklär-Leertexte pro Sektion,
           mit je eigener Formulierung (Semantiken nicht vermischen, Codex-Review). -->
      <section v-if="notReported.length" class="print-block">
        <p class="print-sub">{{ rt('report.print.notReported', { items: notReported.join(' · ') }) }}</p>
      </section>
    </div>
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
  /* Seite 1 endet hart – Seite 2 beginnt sauber mit den Befunden. */
  .print-page--summary {
    break-after: page;
    page-break-after: always;
  }
  /* Umbruchschutz nur auf Einzelzeilen/-befunden, NICHT auf ganzen Sektionen –
     grosse avoid-Blöcke verschieben sonst halbe Seiten (Codex-Review). */
  .print-verdict-card,
  .print-dim,
  .print-finding,
  .pf-spot,
  .print-check,
  .print-axis {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .print-block h1,
  .print-block h2 {
    break-after: avoid;
  }
}

/* ── Grundgerüst (Variante C, Halbgeviertstrich, kein Links-Streifen) ── */
/* Sektionstrennung übernimmt die unterstrichene Überschrift (print-h2) –
   die frühere Bottom-Hairline pro Block entfällt (sonst Doppellinien). */
.print-block {
  margin-bottom: 13px;
}
.print-page--details .print-block:last-child {
  margin-bottom: 0;
}

/* Dokument-Kopf: Titel + Datum in einer Zeile, Disclaimer klein darunter */
.print-head {
  margin-bottom: 12px;
}
.print-head__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
}
.print-doc-title {
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ink);
}
.print-date {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 9.5px;
  color: var(--muted);
  letter-spacing: 0.04em;
  white-space: nowrap;
}
.print-disclaimer {
  font-size: 10.5px;
  color: var(--muted);
  line-height: 1.4;
  margin-top: 4px;
  max-width: 78ch;
}

/* Block-Überschrift – bewusst prominent (Nutzer-Feedback 2026-07-17: Sektionen
   auf Seite 2 waren schwer zu überfliegen): dezenter vollflächiger Balken als
   Gliederungsband (print-color-adjust: exact stellt den Druck sicher; kein
   Links-Akzent-Streifen). */
.print-h2 {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 8px;
  padding: 4px 8px;
  background: var(--surface-2);
  border-radius: 2px;
}
/* Leichte Variante für Mini-Sektionen (1–2 Zeilen Inhalt) */
.print-h2--light {
  font-size: 9.5px;
  font-weight: 600;
  color: var(--ink-soft);
  padding: 3px 8px;
  margin-bottom: 4px;
}
/* ── Urteilskarte (Cockpit-Anmutung, print-flach: Hairlines statt Flächen) ── */
.print-verdict-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  border: 1px solid var(--line-strong);
  border-radius: 4px;
  margin-bottom: 12px;
}
.pv-verdict {
  padding: 14px 16px;
}
.pv-score {
  padding: 14px 16px;
  border-left: 1px solid var(--line);
}
.pv-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  border: 1px solid var(--ink);
  border-radius: 999px;
  padding: 3px 10px;
  color: var(--ink);
}
.pv-status__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: 0 0 auto;
}
.pv-headline {
  margin-top: 9px;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: var(--ink);
  text-wrap: balance;
}
.pv-headline .accent {
  color: var(--accent);
}
.pv-rec {
  margin-top: 7px;
  font-size: 12px;
  line-height: 1.45;
  color: var(--ink-soft);
  max-width: 58ch;
}
.pv-eyebrow {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--subtle);
  margin-bottom: 6px;
}
.pv-score__head {
  display: flex;
  align-items: baseline;
  gap: 7px;
}
.pv-score__num {
  font-size: 36px;
  font-weight: 700;
  line-height: 0.9;
  letter-spacing: -0.03em;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}
.pv-score__den {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 500;
  color: var(--muted);
}
/* Meter: Ink-Rahmen + Ink-Marker (Border, druckt auch ohne Hintergründe);
   die Severity-Füllung ist Zusatzkodierung, das Statuswort trägt die Aussage. */
.pv-bar {
  position: relative;
  height: 14px;
  margin: 10px 0 4px;
  border: 1px solid var(--ink);
  border-radius: 2px;
  overflow: visible;
}
.pv-bar__fill {
  position: absolute;
  inset: 0 auto 0 0;
  max-width: 100%;
}
.pv-bar.fill-safe .pv-bar__fill { background: var(--safe); }
.pv-bar.fill-warn .pv-bar__fill { background: var(--warn); }
.pv-bar.fill-crit .pv-bar__fill { background: var(--crit); }
.pv-bar__marker {
  position: absolute;
  top: -3px;
  bottom: -3px;
  width: 0;
  border-left: 2.5px solid var(--ink);
  transform: translateX(-50%);
}
.pv-bar__ends {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: var(--subtle);
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 8px;
  letter-spacing: 0.06em;
}
.pv-lines {
  display: flex;
  flex-direction: column;
}
.pv-line {
  display: grid;
  grid-template-columns: 74px 1fr;
  gap: 8px;
  align-items: baseline;
  padding: 5px 0;
  border-top: 1px solid var(--line);
}
.pv-line__k {
  color: var(--subtle);
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 8.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.pv-line__v {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10.5px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.pv-line__note {
  font-style: normal;
  font-weight: 500;
  color: var(--subtle);
  font-size: 8.5px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-left: 6px;
}

/* Hinweis-Einzeiler (normative Bildwirkung) + Prüffragen-Label */
.print-note-line {
  font-size: 10.5px;
  color: var(--ink-soft);
  line-height: 1.4;
  margin-top: 3px;
}
.pn-label {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--subtle);
  margin-right: 8px;
}

/* ── Dimensionen (statusgetrieben, Mini-Gauge) ── */
.print-dims {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid var(--line-strong);
  border-radius: 4px;
}
.print-dim {
  padding: 9px 12px;
  border-right: 1px solid var(--line);
}
.print-dim:last-child {
  border-right: none;
}
.pd-name {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 9.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 600;
}
.pd-desc {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 8.5px;
  color: var(--subtle);
  line-height: 1.35;
  margin-top: 2px;
}
.pd-row {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin: 6px 0 5px;
}
.pd-score {
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}
.pd-den {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 9px;
  color: var(--muted);
}
.pd-word {
  margin-left: auto;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 9.5px;
  font-weight: 600;
}
.pd-gauge {
  position: relative;
  height: 5px;
  border: 1px solid var(--line-strong);
  border-radius: 3px;
  overflow: hidden;
}
.pd-gauge__fill {
  position: absolute;
  inset: 0 auto 0 0;
  max-width: 100%;
}

/* ── Geprüfte Angaben (Bild mit Marker-Overlay + KV) ── */
.print-input-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px 20px;
  align-items: start;
}
/* Shrink-wrap-Wrapper = exakte Bildfläche (kein object-fit-Beschnitt) →
   %-Boxen des Overlays sind geometrisch korrekt, auch bei Querformat. */
.print-img-wrap {
  position: relative;
  display: inline-block;
  border: 1px solid var(--line);
}
.print-img-wrap img {
  display: block;
  max-width: 240px;
  max-height: 300px;
  width: auto;
  height: auto;
}
.print-spot-box {
  position: absolute;
  border: 1.5px solid var(--ink);
  border-radius: 1px;
}
.print-spot-box__id {
  position: absolute;
  top: -1.5px;
  left: -1.5px;
  padding: 0 3px;
  background: var(--ink);
  color: #ffffff;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1.5;
}
.print-img-missing {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}
.print-figure-caption {
  margin-top: 4px;
  max-width: 240px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 8px;
  letter-spacing: 0.03em;
  line-height: 1.4;
  color: var(--subtle);
}
.print-kv {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 5px 14px;
  font-size: 11.5px;
  line-height: 1.4;
  align-content: start;
}
.print-kv dt {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 500;
}
.print-kv dd {
  color: var(--ink);
  overflow-wrap: anywhere;
  hyphens: auto;
}
.print-kv-note {
  display: block;
  margin-top: 2px;
  font-size: 10px;
  color: var(--muted);
  line-height: 1.4;
}
.print-ctx-warn {
  display: block;
  margin-top: 2px;
  font-size: 10.5px;
  color: var(--warn-ink);
  line-height: 1.4;
}

/* ── Textzeilen & Chips ── */
.print-line {
  font-size: 12px;
  color: var(--ink);
  line-height: 1.45;
}
.print-sub {
  font-size: 11px;
  color: var(--muted);
  line-height: 1.45;
  margin-top: 3px;
}
.print-caption {
  margin-top: 6px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 8.5px;
  letter-spacing: 0.03em;
  color: var(--subtle);
}
.print-caption--tight {
  margin-top: 2px;
}
.print-sub--first {
  margin-top: 0;
  color: var(--ink);
}
.print-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 7px;
}

/* ── Konsolidierter Befundblock ── */
.print-findings {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
/* Hairline zwischen den Karten, damit die Befunde nicht ineinanderfliessen. */
.print-finding + .print-finding {
  border-top: 1px solid var(--line-soft);
  padding-top: 7px;
}
.pf-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.pf-sev {
  flex: 0 0 auto;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 1px 6px;
  border-radius: 2px;
}
.pf-tag {
  flex: 0 0 auto;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.pf-text {
  font-size: 12px;
  color: var(--ink);
  line-height: 1.45;
}
.pf-question {
  margin: 3px 0 0 14px;
  font-size: 10.5px;
  color: var(--ink-soft);
  line-height: 1.4;
}
.pf-evidence {
  list-style: none;
  margin: 4px 0 0;
  padding: 0 0 0 14px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.pf-evidence--tight {
  margin-top: 6px;
}
.pf-spot {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 7px;
  align-items: baseline;
}
.pf-spot__id {
  min-width: 20px;
  padding: 0 4px;
  border: 1px solid var(--line-strong);
  border-radius: 2px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 8.5px;
  font-weight: 600;
  color: var(--ink-soft);
  text-align: center;
}
.pf-spot__body {
  font-size: 11px;
  color: var(--ink-soft);
  line-height: 1.45;
}
.pf-spot__meta {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 8px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--subtle);
  margin-left: 5px;
}
.pf-concrete {
  font-size: 11px;
  color: var(--ink-soft);
  line-height: 1.45;
  list-style: disc;
  margin-left: 14px;
}

/* ── Maskierung & Bildwirkung ── */
.print-subblock + .print-subblock {
  margin-top: 8px;
  padding-top: 7px;
  border-top: 1px solid var(--line-soft);
}
.print-sublabel {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-soft);
  margin-bottom: 3px;
}

/* ── Bias-Achsen ── */
.print-axis {
  margin-top: 5px;
}
.print-axis__head {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--ink);
  line-height: 1.4;
}

/* ── Prüffragen-Restliste (ohne zugeordneten Befund) ── */
.print-extra-questions {
  margin-top: 7px;
  padding-top: 6px;
  border-top: 1px solid var(--line-soft);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pc-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.pc-q {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--ink);
  line-height: 1.4;
}

/* Severity-Farben (doppelt kodiert: Farbe + Wort) */
.ink-safe { color: var(--safe-ink); }
.ink-warn { color: var(--warn-ink); }
.ink-crit { color: var(--crit-ink); }
.bg-safe { background: var(--safe); }
.bg-warn { background: var(--warn); }
.bg-crit { background: var(--crit); }
.pf-sev.sev-safe { background: var(--safe); color: var(--surface); }
.pf-sev.sev-warn { background: var(--warn); color: var(--ink); }
.pf-sev.sev-crit { background: var(--crit); color: var(--surface); }
.pf-sev.sev-neutral { background: var(--surface-2); color: var(--ink-soft); border: 1px solid var(--line-strong); }
</style>
