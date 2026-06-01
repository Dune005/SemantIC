<script setup lang="ts">
// DEV-WERKZEUG (Etappe 1/2): visuelle Kontrolle von Design-System + Komponenten.
// Nicht Teil des Produkts – wird in Etappe 8 entfernt.
// ui/-Primitives werden NICHT auto-importiert (nuxt.config ignore: ['ui/**']).
import { ref } from 'vue'
import Button from '~/components/ui/Button.vue'
import Card from '~/components/ui/Card.vue'
import Badge from '~/components/ui/Badge.vue'
import Chip from '~/components/ui/Chip.vue'
import ScoreBar from '~/components/ui/ScoreBar.vue'
import TileSelect from '~/components/ui/TileSelect.vue'
import Disclosure from '~/components/ui/Disclosure.vue'
import { severityFor, SEVERITY_WORD } from '~/lib/severity'

const intent = ref<string | null>('affirmative')
const usage = ref<string | null>(null)
const discOpen = ref(false)
const scores = [88, 64, 28]

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

const buttonVariants = ['primary', 'secondary', 'ghost', 'danger'] as const
</script>

<template>
  <main class="mx-auto max-w-[var(--container)] px-[var(--gutter)] py-12 text-ink">
    <p class="mono text-xs uppercase tracking-wider text-subtle">Komponenten-Check · Etappe 2 · Welle 2a</p>
    <h1 class="mt-1 text-[26px] font-bold tracking-tight">Primitives</h1>
    <p class="mt-2 text-muted">7 Basis-Komponenten in allen Varianten. Severity doppelt kodiert, kein Links-Streifen.</p>

    <!-- BUTTON -->
    <section class="mt-10">
      <h2 class="text-[20px] font-bold">Button</h2>
      <div class="mt-3 flex flex-wrap items-center gap-3">
        <Button v-for="v in buttonVariants" :key="v" :variant="v">{{ v }}</Button>
      </div>
      <div class="mt-3 flex flex-wrap items-center gap-3">
        <Button v-for="v in buttonVariants" :key="v" :variant="v" size="sm">{{ v }} · sm</Button>
      </div>
      <div class="mt-3 flex flex-wrap items-center gap-3">
        <Button variant="primary" disabled>disabled</Button>
        <Button variant="primary" loading>lädt …</Button>
        <Button variant="secondary" as="a" href="#">as = a</Button>
      </div>
      <!-- inverse braucht dunklen Grund -->
      <div class="mt-3 inline-flex gap-3 rounded bg-ink p-4">
        <Button variant="inverse">inverse</Button>
        <Button variant="inverse" size="sm">inverse · sm</Button>
      </div>
    </section>

    <!-- CARD -->
    <section class="mt-10">
      <h2 class="text-[20px] font-bold">Card / Panel</h2>
      <div class="mt-3 grid gap-3 sm:grid-cols-3">
        <Card tone="paper" border="hair"><span class="mono text-xs">tone paper · hair</span></Card>
        <Card tone="surface" border="strong"><span class="mono text-xs">tone surface · strong</span></Card>
        <Card tone="sunken" border="none"><span class="mono text-xs">tone sunken · none</span></Card>
      </div>
      <Card class="mt-3" border="strong">
        <template #header><p class="mono text-xs uppercase tracking-wider text-subtle">Kicker</p></template>
        <h3 class="mt-1 text-[16px] font-bold">Panel mit Header- und Footer-Slot</h3>
        <template #footer><p class="mt-3 text-sm text-muted">Footer-Bereich</p></template>
      </Card>
    </section>

    <!-- BADGE -->
    <section class="mt-10">
      <h2 class="text-[20px] font-bold">Badge / StatusTag</h2>
      <div class="mt-3 flex flex-wrap items-center gap-3">
        <Badge mode="severity" severity="safe" label="OK" />
        <Badge mode="severity" severity="warn" label="WARN" />
        <Badge mode="severity" severity="crit" label="CRIT" />
      </div>
      <div class="mt-3 flex flex-wrap items-center gap-3">
        <Badge mode="status" status="green" label="unauffällig" />
        <Badge mode="status" status="yellow" label="auffällig" />
        <Badge mode="status" status="red" label="kritisch" />
        <Badge mode="neutral" label="Demo-Zugang aktiv" />
      </div>
      <div class="mt-3 flex flex-wrap items-center gap-3">
        <Badge mode="severity" severity="safe" label="OK" shape="bracket" size="sm" />
        <Badge mode="severity" severity="warn" label="WARN" shape="bracket" size="sm" />
        <Badge mode="severity" severity="crit" label="CRIT" shape="bracket" size="sm" />
      </div>
    </section>

    <!-- CHIP -->
    <section class="mt-10">
      <h2 class="text-[20px] font-bold">Chip</h2>
      <div class="mt-3 flex flex-wrap items-center gap-2">
        <Chip code="CL" label="Cinematic Lighting" />
        <Chip code="WCG" label="Warmes Color Grading" />
        <Chip label="Schönheitsideal" />
        <Chip label="Statussignal" />
      </div>
    </section>

    <!-- SCOREBAR -->
    <section class="mt-10">
      <h2 class="text-[20px] font-bold">ScoreBar</h2>
      <div class="mt-4 grid max-w-[520px] gap-7">
        <div v-for="sc in scores" :key="sc">
          <p class="mono mb-1 text-xs text-muted">
            value {{ sc }} → {{ severityFor(sc) }} · {{ SEVERITY_WORD[severityFor(sc)] }}
          </p>
          <ScoreBar :value="sc" :aria-label="`Integritäts-Score ${sc} von 100, ${SEVERITY_WORD[severityFor(sc)]}`" />
        </div>
        <div>
          <p class="mono mb-1 text-xs text-muted">ohne Skala · height sm</p>
          <ScoreBar :value="56" height="sm" :show-scale="false" aria-label="Score 56 von 100, WARN" />
        </div>
      </div>
    </section>

    <!-- TILESELECT -->
    <section class="mt-10">
      <h2 class="text-[20px] font-bold">TileSelect</h2>
      <div class="mt-3 max-w-[640px] space-y-6">
        <TileSelect
          v-model="intent"
          name="intent"
          label="Haltung"
          field-help="Welche Funktion hat das Bild in deinem Beitrag?"
          :options="intentTiles"
          :columns="2"
        />
        <TileSelect
          v-model="usage"
          name="usageForm"
          label="Verwendungsform"
          field-help="Wofür ist das Bild gedacht? Das bestimmt, wie streng der Massstab der Empfehlung ist."
          :options="usageTiles"
          :columns="4"
          :invalid="usage === null"
          error-message="Bitte wähle eine Verwendungsform."
        />
        <p class="mono text-xs text-muted">intent = {{ intent }} · usageForm = {{ usage }}</p>
      </div>
    </section>

    <!-- DISCLOSURE -->
    <section class="mt-10">
      <h2 class="text-[20px] font-bold">Disclosure</h2>
      <div class="mt-3 max-w-[640px]">
        <Disclosure v-model:open="discOpen" title="Weitere Hinweise" count="3 verborgen">
          <p class="text-sm text-ink-soft">
            Aufklappbarer Inhalt. Der Chevron rotiert bei „open"; aria-expanded liefert reka-ui.
          </p>
        </Disclosure>
        <p class="mono mt-2 text-xs text-muted">open = {{ discOpen }}</p>
      </div>
    </section>
  </main>
</template>
