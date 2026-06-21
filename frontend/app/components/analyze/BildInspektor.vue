<script setup lang="ts">
// BildInspektor (Etappe 3) – linke Workbench-Spalte mit dem Bild-Overlay (F2):
// Bounding-Boxen + Pins + Tooltip zeigen, WO ein Modellhinweis sitzt. Reiner
// Renderer: die F2-Qualifikation (qualifiesAsBox/layer) kommt fertig als
// InspectorSpot[] aus dem Root (DiagnoseCockpit via lib/overlay-spots.ts). Geometrie
// + Interaktionszustand leben hier. Look portiert aus dashboard-cockpit-pruefauftrag-v3.html.
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import type { InspectorSpot } from '~/types/analysis'

const props = withDefaults(
  defineProps<{
    imageUrl?: string | null
    imageAlt?: string
    spots?: InspectorSpot[]
  }>(),
  { imageUrl: null, imageAlt: 'Analysiertes KI-Bild', spots: () => [] },
)

// Vor dem Bild-Load steht die echte AR nicht fest → neutraler Fallback, danach exakt.
const FALLBACK_AR = '3 / 2'
const SOURCE_LABEL: Record<InspectorSpot['source'], string> = {
  physics: 'Physik',
  anatomy: 'Anatomie',
  context: 'Kontext',
  masking: 'Maskierung',
}

const viewportEl = ref<HTMLElement | null>(null)
const tooltipEl = ref<HTMLElement | null>(null)
const imgEl = ref<HTMLImageElement | null>(null)

const imageLoaded = ref(false)
const imageAR = ref<string | null>(null)
// Zwei getrennte Zustände lösen den mouseenter-vor-click-Konflikt sauber:
//  · hoverId  – transiente Vorschau (Hover/Fokus), wird beim Verlassen geleert.
//  · activeId – angepinnt durch Klick/Enter (echtes Toggle, unabhängig vom Hover).
const hoverId = ref<string | null>(null)
const activeId = ref<string | null>(null)
const tooltipPos = ref<{ left: string; top: string }>({ left: '0px', top: '0px' })
const visibleLayers = reactive<{ finding: boolean; mask: boolean }>({ finding: true, mask: true })

// Nur qualifizierte Spots bekommen Box + Pin; der Rest läuft über die Fallback-Liste.
const boxedSpots = computed(() => props.spots.filter((s) => s.qualifiesAsBox))
const findingBoxCount = computed(() => boxedSpots.value.filter((s) => s.layer === 'finding').length)
const maskBoxCount = computed(() => boxedSpots.value.filter((s) => s.layer === 'mask').length)
const hasAnyBox = computed(() => boxedSpots.value.length > 0)
// Sichtbar = qualifiziert UND Layer aktiv.
const visibleBoxedSpots = computed(() => boxedSpots.value.filter((s) => visibleLayers[s.layer]))
// Marker-UI (Toggles + SVG + Pins) erst nach Load und nur wenn es etwas zu zeigen gibt.
const overlayActive = computed(() => imageLoaded.value && hasAnyBox.value)
// Der aktuell gezeigte Spot – Hover hat Vorrang vors Angepinnte. SELBSTVALIDIEREND:
// existiert der Spot noch, ist er geboxt und sein Layer sichtbar? Dadurch kein dangling
// activeId (das sonst alle Boxen muten würde) und kein Tooltip über ausgeblendetem
// Layer – Spot-/Bildwechsel und Layer-Toggle sind automatisch abgedeckt.
const shownSpot = computed(() => {
  const id = hoverId.value ?? activeId.value
  if (!id) return null
  const s = props.spots.find((x) => x.id === id)
  if (!s || !s.qualifiesAsBox || !visibleLayers[s.layer]) return null
  return s
})

