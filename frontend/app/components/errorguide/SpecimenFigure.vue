<script setup lang="ts">
// SpecimenFigure (umsetzung-1.10) – der reine Bild-Frame eines Beispiels: grosses Foto +
// SVG-Marker-Overlay (0–1000 normiert) + nummerierte Pin-Buttons. Bewusst ZUSTANDSLOS und
// KONTROLLIERT: welcher Marker aktiv/gemutet ist und ob Marker überhaupt sichtbar sind, gibt
// der Aufrufer (ErrorSpecimen) über Props vor. So existiert die knifflige AR-/Overlay-Logik
// genau einmal.
//
// Die aspect-ratio kommt aus den Bilddaten (width/height), nicht aus @load – deshalb sitzt
// das Overlay sofort deckungsgleich (kein Marker-Flash, kein Layout-Sprung).
import type { ErrorSpecimen } from '~/data/error-guide'

const props = withDefaults(
  defineProps<{
    specimen: ErrorSpecimen
    /** Hervorgehobener Marker; null = alle Marker gleichwertig sichtbar (kein Muting). */
    highlightIndex?: number | null
    /** aria-pressed-Quelle (angepinnter Marker). Fällt auf highlightIndex zurück. */
    pressedIndex?: number | null
    /** false = Overlay + Pins ausgeblendet (Eindruck-Zustand vor dem ersten Befund). */
    markersVisible?: boolean
    /** true = erstes Tour-Bild eager laden (leeren Sticky-Frame vermeiden). */
    eager?: boolean
    /** true = Pin ist ein Toggle (statisches ErrorSpecimen) → aria-pressed. false = Pin
     *  navigiert nur zu einem Schritt (Tour) → kein aria-pressed (kein Toggle-Zustand). */
    pressable?: boolean
  }>(),
  { highlightIndex: null, pressedIndex: undefined, markersVisible: true, eager: false, pressable: true },
)

const emit = defineEmits<{ select: [i: number]; hover: [i: number | null] }>()

const pressed = computed(() => (props.pressedIndex === undefined ? props.highlightIndex : props.pressedIndex))

// Nummern-Pin an der oberen linken Box-Ecke; Prozent → auflösungsunabhängig, geclampt an den Rand.
function pinStyle(box: readonly number[]) {
  const left = Math.min(Math.max((box[1] ?? 0) / 10, 3), 95)
  const top = Math.min(Math.max((box[0] ?? 0) / 10, 4), 94)
  return { left: `${left}%`, top: `${top}%` }
}
</script>

<template>
  <div class="sfig" :class="{ 'is-blank': !markersVisible }">
    <div class="sfig__frame" :style="{ aspectRatio: `${specimen.width} / ${specimen.height}` }">
      <img
        :src="specimen.image"
        :alt="specimen.alt"
        :width="specimen.width"
        :height="specimen.height"
        :loading="eager ? 'eager' : 'lazy'"
        decoding="async"
      />

      <!-- Rein visuelle Boxen (aria-hidden); Interaktion läuft über die Pins. -->
      <svg class="sfig__overlay" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
        <g
          v-for="(spot, i) in specimen.spots"
          :key="`box-${i}`"
          class="mark"
          :class="{ 'is-active': highlightIndex === i, 'is-muted': highlightIndex !== null && highlightIndex !== i }"
        >
          <rect
            class="mark__halo"
            :x="spot.box[1]"
            :y="spot.box[0]"
            :width="spot.box[3] - spot.box[1]"
            :height="spot.box[2] - spot.box[0]"
          />
          <rect
            class="mark__box"
            :x="spot.box[1]"
            :y="spot.box[0]"
            :width="spot.box[3] - spot.box[1]"
            :height="spot.box[2] - spot.box[0]"
          />
        </g>
      </svg>

      <div class="sfig__pins">
        <button
          v-for="(spot, i) in specimen.spots"
          :key="`pin-${i}`"
          type="button"
          class="sfig__pin"
          :class="{ 'is-active': highlightIndex === i }"
          :style="pinStyle(spot.box)"
          :aria-pressed="pressable ? pressed === i : undefined"
          :aria-label="`Markierung ${i + 1}: ${spot.title}`"
          @mouseenter="emit('hover', i)"
          @mouseleave="emit('hover', null)"
          @focus="emit('hover', i)"
          @blur="emit('hover', null)"
          @click="emit('select', i)"
        >
          {{ i + 1 }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sfig__frame {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--surface-2);
}
.sfig__frame img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  /* Container-AR = echte Bild-AR (aus width/height) → contain füllt deckungsgleich mit dem
     SVG, kein Crop, kein Letterbox. Boxen sitzen damit korrekt (0–1000 normiert). */
  object-fit: contain;
}

/* Eindruck-Zustand: Overlay + Pins ausgeblendet, aber im DOM (kann faden). visibility
   nimmt die Pins zusätzlich aus der Tab-Reihenfolge. */
.sfig__overlay,
.sfig__pins {
  transition: opacity 0.3s ease-out;
}
.sfig.is-blank .sfig__overlay,
.sfig.is-blank .sfig__pins {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease-out, visibility 0s 0.3s;
}

.sfig__overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}
.mark {
  transition: opacity 0.16s ease-out;
}
.mark.is-muted {
  opacity: 0.32;
}
/* Dunkles Halo für Lesbarkeit über jeder Bildpartie + durchgezogener --warn-Rahmen
   (Befund belegt, nicht LLM-behauptet – anders als das gestrichelte Analyze-Overlay). */
.mark__halo {
  fill: none;
  stroke: color-mix(in srgb, var(--ink) 72%, transparent);
  stroke-width: 7;
  vector-effect: non-scaling-stroke;
}
.mark__box {
  fill: color-mix(in srgb, var(--warn) 10%, transparent);
  stroke: var(--warn);
  stroke-width: 3;
  vector-effect: non-scaling-stroke;
}
.mark.is-active .mark__box {
  stroke-width: 5;
  fill: color-mix(in srgb, var(--warn) 16%, transparent);
}

.sfig__pins {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
}
.sfig__pin {
  position: absolute;
  transform: translate(-50%, -50%);
  min-width: 26px;
  height: 26px;
  padding: 0 6px;
  display: grid;
  place-items: center;
  border: 2px solid var(--surface);
  border-radius: 13px;
  background: var(--warn);
  color: var(--ink);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  pointer-events: auto;
  transition: transform 0.12s ease-out;
}
.sfig__pin:hover,
.sfig__pin:focus-visible,
.sfig__pin.is-active {
  transform: translate(-50%, -50%) scale(1.15);
}
.sfig__pin:focus-visible {
  outline: 2px solid var(--surface);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--ink) 90%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .sfig__overlay,
  .sfig__pins,
  .mark,
  .sfig__pin {
    transition: none;
  }
  .sfig.is-blank .sfig__overlay,
  .sfig.is-blank .sfig__pins {
    transition: none;
  }
  .sfig__pin:hover,
  .sfig__pin:focus-visible,
  .sfig__pin.is-active {
    transform: translate(-50%, -50%);
  }
}
</style>
