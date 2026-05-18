<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Separator } from 'reka-ui'
import { cn } from '~/lib/utils'

const props = defineProps<{
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <Separator
    :orientation="props.orientation ?? 'horizontal'"
    :decorative="props.decorative ?? true"
    :class="cn(
      'shrink-0 bg-border',
      (props.orientation ?? 'horizontal') === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
      props.class,
    )"
  />
</template>
