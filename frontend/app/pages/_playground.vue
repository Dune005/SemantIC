<script setup lang="ts">
// DEV-WERKZEUG (Etappe 1/2): visuelle Kontrolle von Design-System + Komponenten.
// Nicht Teil des Produkts – wird in Etappe 8 entfernt (samt app/dev-fixtures/).
// ui/-Primitives werden NICHT auto-importiert (nuxt.config ignore: ['ui/**']).
import { ref, computed } from 'vue'
import Button from '~/components/ui/Button.vue'
import Card from '~/components/ui/Card.vue'
import Badge from '~/components/ui/Badge.vue'
import Chip from '~/components/ui/Chip.vue'
import ScoreBar from '~/components/ui/ScoreBar.vue'
import TileSelect from '~/components/ui/TileSelect.vue'
import Disclosure from '~/components/ui/Disclosure.vue'
import DimBadge from '~/components/ui/DimBadge.vue'
import HintItem from '~/components/ui/HintItem.vue'
import NoteBlock from '~/components/ui/NoteBlock.vue'
import WaitState from '~/components/analyze/WaitState.vue'
import ErrorCard from '~/components/analyze/ErrorCard.vue'
import BefundKarte from '~/components/analyze/BefundKarte.vue'
import { severityFor, SEVERITY_WORD } from '~/lib/severity'
import type { AnalysisViewModel, ConsolidatedHint } from '~/types/analysis'
import greenFx from '~/dev-fixtures/green.json'
import yellowFx from '~/dev-fixtures/yellow.json'
import redFx from '~/dev-fixtures/red.json'
import nullfallFx from '~/dev-fixtures/nullfall.json'
// Etappe 5: portierte ViewModel-Factory + echte rohe Pipeline-Outputs (Dev-only).
import { buildAnalysisViewModel } from '~/composables/useAnalysisView'
import type { SemanticAnalysisResult } from '@pipeline/analyze'
import rawGreenFx from '~/dev-fixtures/raw/raw-green.json'
import rawYellowFx from '~/dev-fixtures/raw/raw-yellow.json'

// Isolierte Komponenten-Galerie ohne globales Chrome (Header/Footer real auf / + 404).
definePageMeta({ layout: false })

// ── Welle 2a State ───────────────────────────────────────────────────────────
const intent = ref<string | null>('affirmative')
const usage = ref<string | null>(null)
const discOpen = ref(false)
const scores = [88, 64, 28]
const buttonVariants = ['primary', 'secondary', 'ghost', 'danger'] as const
const intentTiles = [
  { value: 'unspecified', label: 'Standard', hint: 'keine besondere Haltung' },
  { value: 'affirmative', label: 'Bestätigend', hint: 'untermalt das Thema' },
  { value: 'critical', label: 'Kritisch', hint: 'ordnet ein / Negativbeispiel' },
  { value: 'illustrative', label: 'Illustrativ', hint: 'neutrales Beispielbild' },
]
const usageTiles = [
  { value: 'header', label: 'Headerbild', hint: 'Aufmacher zu einem Beitrag' },
  { value: 'mood', label: 'Moodbild', hint: 'stimmungsgebend, eher beiläufig' },
  { value: 'symbol', label: 'Symbolbild', hint: 'steht stellvertretend für ein Thema' },
  { value: 'illustration', label: 'Illustration', hint: 'bebildert einen Sachverhalt' },
  { value: 'social', label: 'Social-Post', hint: 'Beitrag für soziale Netzwerke' },
  { value: 'advertising', label: 'Werbe-/Marketingbild', hint: 'bewirbt ein Produkt oder Angebot' },
  { value: 'editorial', label: 'Editorial-Bild', hint: 'redaktioneller Einsatz mit Anspruch' },
]