function spotMeta(s: InspectorSpot): string {
  if (s.layer === 'mask') return s.driverLabel ? `Maskierung · ${s.driverLabel}` : 'Maskierung'
  return SOURCE_LABEL[s.source]
}
function pinStyle(box: InspectorSpot['box']) {
  const left = Math.min(Math.max(box[3] / 10, 4), 95)
  const top = Math.min(Math.max(box[0] / 10, 6), 92)
  return { left: `${left}%`, top: `${top}%` }
}

// Tooltip pixelgenau positionieren (1:1 aus v3): horizontal über Box-Mitte zentriert
// + geclampt, vertikal unter die Box, bei Platzmangel über die Box gespiegelt.
function positionTooltip(box: InspectorSpot['box']) {
  const vp = viewportEl.value
  const tt = tooltipEl.value
  if (!vp || !tt) return
  const [y1, x1, y2, x2] = box
  const vw = vp.clientWidth
  const vh = vp.clientHeight
  const tw = tt.offsetWidth
  const th = tt.offsetHeight
  const pad = 10
  let left = ((x1 + x2) / 2 / 1000) * vw - tw / 2
  left = Math.max(pad, Math.min(left, vw - tw - pad))
  let top = (y2 / 1000) * vh + 12
  if (top + th > vh - pad) top = (y1 / 1000) * vh - th - 12
  top = Math.max(pad, Math.min(top, vh - th - pad))
  tooltipPos.value = { left: `${Math.round(left)}px`, top: `${Math.round(top)}px` }
}

function setHover(id: string) {
  hoverId.value = id
}
// Hover/Fokus geht (mouseleave einzelner Pins): nur leeren, wenn es dieser Spot war.
function clearHover(id?: string) {
  if (!id || hoverId.value === id) hoverId.value = null
}
// Klick/Enter pinnt an bzw. löst (echtes Toggle, vom Hover entkoppelt).
function toggleActive(id: string) {
  activeId.value = activeId.value === id ? null : id
}
function clearAll() {
  hoverId.value = null
  activeId.value = null
}

// Klick auf qualifizierte Listenzeile: Layer sichtbar + Spot toggeln/anpinnen. Der
// Fokus bleibt bewusst auf der Zeile (kein unsichtbarer Fokussprung auf den Bild-Pin).
function onListActivate(s: InspectorSpot) {
  if (!s.qualifiesAsBox) return
  if (activeId.value === s.id) {
    activeId.value = null
    return
  }
  visibleLayers[s.layer] = true
  activeId.value = s.id
}
function toggleLayer(layer: 'finding' | 'mask') {
  visibleLayers[layer] = !visibleLayers[layer]
}
function onEscape() {
  if (shownSpot.value) clearAll()
}

// Tooltip neu positionieren, sobald sich der gezeigte Spot ändert (nach DOM-Update).
watch(
  () => shownSpot.value?.id,
  (id) => {
    if (!id) return
    nextTick(() => {
      const s = shownSpot.value
      if (s) positionTooltip(s.box)
    })
  },
)

function applyDims(img: HTMLImageElement) {
  if (img.naturalWidth && img.naturalHeight) imageAR.value = `${img.naturalWidth} / ${img.naturalHeight}`
  imageLoaded.value = true
}
function onImgLoad(e: Event) {
  applyDims(e.target as HTMLImageElement)
}
// Cached/SSR-Fall: ist das Bild beim Hydrieren bereits `complete`, feuert @load nie.
function syncCachedImage() {
  const img = imgEl.value
  if (img && img.complete && img.naturalWidth) applyDims(img)
}

// Bildwechsel: AR + Highlight zurücksetzen, Overlay erst nach erneutem Load
// (bzw. sofort, falls die neue Quelle schon im Cache liegt).
watch(
  () => props.imageUrl,
  () => {
    imageLoaded.value = false
    imageAR.value = null
    clearAll()
    nextTick(syncCachedImage)
  },
)

