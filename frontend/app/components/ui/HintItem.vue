<script setup lang="ts">
// HintItem (primitives.md §11) – Befund-Einzeiler (Topic-Text) + optional
// aufklappbare concreteFindings (max 2). Severity doppelt kodiert (Farbe + Wort).
// KEIN v-html – hint.text/findings sind einfache Interpolation.
import { computed } from 'vue'
import { HINT_SEVERITY_LABEL, DIMENSION_LABELS } from '~/lib/severity'
import type { ConsolidatedHint } from '~/types/analysis'

// F5 (Frontend 1.5): Der frühere `concise`-Modus unterdrückte die concreteFindings
// komplett – damit waren die Evidenz-Sätze (die am besten validierte Stärke des Tools)
// in der UI unerreichbar. Jetzt sind sie immer als ZUGEKLAPPTES <details> dabei:
// einen Klick entfernt, ohne die Karte zu füllen.
const props = defineProps<{ hint: ConsolidatedHint }>()

// Severity-Farbe (Prototyp .hint-sev): high=crit, medium=warn, low=neutral (surface-2).
const SEV = {
  high: 'bg-crit text-surface',
  medium: 'bg-warn text-ink',
  low: 'border border-line-strong bg-surface-2 text-ink-soft',
} as const

const dimLabel = computed(() => (props.hint.dimension ? DIMENSION_LABELS[props.hint.dimension] : null))
const findings = computed(() => (props.hint.concreteFindings ?? []).slice(0, 2))
</script>

<template>
  <li class="border-t border-line-soft py-[13px] first:border-t-0 first:pt-0">
    <div class="flex items-baseline gap-[11px]">
      <span
        class="shrink-0 rounded-tag px-[7px] py-[3px] font-mono text-[10px] font-semibold uppercase leading-tight tracking-[0.12em]"
        :class="SEV[hint.severity]"
      >
        {{ HINT_SEVERITY_LABEL[hint.severity] }}
      </span>
      <div class="flex-1">
        <span class="text-[14px] leading-normal text-ink">{{ hint.text }}</span>
        <span v-if="dimLabel" class="ml-2 font-mono text-[10px] uppercase tracking-[0.08em] text-subtle">{{ dimLabel }}</span>
        <details v-if="findings.length" class="hint-details mt-2">
          <summary>Details</summary>
          <ul class="mt-2 flex flex-col gap-[7px]">
            <li
              v-for="(f, i) in findings"
              :key="i"
              class="concrete-item relative pl-[18px] text-[13px] leading-normal text-ink-soft"
              :data-sev="f.severity"
            >
              {{ f.text }}
              <span class="ml-[6px] font-mono text-[10px] uppercase tracking-[0.08em] text-subtle">
                {{ f.severity === 'severe' ? 'schwer' : f.severity === 'moderate' ? 'moderat' : 'gering' }}
              </span>
            </li>
          </ul>
        </details>
      </div>
    </div>
  </li>
</template>

<style scoped>
.hint-details > summary {
  list-style: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 0;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  color: var(--muted);
}
.hint-details > summary::-webkit-details-marker {
  display: none;
}
.hint-details > summary::before {
  content: '+';
  font-weight: 600;
}
.hint-details[open] > summary::before {
  content: '–';
}
.hint-details > summary:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
  border-radius: 2px;
}
.concrete-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 7px;
  width: 7px;
  height: 7px;
  border: 1px solid var(--ink-soft);
}
.concrete-item[data-sev='severe']::before {
  background: var(--crit);
  border-color: var(--crit);
}
.concrete-item[data-sev='moderate']::before {
  background: var(--warn);
  border-color: var(--warn);
}
.concrete-item[data-sev='minor']::before {
  background: var(--surface-2);
  border-color: var(--ink-soft);
}
</style>