// ── Welle 2b State ───────────────────────────────────────────────────────────
const demoHint: ConsolidatedHint = {
  topic: 'bias_combined',
  severity: 'high',
  supportLevel: 'cross_group',
  signalGroups: ['gemini_dimension', 'gemini_research'],
  signals: [],
  text: 'Mehrere Bias-Indikatoren erkannt – kritisch lesen.',
  dimension: 'bias',
  concreteFindings: [
    { text: 'Rollenbesetzung folgt einem klassischen Geschlechter-Klischee.', severity: 'severe', dimension: 'bias' },
    { text: 'Körperdarstellung idealisiert und werbetypisch.', severity: 'moderate', dimension: 'bias' },
  ],
}
const lowHint: ConsolidatedHint = {
  topic: 'style_mismatch',
  severity: 'low',
  supportLevel: 'single',
  signalGroups: ['external_aesthetic'],
  signals: [],
  text: 'Der Bildstil wirkt sehr werbe-/magazinhaft – passt das zum redaktionellen Kontext?',
}

// BefundKarte-Fixture-Switcher
const fixtures = {
  green: greenFx as unknown as AnalysisViewModel,
  yellow: yellowFx as unknown as AnalysisViewModel,
  red: redFx as unknown as AnalysisViewModel,
  nullfall: nullfallFx as unknown as AnalysisViewModel,
}
const fixtureKeys = ['green', 'yellow', 'red', 'nullfall'] as const
const activeKey = ref<(typeof fixtureKeys)[number]>('yellow')
const activeVm = computed(() => fixtures[activeKey.value])

// ── Etappe 5 State (View-Model-Port: Roh-Result → buildAnalysisViewModel) ─────
// Echte rohe SemanticAnalysisResult-JSONs aus spike-test/output (Dev-only, mit
// _playground in Etappe 8 entfernt). Beweist den portierten Composable end-to-end:
// Roh → VM → BefundKarte, inkl. integrityScore-Hoist (Hero-Score) und der
// usage_form-abhängigen usageFormNote (gleiche Roh-Daten, einmal ohne / einmal mit
// Verwendungsform 'editorial' = high_bar).
const vmRawGreen = buildAnalysisViewModel(rawGreenFx as unknown as SemanticAnalysisResult)
const vmRawYellow = buildAnalysisViewModel(rawYellowFx as unknown as SemanticAnalysisResult)
const vmRawYellowEditorial = buildAnalysisViewModel(
  rawYellowFx as unknown as SemanticAnalysisResult,
  'editorial',
)

// ── Etappe 3 State (Shared Chrome) ───────────────────────────────────────────
const bpDemo = ref('')
</script>

