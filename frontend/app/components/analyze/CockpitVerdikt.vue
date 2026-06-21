<script setup lang="ts">
// Cockpit-Hero (Etappe 2) – Verdikt-Block + Integritäts-Panel + 3 Dimensions-Blöcke.
// Port aus dashboard-cockpit-pruefauftrag-v3.html (.brief). Status-getrieben über eine
// einzige --bar-Variable je Severity (kein hartkodiertes Warn/78%); Count-up via useCountUp;
// Füllbalken/Marker über dynamische --fill/left-Variablen. Score-Zahl bleibt neutral; die
// Farbe kommt vom gelieferten Status (Dimensionen) bzw. Gesamtstatus (Integritäts-Balken).
import { computed, toRef } from 'vue'
import type { Severity } from '~/lib/severity'
import type { DimensionStatus } from '~/types/analysis'
import { useCountUp } from '~/composables/useCountUp'

interface HeroDim {
  key: 'physics' | 'semantics' | 'bias'
  name: string
  desc: string
  score: number
  severity: Severity
  word: string
}

const props = defineProps<{
  status: DimensionStatus
  severity: Severity
  statusWord: string
  headline: string
  lead: string
  hedge: string
  metaText: string
  integrity: number
  aesthetic: number
  readingModeLabel: string
  dims: HeroDim[]
}>()

// Balkenbreite/Marker auf 0–100 begrenzen (Schema erlaubt rohe Zahlen). Die
// angezeigte Score-Zahl bleibt der echte Wert – nur die Geometrie wird geclampt.
const clampPct = (n: number) => Math.max(0, Math.min(100, n))

const integrityDisplay = useCountUp(toRef(props, 'integrity'), { duration: 1100, delay: 200 })
// Feste Anzahl (physics/semantics/bias) → stabile Hook-Anzahl.
const dimDisplays = [0, 1, 2].map((i) =>
  useCountUp(
    computed(() => props.dims[i]?.score ?? 0),
    { duration: 900, delay: 400 + i * 100 },
  ),
)
</script>

