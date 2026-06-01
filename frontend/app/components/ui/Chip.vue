<script setup lang="ts">
// Chip (primitives.md §11) – Tag für visualDrivers / normativeMasking.aspects.
// Mono, Ink-Border, KEINE Severity-Farbe (deskriptiv, kein Befund).
import { cn } from '~/lib/utils'

withDefaults(defineProps<{ label: string; code?: string; class?: string }>(), {})
</script>

<template>
  <span
    :class="cn(
      'inline-flex items-baseline gap-[5px] rounded-chip border border-line-strong bg-surface px-2 py-[3px] font-mono text-[11px] tracking-[0.04em] text-ink-soft',
      $props.class,
    )"
  >
    <span v-if="code" class="text-[10px] font-semibold tracking-[0.1em] text-muted">{{ code }}</span>
    {{ label }}
  </span>
</template>
