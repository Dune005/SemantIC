<script setup lang="ts">
// G5 – 8 von 212 Begründungen: Waffle-Chart mit 212 Quadraten (20 Spalten), 8 in Akzentfarbe.
// Begründungen, nicht Personen; kein «96 % übersahen». Die stärkste Laien-Grafik der Seite.
import { g5 } from '~/data/studie'

const { t } = useI18n()
const k = 'components.studieCharts.g5'
const aria = computed(() => t(`${k}.aria`, { n: g5.withStereotype, total: g5.total }))
</script>

<template>
  <StudieFigure :title="$t(`${k}.title`)" :aria="aria" :note="$t(`${k}.note`)">
    <div class="g5">
      <div class="g5__figure">
        <p class="g5__count">
          <b>{{ g5.withStereotype }}</b>
          <span>{{ $t(`${k}.of`, { total: g5.total }) }}</span>
        </p>
        <p class="g5__legend">
          <span class="g5__swatch g5__swatch--on" aria-hidden="true" />
          {{ $t(`${k}.withStereotype`) }}
        </p>
        <p class="g5__legend">
          <span class="g5__swatch" aria-hidden="true" />
          {{ $t(`${k}.rest`) }}
        </p>
      </div>
      <div class="g5__waffle" :style="{ gridTemplateColumns: `repeat(${g5.columns}, 1fr)` }">
        <span v-for="i in g5.total" :key="i" class="g5__cell" :class="{ 'is-on': i <= g5.withStereotype }" />
      </div>
    </div>
  </StudieFigure>
</template>

<style scoped>
.g5 {
  display: grid;
  grid-template-columns: minmax(0, 200px) minmax(0, 1fr);
  gap: 28px;
  align-items: start;
}
.g5__count {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}
.g5__count b {
  font-family: var(--sans);
  font-weight: 700;
  font-size: clamp(44px, 7vw, 60px);
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--study-accent);
  font-variant-numeric: tabular-nums;
}
.g5__count span {
  font-family: var(--sans);
  font-weight: 600;
  font-size: 18px;
  color: var(--ink);
}
.g5__legend {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 10px;
  font-family: var(--mono);
  font-size: 11px;
  line-height: 1.45;
  letter-spacing: 0.04em;
  color: var(--muted);
}
.g5__swatch {
  flex: 0 0 auto;
  width: 10px;
  height: 10px;
  margin-top: 3px;
  border-radius: 2px;
  background: var(--line);
}
.g5__swatch--on {
  background: var(--study-accent);
}
.g5__waffle {
  display: grid;
  gap: 3px;
}
.g5__cell {
  aspect-ratio: 1;
  border-radius: 2px;
  background: var(--line);
}
.g5__cell.is-on {
  background: var(--study-accent);
}

@media (max-width: 599px) {
  .g5 {
    grid-template-columns: 1fr;
    gap: 18px;
  }
}
</style>