// Resize: offenen Tooltip neu positionieren (rAF-gedrosselt).
let rafId = 0
function onResize() {
  if (!shownSpot.value || rafId) return
  rafId = requestAnimationFrame(() => {
    rafId = 0
    const s = shownSpot.value
    if (s) positionTooltip(s.box)
  })
}
onMounted(() => {
  window.addEventListener('resize', onResize, { passive: true })
  syncCachedImage()
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<template>
  <section class="inspector is-reveal" aria-labelledby="inspector-title" @keydown.esc="onEscape">
    <div class="inspector__head">
      <p id="inspector-title" class="eyebrow">01 · Bildinspektor</p>
      <div v-if="overlayActive" class="toggles" role="group" aria-label="Overlay-Ebenen">
        <button
          class="layer-toggle"
          type="button"
          :aria-pressed="visibleLayers.finding"
          :disabled="findingBoxCount === 0"
          @click="toggleLayer('finding')"
        >
          <span class="layer-toggle__key">{{ findingBoxCount }}</span>Befunde
        </button>
        <button
          class="layer-toggle layer-toggle--mask"
          type="button"
          :aria-pressed="visibleLayers.mask"
          :disabled="maskBoxCount === 0"
          @click="toggleLayer('mask')"
        >
          <span class="layer-toggle__key">{{ maskBoxCount }}</span>Maskierung
        </button>
      </div>
    </div>

    <div ref="viewportEl" class="viewport" :style="{ aspectRatio: imageAR ?? FALLBACK_AR }" @mouseleave="clearHover()">
      <img v-if="imageUrl" ref="imgEl" :src="imageUrl" :alt="imageAlt" @load="onImgLoad" />
      <div v-else class="viewport__empty" aria-hidden="true">Kein Bild</div>

      <template v-if="overlayActive">
        <svg class="overlay" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
          <g
            v-for="s in visibleBoxedSpots"
            :key="s.id"
            class="evidence"
            :class="[`evidence--${s.layer}`, { 'is-active': shownSpot?.id === s.id, 'is-muted': shownSpot && shownSpot.id !== s.id }]"
          >
            <rect
              class="evidence__halo"
              :x="s.box[1]"
              :y="s.box[0]"
              :width="s.box[3] - s.box[1]"
              :height="s.box[2] - s.box[0]"
            />
            <rect
              class="evidence__box"
              :x="s.box[1]"
              :y="s.box[0]"
              :width="s.box[3] - s.box[1]"
              :height="s.box[2] - s.box[0]"
            />
          </g>
        </svg>

        <div class="pins">
          <button
            v-for="s in visibleBoxedSpots"
            :key="s.id"
            class="pin"
            :class="[`pin--${s.layer}`, { 'is-active': shownSpot?.id === s.id }]"
            :data-id="s.id"
            :style="pinStyle(s.box)"
            type="button"
            :aria-label="`${s.id}, ${spotMeta(s)} – unverifizierter Modellhinweis: ${s.text}`"
            @mouseenter="setHover(s.id)"
            @mouseleave="clearHover(s.id)"
            @focus="setHover(s.id)"
            @blur="clearAll"
            @click="toggleActive(s.id)"
          >
            {{ s.id }}
          </button>
        </div>

        <div ref="tooltipEl" class="tooltip" :class="{ 'is-visible': !!shownSpot }" :style="tooltipPos" aria-hidden="true">
          <template v-if="shownSpot">
            <div class="tooltip__top">
              <span class="tooltip__id">{{ shownSpot.id }} · {{ shownSpot.layer === 'mask' ? 'Maskierung' : 'Befund' }}</span>
              <span class="tooltip__claim">unverifiziert</span>
            </div>
            <p class="tooltip__text">{{ shownSpot.text }}</p>
          </template>
        </div>
      </template>
    </div>

    <div v-if="spots.length" class="spotlist">
      <p class="spotlist__head">
        Verortete Modellhinweise<span class="spotlist__claim"> · unverifiziert</span>
      </p>
      <ul class="spotlist__items">
        <li v-for="s in spots" :key="s.id">
          <button
            v-if="s.qualifiesAsBox"
            type="button"
            class="spotrow spotrow--linked"
            :class="{ 'is-active': shownSpot?.id === s.id }"
            @click="onListActivate(s)"
          >
            <span class="spotrow__id" :class="`spotrow__id--${s.layer}`">{{ s.id }}</span>
            <span class="spotrow__body">
              <span class="spotrow__text">{{ s.text }}</span>
              <span class="spotrow__meta">{{ spotMeta(s) }} · im Bild markiert</span>
            </span>
          </button>
          <div v-else class="spotrow spotrow--text">
            <span class="spotrow__id spotrow__id--muted">{{ s.id }}</span>
            <span class="spotrow__body">
              <span class="spotrow__text">{{ s.text }}</span>
              <span class="spotrow__meta">{{ spotMeta(s) }} · ohne Box (nicht hinreichend verortet)</span>
            </span>
          </div>
        </li>
      </ul>
    </div>

    <p class="inspector__caption">
      Gezeigt wird die modell-gesehene Bildfassung. Boxen sind LLM-verortet, nicht pixelgenau – Modellhinweise sind
      unverifizierte Navigationshilfen, keine Nachweise. Bei rotierten EXIF-Bildern können Boxen abweichen.
    </p>
  </section>
</template>

<style scoped>
.inspector {
  position: sticky;
  top: 22px;
  border: 1px solid var(--line);
  border-radius: var(--r);
  overflow: hidden;
  background: var(--surface);
}
.inspector__head {
  min-height: 48px;
  padding: 9px 14px;
  border-bottom: 1px solid var(--line);
  background: var(--canvas);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 14px;
}
.eyebrow {
  margin: 0;
  color: var(--subtle);
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
.toggles {
  display: flex;
  gap: 8px;
  margin-left: auto;
}
.layer-toggle {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 30px;
  padding: 5px 9px;
  border: 1px solid var(--line-strong);
  border-radius: 4px;
  background: var(--surface);
  color: var(--ink-soft);
  font-family: var(--mono);
  font-size: 10.5px;
  cursor: pointer;
  transition: opacity 0.12s ease-out, border-color 0.12s ease-out;
}
.layer-toggle:hover:not(:disabled) {
  border-color: var(--ink);
}
.layer-toggle[aria-pressed='false'] {
  opacity: 0.6;
  border-style: dashed;
  color: var(--muted);
}
.layer-toggle:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.layer-toggle__key {
  min-width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  border-radius: 2px;
  background: var(--warn);
  color: var(--ink);
  font-size: 9px;
  font-weight: 600;
}
.layer-toggle--mask .layer-toggle__key {
  background: var(--ink);
  color: var(--surface);
}

.viewport {
  position: relative;
  background: var(--ink);
  overflow: hidden;
}
.viewport img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  /* Container-AR = echte Bild-AR (aus @load) → contain füllt deckungsgleich mit dem
     SVG, kein Crop, kein Letterbox. Boxen sitzen damit korrekt (0–1000 normiert). */
  object-fit: contain;
}
.viewport__empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--ink-text-muted);
  font-family: var(--mono);
  font-size: 12px;
}
.overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}
.evidence {
  transition: opacity 0.16s ease-out;
}
.evidence.is-muted {
  opacity: 0.18;
}
.evidence__halo {
  fill: none;
  stroke: color-mix(in srgb, var(--ink) 72%, transparent);
  stroke-width: 7;
  vector-effect: non-scaling-stroke;
}
.evidence__box {
  fill: color-mix(in srgb, var(--warn) 10%, transparent);
  stroke: var(--warn);
  stroke-width: 3;
  vector-effect: non-scaling-stroke;
}
.evidence--mask .evidence__box {
  fill: color-mix(in srgb, var(--surface) 4%, transparent);
  stroke: var(--surface);
  stroke-dasharray: 4 5;
}
.evidence.is-active .evidence__box {
  stroke-width: 5;
}

