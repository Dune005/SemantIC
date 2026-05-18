<script setup lang="ts">
import { AccordionContent, type AccordionContentProps, useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

const props = defineProps<AccordionContentProps & { class?: HTMLAttributes['class'] }>()
const forwarded = useForwardProps(props)
</script>

<template>
  <AccordionContent
    v-bind="forwarded"
    class="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
  >
    <div :class="cn('pb-3 pt-0', props.class)">
      <slot />
    </div>
  </AccordionContent>
</template>
