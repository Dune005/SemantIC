<script setup lang="ts">
// Badge / StatusTag (primitives.md §4) – Severity IMMER über Farbe UND Wort
// (Doppelkodierung Pflicht). Zwei Modi: aus Score (severity) oder aus Status
// (green/yellow/red → STATUS_TO_SEVERITY). `label` ist das Wort, nie weglassen.
// Props als discriminated union: severity bzw. status ist je nach mode Pflicht
// (TS-erzwungen) – kein stiller Fallback (Codex-Review Welle 2a).
import { computed } from 'vue'
import { cn } from '~/lib/utils'
import { STATUS_TO_SEVERITY, type Severity } from '~/lib/severity'
import type { DimensionStatus } from '~/types/analysis'

type BadgeBase = {
  label: string
  size?: 'sm' | 'md'
  shape?: 'tag' | 'bracket'
  class?: string
}
type BadgeProps = BadgeBase &
  (
    | { mode: 'severity'; severity: Severity; status?: never }
    | { mode: 'status'; status: DimensionStatus; severity?: never }
    | { mode: 'neutral'; severity?: never; status?: never }
  )

const props = defineProps<BadgeProps>()

// Render-Farbe: severity direkt, status gemappt (NIE aus Score gerechnet), neutral fix.
const resolved = computed<Severity | 'neutral'>(() => {
  if (props.mode === 'severity') return props.severity
  if (props.mode === 'status') return STATUS_TO_SEVERITY[props.status]
  return 'neutral'
})

// Farb-Mapping (design-system.md §4): safe/crit tragen --surface-Text, warn --ink.
// 'neutral' folgt dem real gebauten .demo-badge (analyze-input.html: surface-2 +
// line-strong) – bewusste Abweichung von primitives.md §4 ("Ink-Border"): die
// CSS-Realität der abgenommenen Seite ist hier dezenter und wird gespiegelt.
const COLOR = {
  safe: 'bg-safe text-surface border-ink',
  warn: 'bg-warn text-ink border-ink',
  crit: 'bg-crit text-surface border-ink',
  neutral: 'bg-surface-2 text-ink-soft border-line-strong',
} as const

const SIZE = {
  sm: 'text-[10px] tracking-[0.12em] px-[7px] py-[3px] rounded-tag',
  md: 'text-[11px] tracking-[0.16em] px-[10px] py-[5px] rounded-chip',
} as const

const size = computed(() => props.size ?? 'md')
const shape = computed(() => props.shape ?? 'tag')

const classes = computed(() =>
  cn(
    'inline-flex items-center gap-[6px] font-mono font-semibold uppercase leading-none whitespace-nowrap border',
    COLOR[resolved.value],
    SIZE[size.value],
    props.class,
  ),
)

const text = computed(() => (shape.value === 'bracket' ? `[ ${props.label} ]` : props.label))
</script>

<template>
  <span :class="classes">{{ text }}</span>
</template>