.pins {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
}
.pin {
  position: absolute;
  transform: translate(-50%, -50%);
  min-width: 28px;
  height: 28px;
  padding: 0 7px;
  border: 2px solid var(--surface);
  border-radius: 14px;
  background: var(--warn);
  color: var(--ink);
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  pointer-events: auto;
  transition: transform 0.12s ease-out;
}
.pin:hover,
.pin:focus-visible,
.pin.is-active {
  transform: translate(-50%, -50%) scale(1.13);
}
.pin:focus-visible {
  outline: 2px solid var(--surface);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--ink) 92%, transparent);
}
.pin--mask {
  background: var(--ink);
  color: var(--surface);
}

.tooltip {
  position: absolute;
  z-index: 5;
  width: min(300px, calc(100% - 24px));
  padding: 12px 13px;
  border: 1px solid var(--line-strong);
  border-radius: var(--r);
  background: var(--surface);
  color: var(--ink-soft);
  font-size: 12.5px;
  line-height: 1.45;
  opacity: 0;
  pointer-events: none;
  transform: translateY(5px);
  transition: opacity 0.12s ease-out, transform 0.12s ease-out;
}
.tooltip.is-visible {
  opacity: 1;
  transform: translateY(0);
}
.tooltip__top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 5px;
}
.tooltip__id,
.tooltip__claim {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}
.tooltip__claim {
  color: var(--muted);
}
.tooltip__text {
  margin: 0;
}