<template>
  <main class="mx-auto max-w-[var(--container)] px-[var(--gutter)] py-12 text-ink">
    <p class="mono text-xs uppercase tracking-wider text-subtle">Komponenten-Check · Etappe 2</p>
    <h1 class="mt-1 text-[26px] font-bold tracking-tight">Primitives + Komposit</h1>
    <p class="mt-2 text-muted">Welle 2a (Basis) + 2b (Komposit/Feature). Severity doppelt kodiert, kein Links-Streifen.</p>

    <!-- ═══════════ WELLE 2a ═══════════ -->
    <h2 class="mt-12 border-b border-line pb-2 text-[14px] font-bold uppercase tracking-wider text-subtle">Welle 2a — Basis</h2>

    <section class="mt-6">
      <h3 class="text-[18px] font-bold">Button</h3>
      <div class="mt-3 flex flex-wrap items-center gap-3">
        <Button v-for="v in buttonVariants" :key="v" :variant="v">{{ v }}</Button>
        <Button variant="primary" disabled>disabled</Button>
        <Button variant="primary" loading>lädt …</Button>
      </div>
      <div class="mt-3 inline-flex gap-3 rounded bg-ink p-4">
        <Button variant="inverse">inverse</Button>
        <Button variant="inverse" size="sm">inverse · sm</Button>
      </div>
    </section>

    <section class="mt-8">
      <h3 class="text-[18px] font-bold">Card · Badge · Chip</h3>
      <div class="mt-3 grid gap-3 sm:grid-cols-3">
        <Card tone="paper" border="hair"><span class="mono text-xs">paper · hair</span></Card>
        <Card tone="surface" border="strong"><span class="mono text-xs">surface · strong</span></Card>
        <Card tone="sunken" border="none"><span class="mono text-xs">sunken · none</span></Card>
      </div>
      <div class="mt-3 flex flex-wrap items-center gap-3">
        <Badge mode="severity" severity="safe" label="OK" />
        <Badge mode="severity" severity="warn" label="WARN" />
        <Badge mode="severity" severity="crit" label="CRIT" />
        <Badge mode="status" status="green" label="unauffällig" />
        <Badge mode="status" status="yellow" label="auffällig" />
        <Badge mode="status" status="red" label="kritisch" />
        <Badge mode="neutral" label="Demo-Zugang aktiv" />
      </div>
      <div class="mt-3 flex flex-wrap items-center gap-2">
        <Chip code="CL" label="Cinematic Lighting" />
        <Chip code="WCG" label="Warmes Color Grading" />
        <Chip label="Schönheitsideal" />
      </div>
    </section>

    <section class="mt-8">
      <h3 class="text-[18px] font-bold">ScoreBar</h3>
      <div class="mt-4 grid max-w-[520px] gap-7">
        <div v-for="sc in scores" :key="sc">
          <p class="mono mb-1 text-xs text-muted">value {{ sc }} → {{ SEVERITY_WORD[severityFor(sc)] }}</p>
          <ScoreBar :value="sc" :aria-label="`Score ${sc} von 100, ${SEVERITY_WORD[severityFor(sc)]}`" />
        </div>
      </div>
    </section>

    <section class="mt-8 max-w-[640px] space-y-6">
      <h3 class="text-[18px] font-bold">TileSelect · Disclosure</h3>
      <TileSelect v-model="intent" name="intent" label="Haltung" field-help="Welche Funktion hat das Bild?" :options="intentTiles" :columns="2" />
      <TileSelect v-model="usage" name="usageForm" label="Verwendungsform" field-help="Wofür ist das Bild gedacht?" :options="usageTiles" :columns="4" :invalid="usage === null" error-message="Bitte wähle eine Verwendungsform." />
      <Disclosure v-model:open="discOpen" title="Weitere Hinweise" count="3 verborgen">
        <p class="text-sm text-ink-soft">Aufklappbarer Inhalt (reka-ui Collapsible, aria-expanded).</p>
      </Disclosure>
    </section>

    <!-- ═══════════ WELLE 2b ═══════════ -->
    <h2 class="mt-14 border-b border-line pb-2 text-[14px] font-bold uppercase tracking-wider text-subtle">Welle 2b — Komposit / Feature</h2>

    <section class="mt-6">
      <h3 class="text-[18px] font-bold">DimBadge</h3>
      <p class="mono mt-1 text-xs text-muted">inkl. Divergenz-Fall: hoher Score, aber Status auffällig (Maskierung) → Zahl grün, Tag gelb.</p>
      <div class="mt-3 grid max-w-[680px] grid-cols-3 gap-6 rounded border border-line bg-surface p-5">
        <DimBadge label="Physik" desc="Licht · Schatten · Anatomie" :score="82" status="green" />
        <DimBadge label="Semantik" desc="Szenenlogik · Kontext" :score="54" status="yellow" />
        <DimBadge label="Bias" desc="Stereotype · Rollen" :score="28" status="red" />
      </div>
      <div class="mt-3 grid max-w-[240px] grid-cols-1 rounded border border-line bg-surface p-5">
        <DimBadge label="Divergenz" desc="Score 78 / Status auffällig" :score="78" status="yellow" />
      </div>
    </section>

    <section class="mt-8 max-w-[640px]">
      <h3 class="text-[18px] font-bold">HintItem</h3>
      <ul class="mt-3 list-none rounded border border-line bg-surface px-4 py-2">
        <HintItem :hint="demoHint" />
        <HintItem :hint="lowHint" />
      </ul>
    </section>

    <section class="mt-8 max-w-[640px] space-y-3">
      <h3 class="text-[18px] font-bold">NoteBlock</h3>
      <NoteBlock type="intent" content="Empfehlung berücksichtigt deine erklärte kritische Verwendung. Befund selbst bleibt unverändert." />
      <NoteBlock type="usage" content="Für den erklärten Einsatz redaktionell üblich – die Punkte prüfen, ob sie im Beitrag stören." />
      <NoteBlock type="masking" content="Bild propagiert eine idealisierte Norm. Vor Verwendung prüfen, ob das in den Kontext passt.">
        <template #chips>
          <Chip label="Schönheitsideal" />
          <Chip label="Geschlechternorm" />
        </template>
      </NoteBlock>
      <p class="mono text-xs text-muted">content=null → rendert nicht:</p>
      <NoteBlock type="intent" :content="null" />
    </section>

    <section class="mt-8 max-w-[640px]">
      <h3 class="text-[18px] font-bold">WaitState</h3>
      <div class="mt-3 rounded border border-line bg-surface">
        <WaitState />
      </div>
    </section>

    <section class="mt-8 max-w-[640px] space-y-4">
      <h3 class="text-[18px] font-bold">ErrorCard</h3>
      <p class="mono text-xs text-muted">inline (upload_error-Familie):</p>
      <ErrorCard
        kind="too_large"
        title="Bild konnte nicht verarbeitet werden"
        message="Bild ist auch nach Verkleinerung zu gross – bitte ein kleineres Bild verwenden."
        :primary-action="{ label: 'Anderes Bild wählen', event: 'reopen_filepicker' }"
      />
      <p class="mono text-xs text-muted">block · crit (provider_error):</p>
      <ErrorCard
        kind="provider_error"
        title="Analyse fehlgeschlagen"
        message="Die Prüfung konnte nicht abgeschlossen werden. Das liegt nicht an deinem Bild – bitte erneut versuchen."
        details="Pipeline-Fehler (Korrelations-ID 9f3a)"
        :primary-action="{ label: 'Erneut versuchen', event: 'resubmit_same_inputs' }"
        :secondary-action="{ label: 'Neues Bild prüfen', event: 'full_reset' }"
      />
      <p class="mono text-xs text-muted">block · 429 (rate_limited, Bypass-Hinweis):</p>
      <ErrorCard
        kind="rate_limited"
        title="Tageslimit erreicht"
        message="Tageslimit erreicht (3 Analysen / 24 h). Morgen wieder, oder Zugangscode im Footer eingeben."
        :rate-limit="{ remaining: 0, resetsAt: '2026-06-02T09:14:00+02:00' }"
        :primary-action="{ label: 'Zugangscode eingeben', event: 'scroll_to_bypass_field' }"
        :secondary-action="{ label: 'Verstanden', event: 'dismiss' }"
      />
    </section>

    <!-- BEFUNDKARTE -->
    <section class="mt-10">
      <h3 class="text-[18px] font-bold">BefundKarte</h3>
      <p class="mono mt-1 text-xs text-muted">Rendert nur aus AnalysisViewModel. Status aus overallVerdict.status, Hero-Status-Tag deutsch (Defekt #7).</p>
      <div class="mt-3 flex flex-wrap gap-2">
        <Button
          v-for="k in fixtureKeys"
          :key="k"
          :variant="activeKey === k ? 'primary' : 'secondary'"
          size="sm"
          @click="activeKey = k"
        >
          {{ k }}
        </Button>
      </div>
      <div class="mt-4">
        <BefundKarte
          :vm="activeVm"
          sample-id="SEMANTIC · sample_0428"
          :submitted-usage-form="'header'"
        />
      </div>
    </section>

    <!-- ═══════════ ETAPPE 5 — VIEW-MODEL (Roh → VM) ═══════════ -->
    <h2 class="mt-14 border-b border-line pb-2 text-[14px] font-bold uppercase tracking-wider text-subtle">Etappe 5 — View-Model (Roh → VM)</h2>
    <p class="mt-2 text-muted">
      Echte rohe <span class="mono">SemanticAnalysisResult</span>-JSONs aus
      <span class="mono">spike-test/output</span>, durch den portierten
      <span class="mono">buildAnalysisViewModel</span> gefahren → BefundKarte. Beweist den
      Composable-Port end-to-end: <span class="mono">integrityScore</span> top-level (Hero-Score)
      und die <span class="mono">usageFormNote</span> aus echten Daten (gleiche Roh-Daten ohne /
      mit Verwendungsform).
    </p>

    <section class="mt-6 space-y-8">
      <div>
        <p class="mono text-xs text-muted">
          raw-green (zt-glass) · integrityScore = {{ vmRawGreen.integrityScore }} ·
          Status {{ vmRawGreen.overallVerdict.status }}
        </p>
        <div class="mt-3">
          <BefundKarte :vm="vmRawGreen" sample-id="RAW · zt-glass" :submitted-usage-form="null" />
        </div>
      </div>
      <div>
        <p class="mono text-xs text-muted">
          raw-yellow (zt-coffeeshop) · OHNE Verwendungsform · integrityScore =
          {{ vmRawYellow.integrityScore }} ·
          usageFormNote = {{ vmRawYellow.usageFormNote === null ? 'null' : 'gesetzt' }}
        </p>
        <div class="mt-3">
          <BefundKarte :vm="vmRawYellow" sample-id="RAW · zt-coffeeshop" :submitted-usage-form="null" />
        </div>
      </div>
      <div>
        <p class="mono text-xs text-muted">
          raw-yellow (zt-coffeeshop) · MIT Verwendungsform editorial (high_bar) ·
          usageFormNote = {{ vmRawYellowEditorial.usageFormNote === null ? 'null' : 'gesetzt' }}
        </p>
        <div class="mt-3">
          <BefundKarte :vm="vmRawYellowEditorial" sample-id="RAW · zt-coffeeshop" :submitted-usage-form="'editorial'" />
        </div>
      </div>
    </section>

    <!-- ═══════════ ETAPPE 3 — SHARED CHROME ═══════════ -->
    <h2 class="mt-12 border-b border-line pb-2 text-[14px] font-bold uppercase tracking-wider text-subtle">Etappe 3 — Shared Chrome</h2>
    <p class="mt-2 text-muted">
      AppHeader/AppFooter werden real auf <span class="mono">/</span> und einer 404-Route geprüft (Sticky/Full-Width/Responsive).
      Hier nur das BypassCodeField isoliert in allen vier States.
    </p>

    <section class="mt-6">
      <h3 class="text-[18px] font-bold">BypassCodeField</h3>
      <p class="mono mt-1 text-xs text-muted">Reines UI + submit-Event. Status doppelt kodiert (Farbe + Wort). Redeem/HMAC erst Etappe 6.</p>
      <div class="mt-4 grid max-w-[760px] gap-8 md:grid-cols-2">
        <div>
          <p class="mono mb-2 text-xs uppercase tracking-wider text-subtle">idle</p>
          <BypassCodeField v-model="bpDemo" state="idle" />
        </div>
        <div>
          <p class="mono mb-2 text-xs uppercase tracking-wider text-subtle">submitting</p>
          <BypassCodeField model-value="DEMO-2026" state="submitting" />
        </div>
        <div>
          <p class="mono mb-2 text-xs uppercase tracking-wider text-subtle">success</p>
          <BypassCodeField :model-value="''" state="success" />
        </div>
        <div>
          <p class="mono mb-2 text-xs uppercase tracking-wider text-subtle">error</p>
          <BypassCodeField model-value="x" state="error" />
        </div>
      </div>
    </section>
  </main>
</template>
