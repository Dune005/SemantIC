<script setup lang="ts">
// InfoPopover (shadcn-Etappe) – kleiner Begriffs-Erklärer via reka-ui HoverCard (die
// shadcn-vue-Basis). Erscheint beim Hovern UND beim Tastatur-Fokus des Triggers, verschwindet
// beim Weghovern/Blur (reka steuert Delays + die Safe-Area zwischen Trigger und Panel).
// Variante-C-Stil: heller Panel, kräftiger Rahmen, kein Schatten. Panel wird per Portal in den
// <body> gerendert → Styles unscoped (Haus-Muster wie LangSwitcher), eindeutiger
// .info-popover-Präfix gegen Kollisionen. Inhalt: statische Microcopy via text-Prop oder Slot.
import { HoverCardRoot, HoverCardTrigger, HoverCardPortal, HoverCardContent } from 'reka-ui'
import { Info } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    label: string
    text?: string
    side?: 'top' | 'right' | 'bottom' | 'left'
    align?: 'start' | 'center' | 'end'
    sideOffset?: number
  }>(),
  { side: 'bottom', align: 'start', sideOffset: 8 },
)
</script>

<template>
  <HoverCardRoot :open-delay="150" :close-delay="120">
    <HoverCardTrigger as-child>
      <button class="info-popover__trigger" type="button" :aria-label="label">
        <Info :size="14" aria-hidden="true" />
      </button>
    </HoverCardTrigger>
    <HoverCardPortal>
      <HoverCardContent
        class="info-popover__panel"
        :side="side"
        :align="align"
        :side-offset="sideOffset"
        :collision-padding="12"
      >
        <p v-if="text" class="info-popover__text">{{ text }}</p>
        <slot v-else />
      </HoverCardContent>
    </HoverCardPortal>
  </HoverCardRoot>
</template>

<style scoped>
.info-popover__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* >=24px Hitbox (WCAG 2.5.8 Target Size); das Info-Icon bleibt klein (14px). */
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: var(--r);
  background: transparent;
  color: var(--subtle);
  cursor: pointer;
  transition: color 0.12s ease-out;
}
.info-popover__trigger:hover,
.info-popover__trigger[data-state='open'] {
  color: var(--ink);
}
.info-popover__trigger:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
}
</style>

<!-- Unscoped: PopoverContent wird per Portal in den <body> gerendert, scoped Styles greifen
     dort nicht (Haus-Muster wie LangSwitcher). Kein Schatten – flaches Laborjournal. -->
<style>
.info-popover__panel {
  max-width: 260px;
  padding: 12px 14px;
  background: var(--surface);
  border: 1px solid var(--line-strong);
  border-radius: var(--r);
  z-index: 60;
}
.info-popover__text {
  margin: 0;
  font-family: var(--sans);
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--ink);
}
.info-popover__panel[data-state='open'] {
  animation: info-popover-fade 0.12s ease-out;
}
/* Nur Opacity (richtungsunabhängig – funktioniert für jedes side). */
@keyframes info-popover-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .info-popover__panel {
    animation: none;
  }
}
</style>
