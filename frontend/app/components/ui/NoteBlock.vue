<script setup lang="ts">
// NoteBlock (primitives.md §6.5/§11) – dezenter „Hinweis"-Block für die drei
// kuratierten Notes. `content: string | null` → bei null NICHT rendern. Mono-Kicker
// „Hinweis" + type-spezifischer Suffix. surface-2 + Haarlinie, KEIN Links-Streifen.
// Du-Ansprache, „Hinweis statt Nachweis"-Ton. Verändert NIE Status/Badges.
// `flat` (Frontend 1.1): ohne Box (kein Rahmen/Hintergrund/horizontale Polsterung) –
// flacher Hinweis-Absatz fuer die entschachtelte Empfehlung. Default = Box (Druck/Report).
import { useReportT } from '~/composables/useReportT'

defineProps<{
  content: string | null
  type?: 'intent' | 'masking' | 'usage'
  flat?: boolean
}>()

// Kicker/Suffix in der eingefrorenen Report-Sprache (report.noteBlock.*).
const { rt } = useReportT()
</script>

<template>
  <div v-if="content" :class="flat ? 'py-[13px]' : 'rounded border border-line bg-surface-2 px-4 py-[13px]'">
    <div class="mb-[5px] flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
      <span class="text-ink-soft">{{ rt('report.noteBlock.label') }}</span>
      <span v-if="type">· {{ rt(`report.noteBlock.${type}`) }}</span>
    </div>
    <p class="text-[14px] leading-relaxed text-ink-soft">{{ content }}</p>
    <div v-if="$slots.chips" class="mt-[9px] flex flex-wrap gap-[6px]">
      <slot name="chips" />
    </div>
  </div>
</template>
