<script setup lang="ts">
// G2 – Glaubwürdigkeit fehlerhaft vs. fehlerfrei: Dot-Plot auf der Skala 1–7 mit zwei
// beschrifteten Zeilen (fehlerfreie Bilder 5.2 / Bilder mit Fehler 4.3), Zahlenachse 1–7
// darunter und einer gestrichelten, beschrifteten Linie bei 4 («Mitte der Skala»). Beide
// Punkte liegen rechts der Mitte – das ist die Pointe. Keine Fehlerbalken, keine p-Werte.
// Reines HTML/CSS; bei 360 px rutscht die Zeilenbeschriftung über die Skala.
import { g2 } from '~/data/studie'

const { t } = useI18n()
const k = 'components.studieCharts.g2'
const span = g2.scaleMax - g2.scaleMin
const pct = (v: number) => `${((v - g2.scaleMin) / span) * 100}%`
const ticks = Array.from({ length: span + 1 }, (_, i) => g2.scaleMin + i)
const rows = [
  { id: 'coherent', value: g2.coherent.value, label: g2.coherent.label },
  { id: 'incoherent', value: g2.incoherent.value, label: g2.incoherent.label },
] as const
const aria = computed(() => t(`${k}.aria`, { coh: g2.coherent.label, inc: g2.incoherent.label }))
</script>

<template>
  <StudieFigure :title="$t(`${k}.title`)" :aria="aria" :note="$t(`${k}.note`)">
    <div class="g2">
      <!-- Kopfzeile: Beschriftung der Mittellinie, zentriert über 4 -->
      <div class="g2__head">
        <span class="g2__midLabel" :style="{ left: pct(g2.scaleMid) }">{{ $t(`${k}.mid`) }}</span>
      </div>

      <!-- Desktop: EINE durchgehende Mittellinie über beide Zeilen (endet vor der Achse).
           Mobil: je ein kurzes Segment pro Skala, damit die Zeilenbeschriftung frei bleibt. -->
      <div class="g2__rows">
        <span class="g2__midLine" />
        <div v-for="row in rows" :key="row.id" class="g2__row">
          <span class="g2__rowLabel">{{ $t(`${k}.${row.id}`) }}</span>
          <div class="g2__track">
            <span class="g2__mid" :style="{ left: pct(g2.scaleMid) }" />
            <span class="g2__dot" :style="{ left: pct(row.value) }">
              <b class="g2__value">{{ row.label }}</b>
            </span>
          </div>
        </div>
      </div>

      <!-- Zahlenachse 1–7 -->
      <div class="g2__row g2__row--axis">
        <span class="g2__rowLabel" aria-hidden="true" />
        <div class="g2__axis">
          <span v-for="tick in ticks" :key="tick" class="g2__tick" :style="{ left: pct(tick) }">{{ tick }}</span>
        </div>
      </div>
      <div class="g2__row g2__row--ends">
        <span class="g2__rowLabel" aria-hidden="true" />
        <div class="g2__ends">
          <span>{{ $t(`${k}.min`) }}</span>
          <span class="g2__endsMax">{{ $t(`${k}.max`) }}</span>
        </div>
      </div>
    </div>
  </StudieFigure>
</template>

<style scoped>
.g2 {
  --label-w: 150px;
  --dot: 18px;
}
.g2__row {
  display: grid;
  grid-template-columns: var(--label-w) minmax(0, 1fr);
  gap: 14px;
  align-items: center;
}
.g2__row + .g2__row {
  margin-top: 14px;
}
.g2__rowLabel {
  font-size: 14px;
  line-height: 1.35;
  color: var(--ink);
}
.g2__head {
  position: relative;
  height: 20px;
  margin-left: calc(var(--label-w) + 14px);
}
.g2__midLabel {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  white-space: nowrap;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--muted);
}

/* Skalenzeile: Linie + Punkt mit Wert */
.g2__track {
  position: relative;
  height: 30px;
}
.g2__track::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 2px;
  margin-top: -1px;
  background: var(--line-strong);
}
.g2__rows {
  position: relative;
}
/* Durchgehende Mittellinie: von der ersten bis zur zweiten Skala, endet vor der Achse.
   Position = Mitte der Skala (4 von 1–7 = 50 % der Skalenbreite rechts der Label-Spalte). */
.g2__midLine {
  position: absolute;
  top: 6px;
  bottom: 6px;
  left: calc(var(--label-w) + 14px + (100% - var(--label-w) - 14px) * 0.5);
  width: 0;
  border-left: 2px dashed var(--muted);
}
.g2__mid {
  display: none;
  position: absolute;
  top: 2px;
  bottom: 2px;
  width: 0;
  border-left: 2px dashed var(--muted);
}
.g2__dot {
  position: absolute;
  top: 50%;
  width: var(--dot);
  height: var(--dot);
  margin: calc(var(--dot) / -2) 0 0 calc(var(--dot) / -2);
  border-radius: 50%;
  background: var(--study-accent);
  border: 2px solid var(--canvas);
  box-sizing: border-box;
}
.g2__value {
  position: absolute;
  left: calc(var(--dot) + 2px);
  top: 50%;
  transform: translateY(-50%);
  /* Hintergrund-Maske: die Skalenlinie läuft nicht durch die Zahl. */
  padding: 2px 5px;
  background: var(--canvas);
  border-radius: 3px;
  font-family: var(--sans);
  font-weight: 700;
  font-size: 18px;
  line-height: 1;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

/* Zahlenachse */
.g2__row--axis {
  margin-top: 4px;
}
.g2__axis {
  position: relative;
  height: 22px;
}
.g2__tick {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  padding-top: 8px;
  font-family: var(--mono);
  font-size: 11px;
  color: var(--muted);
}
.g2__tick::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 1px;
  height: 5px;
  background: var(--line-strong);
}
.g2__row--ends {
  margin-top: 2px;
}
.g2__ends {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-family: var(--mono);
  font-size: 11px;
  line-height: 1.45;
  letter-spacing: 0.04em;
  color: var(--muted);
}
.g2__endsMax {
  text-align: right;
}

/* Mobil: Zeilenbeschriftung über die Skala, alles bündig */
@media (max-width: 599px) {
  .g2 {
    --label-w: 0px;
  }
  .g2__row {
    grid-template-columns: minmax(0, 1fr);
    gap: 4px;
  }
  .g2__row + .g2__row {
    margin-top: 12px;
  }
  .g2__row--axis .g2__rowLabel,
  .g2__row--ends .g2__rowLabel {
    display: none;
  }
  .g2__head {
    margin-left: 0;
  }
  /* Mittellinie nur innerhalb der Skala – nicht durch die darüberliegende Zeilenbeschriftung. */
  .g2__midLine {
    display: none;
  }
  .g2__mid {
    display: block;
  }
  .g2__track {
    /* Platz für den Wert rechts vom Punkt bei 5.2 (69 %) */
    margin-right: 28px;
  }
  .g2__axis,
  .g2__ends,
  .g2__head {
    margin-right: 28px;
  }
}
</style>
