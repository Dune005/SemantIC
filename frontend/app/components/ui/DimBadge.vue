<script setup lang="ts">
// DimBadge (primitives.md §11) – eine Dimensions-Zelle des Dim-Strips. Doppelt
// kodiert. WICHTIG (contract.md Z.78–79): Score-Zahl-Farbe via severityFor(score)
// (Score-Achse), Stat-Tag-Wort + Farbe via status (STATUS_TO_SEVERITY, aus Pipeline).
// Beide getrennt – sie können divergieren (Maskierungs-Edge-Case): Status gewinnt
// fürs Wort, Score fürs Zahl-/Bar-Segment.
import { computed } from 'vue'
import Badge from '~/components/ui/Badge.vue'
import { severityFor, SEVERITY_WORD, STATUS_TO_SEVERITY, STATUS_WORD } from '~/lib/severity'
import type { DimensionStatus } from '~/types/analysis'

const props = defineProps<{
  label: string
  score: number
  status: DimensionStatus
  desc?: string
}>()

const SCORE_INK = { safe: 'text-safe-ink', warn: 'text-warn-ink', crit: 'text-crit-ink' } as const
const scoreInk = computed(() => SCORE_INK[severityFor(props.score)])
// Stat-Tag zeigt OK/WARN/CRIT (Score-Achse-Wort), Farbe aber aus STATUS.
const statWord = computed(() => SEVERITY_WORD[STATUS_TO_SEVERITY[props.status]])
</script>

<template>
  <div>
    <div class="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{{ label }}</div>
    <div v-if="desc" class="mt-[3px] font-mono text-[10px] leading-snug tracking-[0.04em] text-subtle">{{ desc }}</div>
    <div class="mt-[10px] flex items-baseline gap-3">
      <span class="text-[34px] font-bold leading-none tracking-[-0.02em]" :class="scoreInk">{{ score }}</span>
      <Badge mode="status" :status="status" :label="statWord" shape="bracket" size="sm" />
    </div>
    <div class="mt-2 text-[12px] text-muted">{{ STATUS_WORD[status] }}</div>
  </div>
</template>
