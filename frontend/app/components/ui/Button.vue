<script setup lang="ts">
// Button (primitives.md §1) – eckig, bordered, kein Schatten. Varianten + Größen
// via cva; Variante-C-Tokens. Fokusring global aus base.css (--ink).
import { computed } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '~/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded font-sans font-semibold leading-none',
    'cursor-pointer no-underline select-none',
    'transition-[background-color,color,border-color,opacity] duration-[120ms] ease-out',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'aria-disabled:opacity-50 aria-disabled:cursor-not-allowed',
  ],
  {
    variants: {
      variant: {
        // Ink-Fläche, heller Text
        primary: 'bg-ink text-surface border-[1.5px] border-ink hover:bg-ink-soft',
        // Cremegrund + Ink-Border, Hover füllt mit Ink
        secondary: 'bg-canvas text-ink border-[1.5px] border-ink hover:bg-ink hover:text-surface',
        // transparent, nur Text + Hover-Fläche
        ghost: 'bg-transparent text-ink border border-transparent hover:bg-surface-2',
        // nur irreversible Aktionen, sparsam
        danger: 'bg-surface text-crit-ink border-[1.5px] border-crit hover:bg-crit hover:text-surface hover:border-ink',
        // auf dunklem Grund (Landing-Closer): heller Grund + Ink-Text, Hover invertiert
        inverse: 'bg-surface text-ink border-[1.5px] border-surface hover:bg-transparent hover:text-surface',
      },
      size: {
        md: 'min-h-[44px] px-4 py-[10px] text-sm',
        sm: 'min-h-[38px] px-3 py-2 text-[13px]',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
)

type ButtonVariants = VariantProps<typeof buttonVariants>

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariants['variant']
    size?: ButtonVariants['size']
    disabled?: boolean
    loading?: boolean
    type?: 'button' | 'submit'
    as?: 'button' | 'a'
    href?: string
    class?: string
  }>(),
  { variant: 'secondary', size: 'md', disabled: false, loading: false, type: 'button', as: 'button' },
)

// Loading sperrt den Klick, ohne das Label zu entfernen (primitives.md §1 A11y).
const isDisabled = computed(() => props.disabled || props.loading)
const classes = computed(() =>
  cn(buttonVariants({ variant: props.variant, size: props.size }), isDisabled.value && props.as === 'a' && 'pointer-events-none', props.class),
)
</script>

<template>
  <component
    :is="as"
    :class="classes"
    :type="as === 'button' ? type : undefined"
    :href="as === 'a' ? href : undefined"
    :disabled="as === 'button' ? isDisabled : undefined"
    :aria-disabled="isDisabled || undefined"
    :aria-busy="loading || undefined"
  >
    <span
      v-if="loading"
      class="inline-block h-[14px] w-[14px] shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
    <slot name="icon-left" />
    <slot />
    <slot name="icon-right" />
  </component>
</template>
