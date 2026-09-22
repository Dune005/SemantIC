<script setup lang="ts">
// G4 – Bildwahl: ein gestapelter 100-%-Balken (39 % korrektes Bild / 61 % übrige Bilder) mit
// Vergleichsmarke bei 25 % («bei zufälliger Wahl»). Die 61 % heissen bewusst «übrige Bilder»,
// nicht «verzerrt» (darunter sind auch gegen-stereotype Optionen). Labels stehen als
// umbrechender Text unter den Segmenten, die Marke oberhalb – kein Overlap bei 360 px.
import { g4 } from '~/data/studie'

const { t } = useI18n()
const k = 'components.studieCharts.g4'
const aria = computed(() => t(`${k}.aria`, { pct: g4.correctPct, chance: g4.chancePct }))
</script>

<template>
  <StudieFigure :title="$t(`${k}.title`)" :aria="aria" :note="$t(`${k}.note`)">
    <div class="g4">
      <div class="g4__chance" :style="{ left: `${g4.chancePct}%` }">
        <span class="g4__chanceLabel">{{ $t(`${k}.chance`, { pct: g4.chancePct }) }}</span>
      </div>
      <div class="g4__bar">
        <span class="g4__seg g4__seg--correct" :style="{ width: `${g4.correctPct}%` }" />
        <span class="g4__seg g4__seg--other" :style="{ width: `${g4.otherPct}%` }" />
      </div>
      <div class="g4__labels" :style="{ gridTemplateColumns: `${g4.correctPct}fr ${g4.otherPct}fr` }">
        <p class="g4__label">
          <b>{{ g4.correctPct }} %</b>
          <span>{{ $t(`${k}.correct`) }}</span>
        </p>
        <p class="g4__label g4__label--other">
          <b>{{ g4.otherPct }} %</b>
          <span>{{ $t(`${k}.other`) }}</span>
        </p>
      </div>
    </div>
  </StudieFigure>
</template>

<style scoped>
.g4 {
  position: relative;
  padding-top: 30px;
}
.g4__chance {
  position: absolute;
  top: 0;
  height: 30px;
  width: 0;
  border-left: 2px dashed var(--muted);
}
.g4__chanceLabel {
  position: absolute;
  left: 8px;
  top: 0;
  white-space: nowrap;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--muted);
}
.g4__bar {
  display: flex;
  height: 30px;
  border: 1px solid var(--line);
  border-radius: var(--r);
  overflow: hidden;
}
.g4__seg {
  display: block;
  height: 100%;
}
.g4__seg--correct {
  background: var(--study-accent);
}
.g4__seg--other {
  background: var(--surface-2);
}
.g4__labels {
  display: grid;
  gap: 12px;
  margin-top: 10px;
}
.g4__label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-family: var(--mono);
  font-size: 11px;
  line-height: 1.45;
  letter-spacing: 0.04em;
  color: var(--muted);
}
.g4__label b {
  font-family: var(--sans);
  font-weight: 700;
  font-size: 18px;
  letter-spacing: -0.01em;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}
.g4__label--other {
  text-align: right;
  align-items: flex-end;
}
</style>
