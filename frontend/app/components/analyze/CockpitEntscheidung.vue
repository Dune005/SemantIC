<script setup lang="ts">
// CockpitEntscheidung (Etappe 2) – rechte Workbench-Spalte. Zwei Sektionen:
// 02 · Nächster Schritt (Priority-Liste = severity-sortierte Prüf-Hinweise, render-fertig
// vom Root) und 03 · Verortung (MaskingQuadrant compact, neutrale Wert-Labels, Achsen
// „Integrität/Ästhetik hoch", rein räumlich – kein Differenzwert).
import MaskingQuadrant from '~/components/dataviz/MaskingQuadrant.vue'
import { useReportT } from '~/composables/useReportT'

interface PriorityItem {
  label: string
  description: string
}

// Statik in der eingefrorenen Report-Sprache (nicht UI-Locale).
const { rt } = useReportT()

withDefaults(
  defineProps<{
    headline: string
    copy: string
    items: PriorityItem[]
    integrity: number
    aesthetic: number
    // Verdict-bewusster Leertext (z. B. Status gelb/rot ohne einzelnen Befund); sonst Default.
    emptyNote?: string
  }>(),
  { emptyNote: undefined },
)
</script>

<template>
  <aside class="decision is-reveal" :aria-label="rt('report.entscheidung.asideAria')">
    <section class="decision__section">
      <p class="eyebrow">{{ rt('report.entscheidung.nextStep') }}</p>
      <h2 class="decision__headline">{{ headline }}</h2>
      <p class="decision__copy">{{ copy }}</p>
      <ol v-if="items.length" class="priority">
        <li v-for="(it, i) in items" :key="i">
          <span class="priority__no">{{ i + 1 }}</span>
          <span>
            <strong>{{ it.label }}</strong>
            <span>{{ it.description }}</span>
          </span>
        </li>
      </ol>
      <p v-else class="decision__copy decision__empty">{{ emptyNote ?? rt('report.entscheidung.noOpenHints') }}</p>
    </section>

    <section class="decision__section">
      <p class="eyebrow">{{ rt('report.entscheidung.locationEyebrow') }}</p>
      <MaskingQuadrant
        variant="compact"
        neutral-values
        :integrity="integrity"
        :aesthetic="aesthetic"
        :point-label="rt('report.entscheidung.pointLabel')"
        :x-axis-label="rt('report.entscheidung.xAxisLabel')"
        :y-axis-label="rt('report.entscheidung.yAxisLabel')"
      />
      <p class="quad__note">
        {{ rt('report.entscheidung.quadNote') }}
        <small>{{ rt('report.entscheidung.quadNoteSmall') }}</small>
      </p>
    </section>
  </aside>
</template>

<style scoped>
.decision {
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--canvas);
  overflow: hidden;
}
.decision__section {
  padding: 22px;
}
.decision__section + .decision__section {
  border-top: 1px solid var(--line);
}
.eyebrow {
  margin: 0;
  color: var(--subtle);
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
.decision__headline {
  margin: 7px 0 8px;
  font-size: 22px;
  line-height: 1.15;
  letter-spacing: -0.02em;
}
.decision__copy {
  margin: 0;
  color: var(--ink-soft);
  font-size: 13.5px;
}
.decision__empty {
  margin-top: 14px;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 12px;
}
.priority {
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
}
.priority li {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 11px;
  padding: 12px 0;
  border-top: 1px solid var(--line-soft);
}
.priority__no {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border: 1px solid var(--line-strong);
  border-radius: 50%;
  background: var(--surface);
  font-family: var(--mono);
  font-size: 10px;
}
.priority strong {
  display: block;
  margin-bottom: 2px;
  font-size: 13.5px;
  font-weight: 600;
}
.priority li > span:last-child > span {
  color: var(--muted);
  font-size: 12.5px;
  line-height: 1.45;
}
.quad__note {
  margin: 14px auto 0;
  max-width: 300px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.5;
}
.quad__note small {
  display: block;
  margin-top: 6px;
  color: var(--subtle);
  font-family: var(--mono);
  font-size: 9.5px;
}
.is-reveal {
  opacity: 0;
  transform: translateY(10px);
  animation: rise 0.55s cubic-bezier(0.2, 0.7, 0.2, 1) 0.16s forwards;
}
@keyframes rise {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .is-reveal {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
