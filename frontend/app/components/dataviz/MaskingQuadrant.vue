<script setup lang="ts">
// MaskingQuadrant (Frontend 1.7, §4) – illustratives Schema „Wo Maskierung entsteht".
// Achsen: waagrecht Integrität (Inhalt), senkrecht Ästhetik (Wirkung). Die Maskierungs-
// Zone ist das schraffierte Dreieck OBERHALB der Diagonale (Ästhetik übersteigt
// Integrität) – nicht die Ecke. Bewusst KEINE Messzahl, nur das Prinzip.
// A11y (Codex): Wrapper role="img" + aria-label, inneres SVG aria-hidden (kein Doppel-
// Announce). Achsentitel jetzt IM SVG (vorlagentreu, overflow: visible); Wert-Labels als
// HTML-Overlay. Farben: Zone = --warn-Schraffur/Verlauf (Risiko); Diagonale/Punkt/Gitter
// NEUTRAL; warm/kühl-Dimensionsfarben NUR an den beiden Wert-Labels (Quadrant sonst zu laut).
import { computed, useId } from 'vue'

// variant 'full' (how-it-works: Stage + Legende) vs. 'compact' (Report: nur Stage +
// Achsen + Punkt + Wert-Labels, ohne Erklaer-Legende). Default 'full' -> bestehende
// how-it-works-Nutzung bleibt unveraendert.
const props = withDefaults(
  defineProps<{
    aesthetic?: number
    integrity?: number
    pointLabel?: string
    variant?: 'full' | 'compact'
    // Achsentitel konfigurierbar (Defaults = how-it-works-Wortlaut, unverändert).
    // Das Cockpit übergibt die neutralen „Integrität hoch →" / „Ästhetik hoch →".
    xAxisLabel?: string
    yAxisLabel?: string
    // Produkt-UI (Report/Cockpit): Wert-Labels neutral (kein --appeal/--substance,
    // die laut BAU-CHECKLISTE §4 nur in der Dataviz-Seite /how-it-works erlaubt sind).
    neutralValues?: boolean
  }>(),
  {
    aesthetic: 86,
    integrity: 64,
    variant: 'full',
    neutralValues: false,
  },
)

// i18n (Seitentext-Migration): Text-Defaults (Achsentitel, pointLabel) aus
// components.maskingQuadrant.* -> folgen dem Sprachwechsel. Uebergibt der Aufrufer
// (z. B. das Report-Cockpit) eigene Achsentitel/pointLabel, gewinnen diese weiterhin.
// An die eingefrorene Report-Sprache gebunden (useReportT): im Analyse-Report
// folgt der Quadrant der Erzeugungssprache des Reports, ausserhalb (z.B.
// how-it-works, ohne Injection) der aktiven UI-Locale.
const { rt: t } = useReportT()
const xLabel = computed(() => props.xAxisLabel ?? t('components.maskingQuadrant.xAxisDefault'))
const yLabel = computed(() => props.yAxisLabel ?? t('components.maskingQuadrant.yAxisDefault'))
const pointLabelResolved = computed(() => props.pointLabel ?? t('components.maskingQuadrant.pointDefault'))

// Eindeutige SVG-IDs pro Instanz (Codex: harte IDs kollidieren bei Mehrfach-Einsatz).
const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
const hatchId = `mq-hatch-${uid}`
const fadeId = `mq-fade-${uid}`
const zoneId = `mq-zoneclip-${uid}`

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

// Randkorrektur (Codex 1.8): bei Punkten weit rechts/oben klappt die Wert-Box nach innen,
// sonst laeuft sie aus dem Plot (v.a. compact/Mobile bei Werten nahe 100). Schwellen so
// gewaehlt, dass die how-it-works-Defaults (Integritaet 64 / Aesthetik 86) unveraendert
// rechts-oben bleiben.
const valboxStyle = computed(() => {
  const flipX = ptLeft.value > 72
  const flipY = ptTop.value < 12
  return {
    left: `${ptLeft.value}%`,
    top: `${ptTop.value}%`,
    transform: `translate(${flipX ? 'calc(-100% - 12px)' : '12px'}, ${flipY ? '8px' : '-120%'})`,
  }
})

const ariaLabel = computed(() =>
  t('components.maskingQuadrant.aria', {
    x: xLabel.value.replace(/\s*→\s*$/, ''),
    y: yLabel.value.replace(/\s*→\s*$/, ''),
    pointLabel: pointLabelResolved.value,
    aesthetic: props.aesthetic,
    integrity: props.integrity,
  }),
)
</script>

