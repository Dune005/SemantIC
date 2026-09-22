<script setup lang="ts">
// G3 – Entdeckte Fehler: zwei Reihen aus Personen-Pictogrammen («X von Y Personen»):
// Café-Schriftzug 25 von 33, Armbanduhr 4 von 22. Nur Begründende, nicht auf 55
// hochrechnen, keine «% der Teilnehmenden». Reihen dürfen bei 360 px umbrechen.
import { g3 } from '~/data/studie'

const { t } = useI18n()
const k = 'components.studieCharts.g3'
const rows = [
  { id: 'coffeeshop', ...g3.coffeeshop },
  { id: 'ceo', ...g3.ceo },
] as const
const aria = computed(() =>
  t(`${k}.aria`, {
    a: g3.coffeeshop.named,
    aTotal: g3.coffeeshop.total,
    b: g3.ceo.named,
    bTotal: g3.ceo.total,
  }),
)
</script>

<template>
  <StudieFigure :title="$t(`${k}.title`)" :aria="aria" :note="$t(`${k}.note`)">
    <div class="g3">
      <div v-for="row in rows" :key="row.id" class="g3__row">
        <p class="g3__label">
          <b>{{ $t(`${k}.of`, { named: row.named, total: row.total }) }}</b>
          <span class="g3__what">{{ $t(`${k}.${row.id}`) }}</span>
        </p>
        <div class="g3__people">
          <span v-for="i in row.total" :key="i" class="g3__person" :class="{ 'is-on': i <= row.named }" />
        </div>
      </div>
    </div>
  </StudieFigure>
</template>

<style scoped>
.g3 {
  display: grid;
  gap: 26px;
}
.g3__label {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 12px;
  font-size: 14px;
  line-height: 1.45;
  color: var(--ink-soft);
}
.g3__label b {
  font-family: var(--sans);
  font-weight: 700;
  font-size: 18px;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}
.g3__people {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 5px;
  margin-top: 10px;
}
/* Personen-Pictogramm: Kopf (::before) + Rumpf (::after). */
.g3__person {
  position: relative;
  width: 13px;
  height: 20px;
  --p: var(--line);
}
.g3__person.is-on {
  --p: var(--study-accent);
}
.g3__person::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 7px;
  height: 7px;
  margin-left: -3.5px;
  border-radius: 50%;
  background: var(--p);
}
.g3__person::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 13px;
  height: 11px;
  border-radius: 6px 6px 2px 2px;
  background: var(--p);
}
</style>