<template>
  <section class="brief is-reveal" :class="`brief--${severity}`" aria-labelledby="cockpit-verdict-title">
    <div class="brief__top">
      <div class="brief__verdict">
        <span class="status"><span class="status__dot" aria-hidden="true" />{{ statusWord }}</span>
        <h1 id="cockpit-verdict-title">{{ headline }}<span class="point">.</span></h1>
        <p class="brief__lead">{{ lead }}</p>
        <p v-if="hedge" class="brief__hedge">{{ hedge }}</p>
        <p class="brief__meta"><span>{{ metaText }}</span></p>
      </div>
      <div class="brief__score">
        <p class="eyebrow">Integrität</p>
        <div class="score__head">
          <span class="score__num">{{ integrityDisplay }}</span><span class="score__den">/ 100</span>
        </div>
        <div
          class="scorebar"
          role="img"
          :aria-label="`Integrität ${integrity} von 100`"
          :style="{ '--fill': `${clampPct(integrity)}%` }"
        >
          <span class="scorebar__fill" />
          <span class="scorebar__pointer" :style="{ left: `${clampPct(integrity)}%` }" />
          <span class="scorebar__marker" :style="{ left: `${clampPct(integrity)}%` }" />
        </div>
        <div class="scorebar__ends" aria-hidden="true"><span>0</span><span>100</span></div>
        <div class="score__lines">
          <div class="score__line">
            <span class="score__k">Ästhetik</span>
            <span class="score__v">{{ aesthetic }} / 100<em class="score__note">kein Urteil</em></span>
          </div>
          <div class="score__line">
            <span class="score__k">Leseart</span>
            <span class="score__v">{{ readingModeLabel }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="brief__dims" aria-label="Dimensionen auf einen Blick">
      <div v-for="(d, i) in dims" :key="d.key" class="dim-block" :class="`tint-${d.severity}`">
        <p class="dim-block__name">{{ d.name }}</p>
        <p class="dim-block__desc">{{ d.desc }}</p>
        <p class="dim-block__row">
          <span class="dim-block__score">{{ dimDisplays[i]?.value ?? d.score }}</span>
          <span class="dim-block__state" :class="`dim-block__state--${d.severity}`">{{ d.word }}</span>
        </p>
        <div class="dim-bar"><span class="dim-bar__fill" :style="{ '--fill': `${clampPct(d.score)}%` }" /></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Status-Achse: eine --bar/--bar-ink-Variable je Severity steuert Tönung + Balken. */
.brief {
  border: 1px solid var(--line);
  border-radius: var(--r);
  overflow: hidden;
  background: var(--canvas);
}
.brief--safe {
  --bar: var(--safe);
  --bar-ink: var(--safe-ink);
}
.brief--warn {
  --bar: var(--warn);
  --bar-ink: var(--warn-ink);
}
.brief--crit {
  --bar: var(--crit);
  --bar-ink: var(--crit-ink);
}
.brief__top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(400px, 0.86fr);
}
.brief__verdict {
  padding: clamp(28px, 4vw, 52px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: color-mix(in srgb, var(--bar) 12%, transparent);
}
.brief__score {
  border-left: 1px solid var(--line);
  padding: clamp(26px, 3vw, 40px) clamp(26px, 2.8vw, 38px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: color-mix(in srgb, var(--bar) 20%, transparent);
}
.status {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-height: 33px;
  padding: 6px 14px;
  border: 1.5px solid var(--bar);
  border-radius: 4px;
  color: var(--ink);
  background: var(--bar);
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}
.status__dot {
  position: relative;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--ink);
}
.status__dot::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: var(--ink);
  animation: pulse-dot 1.8s cubic-bezier(0.2, 0.7, 0.2, 1) infinite;
}
@keyframes pulse-dot {
  0% {
    transform: scale(1);
    opacity: 0.55;
  }
  70%,
  100% {
    transform: scale(2.6);
    opacity: 0;
  }
}
.brief h1 {
  max-width: 19ch;
  margin: 18px 0 14px;
  font-size: clamp(28px, 3.8vw, 48px);
  line-height: 1.04;
  letter-spacing: -0.035em;
  text-wrap: balance;
}
.brief h1 .point {
  color: var(--bar);
  font-weight: 800;
}
.brief__lead {
  max-width: 62ch;
  margin: 0;
  color: var(--ink-soft);
  font-size: 16px;
  line-height: 1.65;
}
.brief__hedge {
  max-width: 62ch;
  margin: 10px 0 0;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11.5px;
  line-height: 1.55;
  letter-spacing: 0.02em;
}
.brief__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 18px;
  margin: 20px 0 0;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.03em;
}
.eyebrow {
  margin: 0 0 12px;
  color: var(--subtle);
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
.score__head {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.score__num {
  font-size: clamp(52px, 5.6vw, 74px);
  font-weight: 700;
  line-height: 0.85;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
}
.score__den {
  font-family: var(--mono);
  font-size: 18px;
  font-weight: 500;
  color: var(--muted);
}
/* Füllbalken – Tönung aus --bar (Gesamtstatus), Fill/Marker/Pointer aus --fill/left. */
.scorebar {
  position: relative;
  height: 30px;
  margin: 24px 0 7px;
  border: 1px solid var(--ink);
  border-radius: 2px;
  background: color-mix(in srgb, var(--bar) 28%, transparent);
  overflow: hidden;
}
.scorebar::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 2px;
  background: repeating-linear-gradient(90deg, transparent 0 calc(5% - 1px), var(--bar-ink) calc(5% - 1px) 5%);
  opacity: 0;
  animation: barfade-bar 0.5s ease-out 0.15s forwards;
}
.scorebar::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(90deg, transparent 0 calc(25% - 1.5px), var(--ink) calc(25% - 1.5px) 25%);
  opacity: 0;
  animation: barfade 0.5s ease-out 0.25s forwards;
}
@keyframes barfade {
  to {
    opacity: 0.3;
  }
}
@keyframes barfade-bar {
  to {
    opacity: 0.28;
  }
}
.scorebar__fill {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 0;
  background: var(--bar);
  opacity: 0;
  animation: barfill 1.1s cubic-bezier(0.2, 0.7, 0.2, 1) 0.25s forwards;
  z-index: 1;
}
@keyframes barfill {
  to {
    width: var(--fill);
    opacity: 0.42;
  }
}
.scorebar__marker {
  position: absolute;
  top: -3px;
  bottom: -3px;
  width: 3px;
  background: var(--ink);
  transform: translateX(-50%) scaleY(0);
  transform-origin: center;
  z-index: 2;
  animation: barmarker 0.3s ease-out 1.25s forwards;
}
.scorebar__pointer {
  position: absolute;
  top: -11px;
  transform: translateX(-50%) translateY(4px);
  opacity: 0;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 9px solid var(--ink);
  z-index: 3;
  animation: barpointer 0.3s ease-out 1.3s forwards;
}
@keyframes barmarker {
  to {
    transform: translateX(-50%) scaleY(1);
  }
}
@keyframes barpointer {
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}
.scorebar__ends {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  color: var(--subtle);
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.06em;
}
.score__lines {
  display: flex;
  flex-direction: column;
}
.score__line {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 12px;
  align-items: baseline;
  padding: 10px 0;
  border-top: 1px solid var(--line-soft);
}
.score__k {
  color: var(--subtle);
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.score__v {
  font-family: var(--mono);
  font-size: 13.5px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.score__note {
  font-style: normal;
  font-weight: 500;
  color: var(--subtle);
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-left: 7px;
}
/* Dimensions-Blöcke – Tönung/Balken aus dem gelieferten Dimensions-Status (faithful). */
.brief__dims {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: 1px solid var(--line);
}
.dim-block {
  padding: 22px clamp(20px, 2.4vw, 30px);
  border-right: 1px solid var(--line);
}
.dim-block:last-child {
  border-right: 0;
}
.dim-block.tint-safe {
  background: color-mix(in srgb, var(--safe) 8%, transparent);
}
.dim-block.tint-warn {
  background: color-mix(in srgb, var(--warn) 10%, transparent);
}
.dim-block.tint-crit {
  background: color-mix(in srgb, var(--crit) 8%, transparent);
}
.dim-block__name {
  margin: 0;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}
.dim-block__desc {
  margin: 4px 0 0;
  color: var(--subtle);
  font-family: var(--mono);
  font-size: 10px;
  line-height: 1.45;
  letter-spacing: 0.02em;
}
.dim-block__row {
  display: flex;
  align-items: baseline;
  gap: 11px;
  margin: 12px 0 0;
}
.dim-block__score {
  font-size: 34px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
.dim-block__state {
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 600;
}
.dim-block__state--safe {
  color: var(--safe-ink);
}
.dim-block__state--warn {
  color: var(--warn-ink);
}
.dim-block__state--crit {
  color: var(--crit-ink);
}
.dim-bar {
  position: relative;
  height: 4px;
  margin-top: 16px;
  border-radius: 2px;
  background: var(--line-soft);
  overflow: hidden;
}
.dim-bar__fill {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 0;
  animation: dimfill 1s cubic-bezier(0.2, 0.7, 0.2, 1) 0.4s forwards;
}
.dim-block.tint-safe .dim-bar__fill {
  background: var(--safe);
}
.dim-block.tint-warn .dim-bar__fill {
  background: var(--warn);
}
.dim-block.tint-crit .dim-bar__fill {
  background: var(--crit);
}
@keyframes dimfill {
  to {
    width: var(--fill, 0);
  }
}
/* Lade-Reveal */
.is-reveal {
  opacity: 0;
  transform: translateY(10px);
  animation: rise 0.55s cubic-bezier(0.2, 0.7, 0.2, 1) 0.02s forwards;
}
@keyframes rise {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Reduced-Motion: Endzustände sofort, keine Bewegung. */
@media (prefers-reduced-motion: reduce) {
  .is-reveal {
    animation: none;
    opacity: 1;
    transform: none;
  }
  .status__dot::before {
    animation: none;
    opacity: 0;
  }
  .scorebar::before {
    animation: none;
    opacity: 0.28;
  }
  .scorebar::after {
    animation: none;
    opacity: 0.3;
  }
  .scorebar__fill {
    animation: none;
    width: var(--fill);
    opacity: 0.42;
  }
  .scorebar__marker {
    animation: none;
    transform: translateX(-50%) scaleY(1);
  }
  .scorebar__pointer {
    animation: none;
    transform: translateX(-50%);
    opacity: 1;
  }
  .dim-bar__fill {
    animation: none;
    width: var(--fill, 0);
  }
}

/* Responsive: Score-Panel unter den Verdikt-Block, Dims einspaltig. */
@media (max-width: 860px) {
  .brief__top {
    grid-template-columns: 1fr;
  }
  .brief__score {
    border-left: 0;
    border-top: 1px solid var(--line);
  }
}
@media (max-width: 640px) {
  .brief__dims {
    grid-template-columns: 1fr;
  }
  .dim-block {
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }
  .dim-block:last-child {
    border-bottom: 0;
  }
}
</style>
