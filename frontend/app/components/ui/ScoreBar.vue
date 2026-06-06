<script setup lang="ts">
// ScoreBar (primitives.md §5 / design-system §3) – horizontaler 0–100-Balken.
// Zwei Varianten:
//  - 'bands' (Default): HARTE Segmente CRIT/WARN/OK (40fr/30fr/30fr) + Schwellen-Skala.
//    Unveraendert – wird von ReportPrintView (Druck) genutzt.
//  - 'meter' (Frontend 1.1, Etappe 2): Track gleichmaessig in der Urteilsfarbe (tone)
//    getoent, Praezisions-Ticks, Caret-Nadel mit Strich (Strich NUR im Balken). KEINE
//    Banding-Skala. Die Faerbung kommt vom Urteil (tone), NICHT von der Score-Position;
//    Zahl + Marker bleiben neutral (--ink). Score = Position, Urteil = Farbe (Variante B).
// Wert kommt als Zahl vom Aufrufer; Doppelkodierung via ariaLabel (Wort).
import { computed, onMounted, ref } from 'vue'
import type { Severity } from '~/lib/severity'

const props = withDefaults(
  defineProps<{
    value: number
    showScale?: boolean
    height?: 'sm' | 'md'
    ariaLabel: string
    animate?: boolean
    variant?: 'bands' | 'meter'
    tone?: Severity
  }>(),
  { showScale: true, height: 'md', animate: true, variant: 'bands' },
)

const clamped = computed(() => Math.max(0, Math.min(100, Math.round(props.value))))

// Marker-Einlauf NUR im meter-Modus (Frontend 1.1): startet bei 0, gleitet beim Mount auf die
// Score-Position (CSS-Transition). Ohne Animation oder bei prefers-reduced-motion sofort am Ziel.
// Der bands-Pfad (Druck/ReportPrintView) bleibt unverändert: Marker direkt auf clamped, keine rAF.
const entered = ref(false)
onMounted(() => {
  if (props.variant !== 'meter') return
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  if (reduce) entered.value = true
  else requestAnimationFrame(() => { entered.value = true })
})
const markerLeft = computed(() => {
  if (props.variant !== 'meter') return clamped.value
  return !props.animate || entered.value ? clamped.value : 0
})
</script>

<template>
  <div
    class="scorebar-wrap"
    :class="[
      height === 'sm' ? 'is-sm' : 'is-md',
      { 'no-anim': !animate },
      variant === 'meter' ? 'is-meter' : '',
      variant === 'meter' && tone ? `tone-${tone}` : '',
    ]"
  >
    <div class="scorebar-track" role="img" :aria-label="ariaLabel">
      <template v-if="variant === 'bands'">
        <span class="seg crit" />
        <span class="seg warn" />
        <span class="seg ok" />
      </template>
      <span v-else class="ticks" aria-hidden="true" />
    </div>
    <span class="marker" :style="{ left: markerLeft + '%' }" aria-hidden="true" />
    <div v-if="showScale && variant === 'bands'" class="scorebar-scale" aria-hidden="true">
      <span class="t1">0 <b>CRIT</b></span>
      <span class="t2">40 <b>WARN</b></span>
      <span class="t3">70 <b>OK</b></span>
      <span class="t4">100</span>
    </div>
    <template v-else-if="variant === 'meter'">
      <span class="endcap lo" aria-hidden="true">0</span>
      <span class="endcap hi" aria-hidden="true">100</span>
    </template>
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

/* ── Meter-Variante (Frontend 1.1): getoenter Track + Ticks + Caret-Nadel ── */
.is-meter {
  margin-top: 22px; /* Luft fuer die Caret-Nadel oben */
}
.is-meter .scorebar-track {
  position: relative;
  display: block;
  grid-template-columns: none;
  background: var(--surface-2);
  overflow: hidden;
}
/* Track-Toenung = Urteil (gleichmaessig, NICHT Position) */
.is-meter.tone-safe .scorebar-track {
  background: rgba(44, 140, 102, 0.16);
}
.is-meter.tone-warn .scorebar-track {
  background: rgba(200, 146, 31, 0.18);
}
.is-meter.tone-crit .scorebar-track {
  background: rgba(205, 66, 57, 0.16);
}
/* Praezisions-Ticks: minor alle 5, major bei 0/25/50/75/100 */
.is-meter .ticks {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: repeating-linear-gradient(to right, var(--line-strong) 0 1px, transparent 1px 5%);
  opacity: 0.55;
}
.is-meter .ticks::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(to right, var(--ink) 0 1.5px, transparent 1.5px 25%);
  opacity: 0.4;
}
/* Marker: dicker Strich NUR im Balken + Caret-Nadel oben mit Luft (beides --ink) */
.is-meter .marker {
  top: 0;
  height: 22px;
  transition: left 340ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.is-meter .marker::before {
  content: '';
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 11px solid var(--ink);
}
.is-meter .endcap {
  position: absolute;
  top: 26px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--subtle);
}
.is-meter .endcap.lo {
  left: 0;
}
.is-meter .endcap.hi {
  right: 0;
}

/* gilt fuer beide Varianten – nach den Varianten definiert, damit es gewinnt */
.no-anim .marker {
  transition: none;
}
@media (prefers-reduced-motion: reduce) {
  .marker {
    transition: none;
  }
}
</style>
