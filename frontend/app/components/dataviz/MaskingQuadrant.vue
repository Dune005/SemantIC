<script setup lang="ts">
// MaskingQuadrant (Frontend 1.7, §4) – illustratives Schema „Wo Maskierung entsteht".
// Achsen: waagrecht Integrität (Inhalt), senkrecht Ästhetik (Wirkung). Die Maskierungs-
// Zone ist das schraffierte Dreieck OBERHALB der Diagonale (Ästhetik übersteigt
// Integrität) – nicht die Ecke. Bewusst KEINE Messzahl, nur das Prinzip.
// A11y (Codex): Wrapper role="img" + aria-label, inneres SVG aria-hidden (kein Doppel-
// Announce). Achsentitel + Wert-Labels als HTML-Overlay (SVG-<text> wäre auf 360px zu klein).
// Farben: Zone = --warn-Schraffur (Risiko); Diagonale/Punkt/Gitter NEUTRAL; die warm/kühl-
// Dimensionsfarben erscheinen NUR an den beiden Wert-Labels (Codex: Quadrant sonst zu laut).
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{ aesthetic?: number; integrity?: number; pointLabel?: string }>(),
  { aesthetic: 86, integrity: 64, pointLabel: 'Beispiel' },
)

// Plot 16..304 in einem 320er-viewBox (Padding 16 je Seite).
const PAD = 16
const SPAN = 288
const X = (v: number) => PAD + (Math.max(0, Math.min(100, v)) / 100) * SPAN
const Y = (v: number) => PAD + (1 - Math.max(0, Math.min(100, v)) / 100) * SPAN

const cx = computed(() => X(props.integrity))
const cy = computed(() => Y(props.aesthetic))
// HTML-Overlay-Position des Wert-Labels (relativ zum quadratischen Stage, 0..320 → 0..100 %).
const ptLeft = computed(() => (cx.value / 320) * 100)
const ptTop = computed(() => (cy.value / 320) * 100)

const ariaLabel = computed(
  () =>
    `Schema: waagrecht „wie gut es inhaltlich hält", senkrecht „wie gut es aussieht". ` +
    `Das schraffierte Dreieck oben links ist die Maskierungs-Zone, in der die Ästhetik die ` +
    `Integrität übersteigt. ${props.pointLabel}punkt bei Ästhetik ${props.aesthetic}, ` +
    `Integrität ${props.integrity}.`,
)
</script>

<template>
  <div class="quad">
    <div class="quad__plot">
      <span class="quad__axislbl quad__axislbl--y">Wie gut es aussieht ↑</span>
      <div class="quad__stage" role="img" :aria-label="ariaLabel">
        <svg class="quad__svg" viewBox="0 0 320 320" aria-hidden="true">
          <defs>
            <pattern id="mq-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line class="quad__hatch" x1="0" y1="0" x2="0" y2="8" />
            </pattern>
          </defs>

          <!-- Maskierungs-Zone: Dreieck oberhalb der Diagonale -->
          <polygon class="quad__zone" points="16,304 16,16 304,16" fill="url(#mq-hatch)" />

          <!-- Gitter -->
          <g class="quad__grid">
            <line x1="88" y1="16" x2="88" y2="304" />
            <line x1="160" y1="16" x2="160" y2="304" />
            <line x1="232" y1="16" x2="232" y2="304" />
            <line x1="16" y1="88" x2="304" y2="88" />
            <line x1="16" y1="160" x2="304" y2="160" />
            <line x1="16" y1="232" x2="304" y2="232" />
          </g>

          <!-- Achsen-L -->
          <g class="quad__axis">
            <line x1="16" y1="16" x2="16" y2="304" />
            <line x1="16" y1="304" x2="304" y2="304" />
          </g>

          <!-- Diagonale = Gleichstand Wirkung/Substanz (neutral) -->
          <line class="quad__diag" x1="16" y1="304" x2="304" y2="16" />

          <!-- Führungslinien vom Punkt zu beiden Achsen -->
          <g class="quad__guide">
            <line :x1="cx" :y1="cy" :x2="cx" y2="304" />
            <line x1="16" :y1="cy" :x2="cx" :y2="cy" />
          </g>

          <!-- Beispiel-Punkt (neutral) -->
          <g class="quad__pt">
            <circle class="quad__pt-aura" :cx="cx" :cy="cy" r="9" />
            <circle class="quad__pt-core" :cx="cx" :cy="cy" r="6" />
          </g>
        </svg>

        <!-- HTML-Overlay-Labels (deckungsgleich mit dem SVG) -->
        <span class="quad__zonelbl">Maskierungs-Zone</span>
        <span
          class="quad__valbox"
          :style="{ left: ptLeft + '%', top: ptTop + '%' }"
          aria-hidden="true"
        >
          <span class="quad__valkicker">Beispiel</span>
          <span class="quad__val quad__val--aesth">Ästhetik {{ aesthetic }}</span>
          <span class="quad__val quad__val--integ">Integrität {{ integrity }}</span>
        </span>
      </div>
      <span class="quad__axislbl quad__axislbl--x">Wie gut es inhaltlich hält →</span>
    </div>

    <div class="quad__legend">
      <h3>Oben links liegt die Gefahr</h3>
      <p>
        Sitzt ein Bild weit oben links – viel Wirkung, wenig Substanz –, ist das der
        Nährboden für Maskierung. Je weiter ein Punkt die Diagonale nach oben links
        überschreitet, desto stärker übersteigt die Ästhetik die Integrität.
      </p>
      <ul>
        <li>
          <i class="quad__sw quad__sw--zone" aria-hidden="true" />
          <span><b>Schraffierte Zone</b> – Ästhetik übersteigt Integrität.</span>
        </li>
        <li>
          <i class="quad__sw quad__sw--diag" aria-hidden="true" />
          <span><b>Diagonale</b> – Wirkung gleich Substanz (Gleichstand).</span>
        </li>
        <li>
          <i class="quad__sw quad__sw--pt" aria-hidden="true" />
          <span>
            <b>Beispielpunkt</b> –
            <span class="quad__val--aesth">Ästhetik {{ aesthetic }}</span> /
            <span class="quad__val--integ">Integrität {{ integrity }}</span>.
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.quad {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 36px;
  align-items: center;
  padding: 36px;
  background: var(--canvas);
  border: 1px solid var(--line);
  border-radius: var(--r);
}

