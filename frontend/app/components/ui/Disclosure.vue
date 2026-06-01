<script setup lang="ts">
// Disclosure (primitives.md §11) – aufklappbarer Abschnitt via reka-ui Collapsible
// (Trigger setzt aria-expanded + data-state automatisch). Chevron rotiert bei open;
// reduced-motion-konform (base.css killt Transitions → Endzustand sofort).
import { CollapsibleRoot, CollapsibleTrigger, CollapsibleContent } from 'reka-ui'
import { ChevronRight } from 'lucide-vue-next'
import { cn } from '~/lib/utils'

const props = withDefaults(
  defineProps<{
    title: string
    open?: boolean
    count?: string
    class?: string
  }>(),
  { open: false },
)

const emit = defineEmits<{ 'update:open': [value: boolean] }>()
</script>

<template>
  <CollapsibleRoot
    :open="open"
    :class="cn('border-t border-line', props.class)"
    @update:open="emit('update:open', $event)"
  >
    <CollapsibleTrigger
      class="group flex w-full items-center justify-between gap-3 py-4 font-mono text-[12px] font-semibold tracking-[0.06em] text-ink-soft"
    >
      <span class="flex items-center gap-2">
        {{ title }}
        <span v-if="count" class="text-[11px] font-medium text-muted">{{ count }}</span>
      </span>
      <ChevronRight
        class="h-4 w-4 shrink-0 text-muted transition-transform duration-150 group-data-[state=open]:rotate-90"
        aria-hidden="true"
      />
    </CollapsibleTrigger>
    <CollapsibleContent role="region" :aria-label="title">
      <div class="pb-5">
        <slot />
      </div>
    </CollapsibleContent>
  </CollapsibleRoot>
</template>
