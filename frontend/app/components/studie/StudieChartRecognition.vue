<script setup lang="ts">
// G1 – KI-Erkennung: ein grosser Wert «48 %» mit Balken, der knapp die Hälfte füllt; Rest
// hellgrau («als echt eingestuft oder unsicher» – die Antwort war dreistufig, deshalb NICHT
// «für echt gehalten»). Darunter sechs Bild-Pictogramme. Keine «Zufall 50 %»-Linie.
import { g1 } from '~/data/studie'

const { t } = useI18n()
const k = 'components.studieCharts.g1'
const aria = computed(() => t(`${k}.aria`, { pct: g1.recognisedPct }))
</script>

<template>
  <StudieFigure :title="$t(`${k}.title`)" :aria="aria" :note="$t(`${k}.note`)">
    <div class="g1">
      <p class="g1__value">
        <span class="g1__num">{{ g1.recognisedPct }} %</span>
      </p>
      <div class="g1__bar">
        <span class="g1__fill" :style="{ width: `${g1.recognisedPct}%` }" />
      </div>
      <div class="g1__labels" :style="{ gridTemplateColumns: `${g1.recognisedPct}fr ${100 - g1.recognisedPct}fr` }">
        <span class="g1__label g1__label--hit">{{ $t(`${k}.hit`) }}</span>
        <span class="g1__label g1__label--rest">{{ $t(`${k}.rest`) }}</span>
      </div>
      <div class="g1__images">
        <span v-for="i in g1.imageCount" :key="i" class="g1__img" />
        <span class="g1__imgLabel">{{ $t(`${k}.images`, { n: g1.imageCount }) }}</span>
      </div>
    </div>
  </StudieFigure>
</template>

<style scoped>
.g1__value {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}
.g1__num {
  font-family: var(--sans);
  font-weight: 700;
  font-size: clamp(40px, 7vw, 56px);
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--study-accent);
  font-variant-numeric: tabular-nums;
}
.g1__bar {
  position: relative;
  height: 22px;
  margin-top: 14px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: var(--r);
  overflow: hidden;
}
.g1__fill {
  display: block;
  height: 100%;
  background: var(--study-accent);
}
.g1__labels {
  display: grid;
  gap: 12px;
  margin-top: 8px;
}
.g1__label {
  font-family: var(--mono);
  font-size: 11px;
  line-height: 1.45;
  letter-spacing: 0.04em;
  color: var(--muted);
}
.g1__label--hit {
  color: var(--ink);
}
.g1__label--rest {
  text-align: right;
}
.g1__images {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 26px;
}
.g1__img {
  width: 34px;
  aspect-ratio: 4 / 3;
  border: 1px solid var(--line-strong);
  border-radius: 2px;
  background: var(--surface);
  /* Innenrahmen wie ein Abzug – ruhiges Foto-Piktogramm ohne Grafik-Spielerei. */
  box-shadow: inset 0 0 0 3px var(--surface), inset 0 0 0 4px var(--line);
}
.g1__imgLabel {
  margin-left: 6px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--muted);
}
</style>