/* Achsentitel als Grid-Geschwister AUSSERHALB der Stage: Y-Achse eigene Spalte
   links, X-Achse eigene Zeile unten – klar abgesetzt, robust ohne Overflow. */
.quad__plot {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 10px 12px;
  max-width: 512px;
  margin: 0 auto;
}
.quad__stage {
  grid-column: 2;
  grid-row: 1;
  position: relative;
  aspect-ratio: 1;
  width: 100%;
}
.quad__svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* SVG-Elemente über Klassen + Tokens (kein Hex im Markup). */
.quad__hatch {
  stroke: var(--warn);
  stroke-width: 1;
  opacity: 0.5;
}
.quad__zone {
  opacity: 0.9;
}
.quad__grid line {
  stroke: var(--line-soft);
  stroke-width: 1;
}
.quad__axis line {
  stroke: var(--line-strong);
  stroke-width: 1.5;
}
.quad__diag {
  stroke: var(--line-strong);
  stroke-width: 1.4;
  stroke-dasharray: 5 5;
  opacity: 0.7;
}
.quad__guide line {
  stroke: var(--subtle);
  stroke-width: 1;
  stroke-dasharray: 2 4;
  opacity: 0.5;
}
.quad__pt-aura {
  fill: var(--ink);
  opacity: 0.16;
  animation: mq-pulse 3.2s ease-in-out infinite;
  transform-origin: center;
  transform-box: fill-box;
}
.quad__pt-core {
  fill: var(--ink);
}
@keyframes mq-pulse {
  0%,
  100% {
    opacity: 0.16;
  }
  50% {
    opacity: 0.06;
  }
}

/* Overlay-Labels */
.quad__zonelbl {
  position: absolute;
  top: 9%;
  left: 7%;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--warn-ink);
}
.quad__valbox {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 2px;
  transform: translate(12px, -120%);
  white-space: nowrap;
}
.quad__valkicker {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 9px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--subtle);
}
.quad__val {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  font-weight: 600;
}
.quad__val--aesth {
  color: var(--appeal);
}
.quad__val--integ {
  color: var(--substance);
}
.quad__axislbl {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--subtle);
  white-space: nowrap;
}
.quad__axislbl--x {
  grid-column: 2;
  grid-row: 2;
  text-align: center;
}
.quad__axislbl--y {
  grid-column: 1;
  grid-row: 1;
  align-self: center;
  justify-self: center;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}

/* Legende */
.quad__legend h3 {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 600;
  font-size: 19px;
  letter-spacing: -0.01em;
  margin: 0 0 14px;
  color: var(--ink);
}
.quad__legend p {
  font-size: 14px;
  line-height: 1.55;
  color: var(--muted);
  margin: 0 0 20px;
}
.quad__legend ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.quad__legend li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  font-size: 13px;
  color: var(--muted);
}
.quad__legend li b {
  color: var(--ink);
  font-weight: 500;
}
.quad__sw {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  flex: 0 0 auto;
  margin-top: 3px;
}
.quad__sw--zone {
  background-image: repeating-linear-gradient(
    -45deg,
    var(--warn) 0,
    var(--warn) 1px,
    transparent 1px,
    transparent 6px
  );
  border: 1px solid var(--line);
}
.quad__sw--diag {
  background: var(--line-strong);
  height: 2px;
  border-radius: 0;
  margin-top: 9px;
}
.quad__sw--pt {
  background: var(--ink);
  border-radius: 50%;
}

@media (max-width: 859px) {
  .quad {
    grid-template-columns: 1fr;
    gap: 28px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .quad__pt-aura {
    animation: none;
  }
}
</style>
