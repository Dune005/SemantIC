<script setup lang="ts">
// ScoreBar (primitives.md §5 / design-system §3) – horizontaler 0–100-Balken mit
// HARTEN Segmenten CRIT/WARN/OK (40fr/30fr/30fr), 1px --ink-Trennlinien, vertikalem
// --ink-Marker. KEIN Gradient. Wert kommt als Zahl vom Aufrufer; die ScoreBar
// trifft keine Score-Quell-Entscheidung. Doppelkodierung via ariaLabel (Wort).
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value: number
    showScale?: boolean
    height?: 'sm' | 'md'
    ariaLabel: string
    animate?: boolean
  }>(),
  { showScale: true, height: 'md', animate: true },
)

const clamped = computed(() => Math.max(0, Math.min(100, Math.round(props.value))))
</script>

<template>
  <div class="scorebar-wrap" :class="[height === 'sm' ? 'is-sm' : 'is-md', { 'no-anim': !animate }]">
    <div class="scorebar-track" role="img" :aria-label="ariaLabel">
      <span class="seg crit" />
      <span class="seg warn" />
      <span class="seg ok" />
    </div>
    <span class="marker" :style="{ left: clamped + '%' }" aria-hidden="true" />
    <div v-if="showScale" class="scorebar-scale" aria-hidden="true">
      <span class="t1">0 <b>CRIT</b></span>
      <span class="t2">40 <b>WARN</b></span>
      <span class="t3">70 <b>OK</b></span>
      <span class="t4">100</span>
    </div>
  </div>
</template>

<style scoped>
.scorebar-wrap {
  position: relative;
}
.scorebar-track {
  display: grid;
  grid-template-columns: 40fr 30fr 30fr;
  border: 1.5px solid var(--ink);
  height: 22px;
  background: var(--canvas);
  border-radius: 2px;
  overflow: hidden;
}
.is-sm .scorebar-track {
  height: 16px;
}
.scorebar-track .seg {
  border-right: 1px solid var(--ink);
}
.scorebar-track .seg:last-child {
  border-right: none;
}
.scorebar-track .seg.crit {
  background: var(--crit);
}
.scorebar-track .seg.warn {
  background: var(--warn);
}
.scorebar-track .seg.ok {
  background: var(--safe);
}
/* Marker als Geschwister der Track: ragt oben/unten ~7px über (Spec), wird aber
   NICHT vom overflow:hidden der Track (saubere Segment-Ecken) geclippt. */
.marker {
  position: absolute;
  top: -7px;
  width: 3px;
  height: 36px;
  background: var(--ink);
  z-index: 3;
  transform: translateX(-50%);
  transition: left 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.is-sm .marker {
  top: -7px;
  height: 30px;
}
.no-anim .marker {
  transition: none;
}
.scorebar-scale {
  position: relative;
  margin-top: 8px;
  height: 14px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.scorebar-scale span {
  position: absolute;
  white-space: nowrap;
}
.scorebar-scale .t1 {
  left: 0;
}
.scorebar-scale .t2 {
  left: 40%;
  transform: translateX(-50%);
}
.scorebar-scale .t3 {
  left: 70%;
  transform: translateX(-50%);
}
.scorebar-scale .t4 {
  right: 0;
}
.scorebar-scale b {
  margin-left: 4px;
  font-weight: 700;
}
.scorebar-scale .t1 b {
  color: var(--crit-ink);
}
.scorebar-scale .t2 b {
  color: var(--warn-ink);
}
.scorebar-scale .t3 b {
  color: var(--safe-ink);
}
</style>