.spotlist {
  padding: 12px 14px;
  border-top: 1px solid var(--line);
  background: var(--surface);
}
.spotlist__head {
  margin: 0 0 8px;
  color: var(--subtle);
  font-family: var(--mono);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.spotlist__claim {
  color: var(--muted);
}
.spotlist__items {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.spotrow {
  width: 100%;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 8px 9px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--canvas);
  text-align: left;
  color: inherit;
  font: inherit;
}
.spotrow--linked {
  cursor: pointer;
  transition: border-color 0.12s ease-out, background 0.12s ease-out;
}
.spotrow--linked:hover {
  border-color: var(--line-strong);
}
.spotrow--linked:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 1px;
}
.spotrow--linked.is-active {
  border-color: var(--warn);
  background: color-mix(in srgb, var(--warn) 7%, var(--canvas));
}
.spotrow__id {
  flex: none;
  min-width: 24px;
  height: 20px;
  padding: 0 6px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: var(--warn);
  color: var(--ink);
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 600;
}
.spotrow__id--mask {
  background: var(--ink);
  color: var(--surface);
}
.spotrow__id--muted {
  background: var(--surface-2);
  color: var(--muted);
}
.spotrow__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.spotrow__text {
  font-size: 12.5px;
  line-height: 1.4;
  color: var(--ink-soft);
}
.spotrow__meta {
  font-family: var(--mono);
  font-size: 9.5px;
  letter-spacing: 0.04em;
  color: var(--muted);
}

.inspector__caption {
  margin: 0;
  padding: 10px 14px;
  border-top: 1px solid var(--line);
  background: var(--canvas);
  color: var(--muted);
  font-family: var(--mono);
  font-size: 10px;
  line-height: 1.5;
}
.is-reveal {
  opacity: 0;
  animation: fade 0.55s ease 0.1s forwards;
}
@keyframes fade {
  to {
    opacity: 1;
  }
}
/* Sticky nur in der 2-spaltigen Workbench; nach dem Collapse statisch. */
@media (max-width: 980px) {
  .inspector {
    position: static;
  }
}
@media (prefers-reduced-motion: reduce) {
  .is-reveal {
    animation: none;
    opacity: 1;
  }
  .inspector {
    position: static;
  }
  .evidence,
  .pin,
  .tooltip,
  .spotrow--linked {
    transition: none;
  }
  .pin:hover,
  .pin:focus-visible,
  .pin.is-active {
    transform: translate(-50%, -50%);
  }
}
</style>
