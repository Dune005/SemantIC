<script setup lang="ts">
// Card / Panel (primitives.md §2) – flacher bordered Container, KEIN Schatten,
// KEIN Links-Akzent-Streifen. Tiefe nur über Flächenwechsel (tone) + Border.
import { computed } from 'vue'
import { cn } from '~/lib/utils'

const props = withDefaults(
  defineProps<{
    tone?: 'paper' | 'surface' | 'sunken'
    border?: 'hair' | 'strong' | 'none'
    padding?: 'none' | 'sm' | 'md' | 'lg'
    as?: string
    class?: string
  }>(),
  { tone: 'surface', border: 'hair', padding: 'md', as: 'section' },
)

const TONE = { paper: 'bg-canvas', surface: 'bg-surface', sunken: 'bg-surface-2' } as const
const BORDER = { hair: 'border border-line', strong: 'border-[1.5px] border-ink', none: '' } as const
const PAD = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-7' } as const

const classes = computed(() =>
  cn('rounded', TONE[props.tone], BORDER[props.border], PAD[props.padding], props.class),
)
</script>

<template>
  <component :is="as" :class="classes">
    <slot name="header" />
    <slot />
    <slot name="footer" />
  </component>
</template>
