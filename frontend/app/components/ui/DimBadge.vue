<script setup lang="ts">
// DimBadge (primitives.md §11) – eine Dimensions-Zelle des Dim-Strips. Frontend 1.1
// (Variante B): die Score-Zahl ist NEUTRAL (Messwert, --ink), das deutsche Urteilswort
// kommt farbig aus dem Pipeline-Status (STATUS_TO_SEVERITY → *-ink). Doppelkodierung
// Farbe + Wort. Kein separates OK/WARN/CRIT-Kuerzel-Tag mehr (war redundant).
// Die Zell-Toenung steuert der Parent (BefundKarte) je dim.status.
import { computed } from 'vue'
import { STATUS_TO_SEVERITY, STATUS_WORD } from '~/lib/severity'
import { useReportT } from '~/composables/useReportT'
import type { DimensionStatus } from '~/types/analysis'

const props = defineProps<{
  label: string
  score: number
  status: DimensionStatus
  desc?: string
}>()

// Urteilswort in der eingefrorenen Report-Sprache (STATUS_WORD ist DE/EN-Map).
const { reportLang } = useReportT()

const VERDICT_INK = { safe: 'text-safe-ink', warn: 'text-warn-ink', crit: 'text-crit-ink' } as const
const verdictInk = computed(() => VERDICT_INK[STATUS_TO_SEVERITY[props.status]])
</script>

<template>
  <div>
    <div class="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{{ label }}</div>
    <div v-if="desc" class="mt-[3px] font-mono text-[10px] leading-snug tracking-[0.04em] text-subtle">{{ desc }}</div>
    <div class="mt-[10px] flex items-baseline gap-3">
      <span class="text-[34px] font-bold leading-none tracking-[-0.02em] text-ink">{{ score }}</span>
      <span class="text-[13px] font-semibold tracking-[0.01em]" :class="verdictInk">{{ STATUS_WORD[status][reportLang] }}</span>
    </div>
  </div>
</template>