<template>
  <div class="quad" :class="{ 'quad--compact': variant === 'compact', 'quad--neutralvals': neutralValues }">
    <div class="quad__stage" role="img" :aria-label="ariaLabel">
        <svg class="quad__svg" viewBox="0 0 320 320" aria-hidden="true">
          <defs>
            <pattern :id="hatchId" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line class="quad__hatch" x1="0" y1="0" x2="0" y2="8" />
            </pattern>
            <linearGradient :id="fadeId" x1="0" y1="0" x2="1" y2="1">
              <stop class="quad__fade0" offset="0" />
              <stop class="quad__fade1" offset="0.8" />
            </linearGradient>
            <clipPath :id="zoneId">
              <polygon points="16,304 16,16 304,16" />
            </clipPath>
          </defs>

          <!-- Maskierungs-Zone: Dreieck oberhalb der Diagonale. Warm-Verlauf IN die
               Zone geclippt (nicht volle Fläche – Codex) + Schraffur = Flächengewicht. -->
          <rect x="16" y="16" width="288" height="288" :fill="`url(#${fadeId})`" :clip-path="`url(#${zoneId})`" />
          <polygon class="quad__zone" points="16,304 16,16 304,16" :fill="`url(#${hatchId})`" />

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

          <!-- Achsentitel im SVG (vorlagentreu); sitzen im 16er-Padding-Gutter. Das Y-Label
               ist um -90° rotiert -> ein "→" im Markup erscheint visuell als "↑" (nach oben).
               Ein "↑" wuerde durch die Rotation faelschlich nach links zeigen. -->
          <text class="quad__axt" x="160" y="317" text-anchor="middle">{{ xLabel }}</text>
          <text class="quad__axt" x="11" y="160" text-anchor="middle" transform="rotate(-90 11 160)">{{ yLabel }}</text>
        </svg>

        <!-- HTML-Overlay-Labels (deckungsgleich mit dem SVG) -->
        <span class="quad__zonelbl">{{ t('components.maskingQuadrant.zoneLabel') }}</span>
        <span class="quad__valbox" :style="valboxStyle" aria-hidden="true">
          <span class="quad__valkicker">{{ pointLabelResolved }}</span>
          <span class="quad__val quad__val--aesth">{{ t('components.maskingQuadrant.valueAesthetic', { value: aesthetic }) }}</span>
          <span class="quad__val quad__val--integ">{{ t('components.maskingQuadrant.valueIntegrity', { value: integrity }) }}</span>
        </span>
      </div>

    <div class="quad__legend">
      <h3>{{ t('components.maskingQuadrant.legendH3') }}</h3>
      <p>{{ t('components.maskingQuadrant.legendP') }}</p>
      <ul>
        <li>
          <i class="quad__sw quad__sw--zone" aria-hidden="true" />
          <span><b>{{ t('components.maskingQuadrant.legendZoneTerm') }}</b> {{ t('components.maskingQuadrant.legendZoneDesc') }}</span>
        </li>
        <li>
          <i class="quad__sw quad__sw--diag" aria-hidden="true" />
          <span><b>{{ t('components.maskingQuadrant.legendDiagTerm') }}</b> {{ t('components.maskingQuadrant.legendDiagDesc') }}</span>
        </li>
        <li>
          <i class="quad__sw quad__sw--pt" aria-hidden="true" />
          <span>
            <b>{{ t('components.maskingQuadrant.legendPointTerm') }}</b> –
            <span class="quad__val--aesth">{{ t('components.maskingQuadrant.valueAesthetic', { value: aesthetic }) }}</span> /
            <span class="quad__val--integ">{{ t('components.maskingQuadrant.valueIntegrity', { value: integrity }) }}</span>.
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.quad {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: clamp(24px, 3vw, 40px);
  align-items: center;
  padding: clamp(24px, 3.5vw, 40px);
  background: var(--canvas);
  border: 1px solid var(--line);
  border-radius: var(--r);
}

/* compact (Report): nur die Stage, ohne Erklaer-Legende; rahmenlos, damit sich der
   Quadrant in die umgebende Befund-Karte einfuegt (keine Karte-in-Karte). */
.quad--compact {
  grid-template-columns: 1fr;
  padding: 0;
  background: transparent;
  border: none;
}
.quad--compact .quad__legend {
  display: none;
}
.quad--compact .quad__stage {
  max-width: 340px;
}

/* Stage = direktes Grid-Kind mit width:100% (wie Vorlage): füllt die 1fr-Spalte
   grosszügig. WICHTIG: width:100% explizit setzen – sonst kollabiert der Block mit
   margin:0 auto auf die SVG-Default-Breite (300px). max-width nur als Obergrenze. */
.quad__stage {
  position: relative;
  aspect-ratio: 1;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
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
/* Warm-Verlauf in der Zone (Flächengewicht), in die Polygon-Zone geclippt. */
.quad__fade0 {
  stop-color: var(--warn);
  stop-opacity: 0.16;
}
.quad__fade1 {
  stop-color: var(--warn);
  stop-opacity: 0;
}
.quad__grid line {
  stroke: var(--line-soft);
  stroke-width: 1;
}
.quad__axis line {
  stroke: var(--line-strong);
  stroke-width: 2;
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
  white-space: nowrap;
  /* transform wird dynamisch via valboxStyle gesetzt (Randkorrektur). */
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
/* Produkt-UI (Cockpit/Report): neutrale Wert-Labels statt Dimensionsfarben
   (BAU-CHECKLISTE §4 – --appeal/--substance nur auf /how-it-works). */
.quad--neutralvals .quad__val--aesth,
.quad--neutralvals .quad__val--integ {
  color: var(--ink);
}
/* Achsentitel im SVG (fill statt color); im Padding-Gutter, daher overflow: visible. */
.quad__axt {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  fill: var(--subtle);
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
