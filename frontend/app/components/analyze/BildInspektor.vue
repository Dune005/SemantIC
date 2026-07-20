<script setup lang="ts">
// BildInspektor (Etappe 3) – linke Workbench-Spalte mit dem Bild-Overlay (F2):
// Bounding-Boxen + Pins + Tooltip zeigen, WO ein Modellhinweis sitzt. Reiner
// Renderer: die F2-Qualifikation (qualifiesAsBox/layer) kommt fertig als
// InspectorSpot[] aus dem Root (DiagnoseCockpit via lib/overlay-spots.ts). Geometrie
// + Interaktionszustand leben hier. Look portiert aus dashboard-cockpit-pruefauftrag-v3.html.
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from 'reka-ui'
import type { InspectorSpot } from '~/types/analysis'
import { isValidBox } from '~/lib/overlay-spots'
import { useReportT } from '~/composables/useReportT'

// Sichtbare Bildmarkierung fürs Overlay – BEWUSST eigener, neutraler Marker-Typ, getrennt
// von InspectorSpot/qualifiesAsBox (kein Befund). Box ist bereits zum Tupel konvertiert +
// im Root (DiagnoseCockpit) per isValidBox gehärtet.
interface ProvenanceMarkerView {
  id: string
  box: [number, number, number, number]
  description: string
  confidence: 'medium' | 'high'
}

const props = withDefaults(
  defineProps<{
    imageUrl?: string | null
    imageAlt?: string
    spots?: InspectorSpot[]
    provenanceMarkers?: ProvenanceMarkerView[]
  }>(),
  { imageUrl: null, imageAlt: undefined, spots: () => [], provenanceMarkers: () => [] },
)

// Statik in der eingefrorenen Report-Sprache (nicht UI-Locale); Quellen-Labels
// laufen über report.spotSource.* (rt).
const { rt } = useReportT()
const altText = computed(() => props.imageAlt ?? rt('report.inspektor.imageAltDefault'))

// Vor dem Bild-Load steht die echte AR nicht fest → neutraler Fallback, danach exakt.
const FALLBACK_AR = '3 / 2'

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
// Sichtbare Bildmarkierung – eigene, von Befunden unabhängige Quelle. Erscheint auch
// auf befundfreien Bildern (eigenes Gate, NICHT an overlayActive gekoppelt). Für das
// Overlay nur valide Boxen; der Hinweistext unter dem Bild zeigt ALLE Marker
// (entartete Box → kein Rect, aber Text bleibt).
const provBoxes = computed(() => props.provenanceMarkers.filter((m) => isValidBox(m.box)))
// Lightbox-Caption: Legende nur ergänzen, wenn ein Marker sichtbar ist.
const lightboxCaption = computed(() =>
  provBoxes.value.length
    ? `${rt('report.common.boxesCaption')} ${rt('report.inspektor.provCaptionSuffix')}`
    : rt('report.common.boxesCaption'),
)
// Liefert den Spot zu einer ID NUR, wenn er noch existiert, geboxt und sein Layer
// sichtbar ist – sonst null. Verhindert dangling-/stale-Zustände.
function validSpot(id: string | null): InspectorSpot | null {
  if (!id) return null
  const s = props.spots.find((x) => x.id === id)
  return s && s.qualifiesAsBox && visibleLayers[s.layer] ? s : null
}
// Der aktuell gezeigte Spot – Hover hat Vorrang vors Angepinnte. Jeder Kandidat wird
// EINZELN validiert: ein ungültiges hoverId darf kein gültiges activeId verdecken.
const shownSpot = computed(() => validSpot(hoverId.value) ?? validSpot(activeId.value))

function spotMeta(s: InspectorSpot): string {
  if (s.layer === 'mask') {
    const masking = rt('report.spotSource.masking')
    return s.driverLabel ? `${masking} · ${s.driverLabel}` : masking
  }
  return rt(`report.spotSource.${s.source}`)
}
function pinStyle(box: InspectorSpot['box']) {
  const left = Math.min(Math.max(box[3] / 10, 4), 95)
  const top = Math.min(Math.max(box[0] / 10, 6), 92)
  return { left: `${left}%`, top: `${top}%` }
}
// Nummern-Chip an der oberen linken Box-Ecke (Grossansicht); Prozent → auflösungsunabhängig.
function boxLabelStyle(box: InspectorSpot['box']) {
  const left = Math.min(Math.max(box[1] / 10, 0), 90)
  const top = Math.min(Math.max(box[0] / 10, 0), 94)
  return { left: `${left}%`, top: `${top}%` }
}
// Grobe Bildposition fürs aria-label (Spec verlangt Position + Text).
function posLabel(box: InspectorSpot['box']): string {
  const cx = (box[1] + box[3]) / 2
  const cy = (box[0] + box[2]) / 2
  const h = rt(`report.inspektor.pos.${cx < 333 ? 'left' : cx > 667 ? 'right' : 'hCenter'}`)
  const v = rt(`report.inspektor.pos.${cy < 333 ? 'top' : cy > 667 ? 'bottom' : 'vCenter'}`)
  return `${v} ${h}`
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
  if (!visibleLayers[layer]) {
    // Beim Ausblenden zugehörige IDs abräumen, damit der Spot beim Wieder-
    // Einblenden nicht „zurückkehrt".
    const inLayer = (id: string | null) => {
      const s = id ? props.spots.find((x) => x.id === id) : null
      return !!s && s.layer === layer
    }
    if (inLayer(hoverId.value)) hoverId.value = null
    if (inLayer(activeId.value)) activeId.value = null
  }
}
function onEscape() {
  // Immer aufräumen – auch wenn shownSpot bereits null ist, könnten IDs hängen.
  clearAll()
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

// Neuer Spot-Satz (andere Analyse, IDs werden positional wiederverwendet) → Highlight
// komplett zurücksetzen, damit kein alter Pin fälschlich „aktiv" bleibt.
watch(
  () => props.spots,
  () => clearAll(),
)

// Offenen Tooltip neu positionieren (rAF-gedrosselt). ResizeObserver am Viewport
// deckt Fenster- UND Container-Resizes ab (z. B. Reflow der Workbench-Spalte).
let rafId = 0
function repositionShown() {
  if (!shownSpot.value || rafId) return
  rafId = requestAnimationFrame(() => {
    rafId = 0
    const s = shownSpot.value
    if (s) positionTooltip(s.box)
  })
}
let resizeObs: ResizeObserver | null = null
onMounted(() => {
  syncCachedImage()
  if (viewportEl.value && typeof ResizeObserver !== 'undefined') {
    resizeObs = new ResizeObserver(repositionShown)
    resizeObs.observe(viewportEl.value)
  }
})
onBeforeUnmount(() => {
  resizeObs?.disconnect()
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<template>
  <section class="inspector is-reveal" aria-labelledby="inspector-title" @keydown.esc="onEscape">
    <div class="inspector__head">
      <p id="inspector-title" class="eyebrow">{{ rt('report.inspektor.eyebrow') }}</p>
      <div v-if="overlayActive" class="toggles" role="group" :aria-label="rt('report.inspektor.togglesAria')">
        <button
          class="layer-toggle"
          type="button"
          :aria-pressed="visibleLayers.finding"
          :disabled="findingBoxCount === 0"
          @click="toggleLayer('finding')"
        >
          <span class="layer-toggle__key">{{ findingBoxCount }}</span>{{ rt('report.inspektor.toggleFindings') }}
        </button>
        <button
          class="layer-toggle layer-toggle--mask"
          type="button"
          :aria-pressed="visibleLayers.mask"
          :disabled="maskBoxCount === 0"
          :title="maskBoxCount === 0 ? rt('report.inspektor.noLocatableMasking') : undefined"
          @click="toggleLayer('mask')"
        >
          <span v-if="maskBoxCount > 0" class="layer-toggle__key">{{ maskBoxCount }}</span>{{ rt('report.inspektor.toggleMasking') }}
        </button>
      </div>
    </div>

    <!-- DialogRoot umspannt Viewport-Trigger + portierte Grossansicht; reka liefert
         Fokus-Trap/Escape/Fokus-Restore + Scroll-Lock (via Overlay). -->
    <DialogRoot>
    <div ref="viewportEl" class="viewport" :style="{ aspectRatio: imageAR ?? FALLBACK_AR }" @mouseleave="clearHover()">
      <img v-if="imageUrl" ref="imgEl" :src="imageUrl" :alt="altText" @load="onImgLoad" />
      <div v-else class="viewport__empty" aria-hidden="true">{{ rt('report.inspektor.noImage') }}</div>

      <!-- Sichtbare Bildmarkierung – neutrale, nicht-interaktive Schicht (kein Befund).
           Eigenes Gate (unabhängig von overlayActive); liegt VOR der Befund-Schicht im DOM,
           damit Befunde bei gleichem z-index darüber malen und nie verdeckt werden. -->
      <svg
        v-if="imageLoaded && provBoxes.length"
        class="overlay overlay--prov"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <g v-for="m in provBoxes" :key="m.id" class="provmark">
          <rect
            class="provmark__halo"
            :x="m.box[1]"
            :y="m.box[0]"
            :width="m.box[3] - m.box[1]"
            :height="m.box[2] - m.box[0]"
          />
          <rect
            class="provmark__box"
            :x="m.box[1]"
            :y="m.box[0]"
            :width="m.box[3] - m.box[1]"
            :height="m.box[2] - m.box[0]"
          />
        </g>
      </svg>

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
            :aria-pressed="shownSpot?.id === s.id"
            :aria-label="rt('report.inspektor.pinAria', { id: s.id, meta: spotMeta(s), pos: posLabel(s.box), text: s.text })"
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
              <span class="tooltip__id">{{ shownSpot.id }} · {{ shownSpot.layer === 'mask' ? rt('report.spotSource.masking') : rt('report.inspektor.tooltipFinding') }}</span>
              <span class="tooltip__claim">{{ rt('report.common.unverified') }}</span>
            </div>
            <p class="tooltip__text">{{ shownSpot.text }}</p>
          </template>
        </div>
      </template>

      <!-- Dezenter Auslöser unten rechts; nur sobald ein Bild geladen ist. as-child →
           reka stülpt die Trigger-Semantik (aria-haspopup/-expanded) über den Button. -->
      <DialogTrigger v-if="imageLoaded" as-child>
        <button class="viewport__zoom" type="button" :aria-label="rt('report.inspektor.zoomAria')">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </button>
      </DialogTrigger>
    </div>

    <!-- Grossansicht (Lightbox): Bild gross + neutrale Overlay-Boxen (visibleBoxedSpots,
         ohne Aktiv-/Stumm-Zustand). Content ist inhaltsgross + zentriert (NICHT inset:0),
         damit der Backdrop-Klick ausserhalb greift und schliesst. -->
    <DialogPortal>
      <DialogOverlay class="bi-lightbox__backdrop" />
      <DialogContent class="bi-lightbox" aria-modal="true">
        <div class="bi-lightbox__bar">
          <DialogTitle class="bi-lightbox__title">{{ rt('report.inspektor.lightboxTitle') }}</DialogTitle>
          <DialogClose class="bi-lightbox__close">{{ rt('report.inspektor.close') }} <span aria-hidden="true">✕</span></DialogClose>
        </div>
        <div class="bi-lightbox__body" :class="{ 'bi-lightbox__body--solo': !visibleBoxedSpots.length }">
          <div class="bi-lightbox__frame">
            <img v-if="imageUrl" :src="imageUrl" :alt="altText" />
            <!-- Sichtbare Bildmarkierung zuerst → Befunde malen bei gleichem z-index darüber. -->
            <svg
              v-if="provBoxes.length"
              viewBox="0 0 1000 1000"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <g v-for="m in provBoxes" :key="m.id" class="bi-lightbox__provmark">
                <rect
                  class="bi-lightbox__prov-halo"
                  :x="m.box[1]"
                  :y="m.box[0]"
                  :width="m.box[3] - m.box[1]"
                  :height="m.box[2] - m.box[0]"
                />
                <rect
                  class="bi-lightbox__prov-box"
                  :x="m.box[1]"
                  :y="m.box[0]"
                  :width="m.box[3] - m.box[1]"
                  :height="m.box[2] - m.box[0]"
                />
              </g>
            </svg>
            <svg
              v-if="visibleBoxedSpots.length"
              viewBox="0 0 1000 1000"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <g
                v-for="s in visibleBoxedSpots"
                :key="s.id"
                :class="['bi-lightbox__ev', `bi-lightbox__ev--${s.layer}`]"
              >
                <rect
                  class="bi-lightbox__halo"
                  :x="s.box[1]"
                  :y="s.box[0]"
                  :width="s.box[3] - s.box[1]"
                  :height="s.box[2] - s.box[0]"
                />
                <rect
                  class="bi-lightbox__box"
                  :x="s.box[1]"
                  :y="s.box[0]"
                  :width="s.box[3] - s.box[1]"
                  :height="s.box[2] - s.box[0]"
                />
              </g>
            </svg>
            <!-- Nummern-Chips auf den Boxen, korrelieren mit der Liste rechts. -->
            <div v-if="visibleBoxedSpots.length" class="bi-lightbox__labels" aria-hidden="true">
              <span
                v-for="s in visibleBoxedSpots"
                :key="s.id"
                class="bi-lightbox__label"
                :class="`bi-lightbox__label--${s.layer}`"
                :style="boxLabelStyle(s.box)"
              >{{ s.id }}</span>
            </div>
          </div>
          <ul v-if="visibleBoxedSpots.length" class="bi-lightbox__aside" :aria-label="rt('report.inspektor.locatedFindingsAria')">
            <li v-for="s in visibleBoxedSpots" :key="s.id" class="bi-lightbox__finding">
              <span class="bi-lightbox__fid" :class="`bi-lightbox__fid--${s.layer}`">{{ s.id }}</span>
              <span class="bi-lightbox__fbody">
                <span class="bi-lightbox__fmeta">{{ spotMeta(s) }} · {{ rt('report.common.unverified') }}</span>
                <span class="bi-lightbox__ftext">{{ s.text }}</span>
              </span>
            </li>
          </ul>
        </div>
        <DialogDescription class="bi-lightbox__caption">{{ lightboxCaption }}</DialogDescription>
      </DialogContent>
    </DialogPortal>
    </DialogRoot>

    <div v-if="spots.length" class="spotlist">
      <p class="spotlist__head">
        {{ rt('report.inspektor.spotlistHead') }}<span class="spotlist__claim"> · {{ rt('report.common.unverified') }}</span>
      </p>
      <p class="spotlist__legend">{{ rt('report.inspektor.legend') }}</p>
      <ul class="spotlist__items">
        <li v-for="s in spots" :key="s.id">
          <button
            v-if="s.qualifiesAsBox"
            type="button"
            class="spotrow spotrow--linked"
            :class="{ 'is-active': shownSpot?.id === s.id }"
            :aria-pressed="shownSpot?.id === s.id"
            @click="onListActivate(s)"
          >
            <span class="spotrow__id" :class="`spotrow__id--${s.layer}`">{{ s.id }}</span>
            <span class="spotrow__body">
              <span class="spotrow__text">{{ s.text }}</span>
              <span class="spotrow__meta">{{ spotMeta(s) }} · {{ rt('report.inspektor.inImageMarked') }}</span>
            </span>
          </button>
          <div v-else class="spotrow spotrow--text">
            <span class="spotrow__id spotrow__id--muted">{{ s.id }}</span>
            <span class="spotrow__body">
              <span class="spotrow__text">{{ s.text }}</span>
              <span class="spotrow__meta">{{ spotMeta(s) }} · {{ rt('report.inspektor.withoutBox') }}</span>
            </span>
          </div>
        </li>
      </ul>
    </div>
    <p v-else class="spotlist-empty">{{ rt('report.inspektor.noSpots') }}</p>

    <!-- Sichtbare Bildmarkierung – Hinweis direkt zur gepunkteten Box im Bild (kein Befund).
         Erscheint nur, wenn das Modell eine Markierung erkannt hat; zeigt ALLE Marker
         (auch ohne darstellbare Box). -->
    <div v-if="provenanceMarkers.length" class="prov-hint">
      <p class="prov-hint__label">{{ rt('report.inspektor.provLabel') }}</p>
      <p v-for="m in provenanceMarkers" :key="m.id" class="prov-hint__text">
        {{ m.description }}
        <span class="prov-hint__conf">· {{ rt('report.inspektor.provConfidence', { level: rt(`report.common.confidence.${m.confidence}`) }) }}</span>
      </p>
      <p class="prov-hint__note">{{ rt('report.inspektor.provNote') }}</p>
    </div>

    <p class="inspector__caption">{{ rt('report.common.boxesCaption') }}</p>
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
/* Auslöser der Grossansicht – dunkel-transluzent über dem Bild (Ink-Grund). */
.viewport__zoom {
  position: absolute;
  right: 10px;
  bottom: 10px;
  /* Unter den Pins (z-3), damit ein Eck-Pin nie verdeckt wird; der 36px-Button bleibt
     trotz eines 28px-Pins klickbar (Pin kann ihn nie ganz überdecken). */
  z-index: 2;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--ink-text) 55%, transparent);
  border-radius: var(--r);
  background: color-mix(in srgb, var(--ink) 62%, transparent);
  color: var(--ink-text);
  cursor: pointer;
  transition: background 0.12s ease-out, border-color 0.12s ease-out;
}
.viewport__zoom:hover {
  background: color-mix(in srgb, var(--ink) 88%, transparent);
  border-color: var(--ink-text);
}
.viewport__zoom:focus-visible {
  outline: 2px solid var(--ink-text);
  outline-offset: 2px;
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

/* Sichtbare Bildmarkierung – neutrale Schicht (kein Befund). Dunkles Halo für Lesbarkeit
   über jedem Bild + dünner, gepunkteter neutraler Strich; klar verschieden von amber=Befund
   und weiss-gestrichelt=Maskierung. Nur Tokens, keine Severity-Farbe, nicht interaktiv. */
.provmark__halo {
  fill: none;
  stroke: color-mix(in srgb, var(--ink) 72%, transparent);
  stroke-width: 7;
  vector-effect: non-scaling-stroke;
}
.provmark__box {
  fill: color-mix(in srgb, var(--surface) 4%, transparent);
  stroke: var(--ink-text-soft);
  stroke-width: 2;
  stroke-dasharray: 2 3;
  vector-effect: non-scaling-stroke;
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
.spotlist__legend {
  margin: 0 0 8px;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 9.5px;
  letter-spacing: 0.04em;
}
.spotlist-empty {
  margin: 0;
  padding: 12px 14px;
  border-top: 1px solid var(--line);
  background: var(--surface);
  color: var(--muted);
  font-family: var(--mono);
  font-size: 10px;
  line-height: 1.5;
}
.spotlist__items {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
/* Sichtbare Bildmarkierung – Hinweiszeile in der Inspektor-Karte (zur gepunkteten Box).
   Deskriptiv, kein Befund/keine Severity-Farbe; nur Tokens, kein Links-Akzentstreifen. */
.prov-hint {
  padding: 12px 14px;
  border-top: 1px solid var(--line);
  background: var(--surface);
}
.prov-hint__label {
  margin: 0 0 6px;
  color: var(--subtle);
  font-family: var(--mono);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.prov-hint__text {
  margin: 0 0 3px;
  color: var(--ink-soft);
  font-size: 12.5px;
  line-height: 1.45;
}
.prov-hint__conf {
  color: var(--muted);
  font-family: var(--mono);
  font-size: 10.5px;
}
.prov-hint__note {
  margin: 5px 0 0;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.45;
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

<!-- Unscoped: DialogContent/Overlay werden per Portal in den <body> gerendert, scoped
     Styles greifen dort nicht (Haus-Muster wie LangSwitcher). Eigener .bi-lightbox-Präfix
     vermeidet Kollisionen mit dem zu generischen .lightbox aus Fremddateien. -->
<style>
.bi-lightbox__backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  /* Tiefe über Fläche statt Schatten: translucentes Ink (~93 %). */
  background: color-mix(in srgb, var(--ink) 93%, transparent);
}
.bi-lightbox {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 101;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  max-width: 94vw;
  max-height: 94vh;
  padding: 0;
}
.bi-lightbox__bar {
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.bi-lightbox__title {
  margin: 0;
  color: var(--ink-text-soft);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.bi-lightbox__close {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 7px 14px;
  border: 1px solid var(--ink-text-muted);
  border-radius: var(--r);
  background: transparent;
  color: var(--ink-text);
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: background 0.12s ease-out, border-color 0.12s ease-out;
}
.bi-lightbox__close:hover {
  background: color-mix(in srgb, var(--ink-text) 8%, transparent);
  border-color: var(--ink-text);
}
.bi-lightbox__close:focus-visible {
  outline: 2px solid var(--ink-text);
  outline-offset: 2px;
}
/* Bild links, Befundliste rechts – wrappt auf schmalen Viewports darunter. */
.bi-lightbox__body {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 18px;
  max-width: 94vw;
}
/* Frame schrumpft auf die GERENDERTE Bildfläche (img per vw/vh begrenzt, AR erhalten);
   das SVG (inset:0) liegt damit deckungsgleich – kein Letterbox, keine AR-Bindung nötig. */
.bi-lightbox__frame {
  position: relative;
  line-height: 0;
  /* nicht schrumpfen – sonst läuft das Bild über die Liste (Flex-Shrink-Overlap). */
  flex: 0 0 auto;
}
.bi-lightbox__frame img {
  display: block;
  width: auto;
  height: auto;
  /* Platz für die seitliche Befundliste (≈300px) + Leiste/Caption reservieren. vw/vh-basiert
     → keine zirkuläre Containing-Block-Abhängigkeit; SVG inset:0 deckt die exakte Bildfläche. */
  max-width: calc(94vw - 340px);
  max-height: min(74vh, calc(94vh - 110px));
}
/* Marker-only / keine Befunde: keine Aside-Liste → Bild darf die volle Breite nutzen
   statt 340px für eine nicht gerenderte Liste zu reservieren. */
.bi-lightbox__body--solo .bi-lightbox__frame img {
  max-width: 94vw;
}
.bi-lightbox__frame svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.bi-lightbox__halo {
  fill: none;
  stroke: color-mix(in srgb, var(--ink) 72%, transparent);
  stroke-width: 7;
  vector-effect: non-scaling-stroke;
}
.bi-lightbox__box {
  fill: color-mix(in srgb, var(--warn) 10%, transparent);
  stroke: var(--warn);
  stroke-width: 3;
  vector-effect: non-scaling-stroke;
}
.bi-lightbox__ev--mask .bi-lightbox__box {
  fill: color-mix(in srgb, var(--surface) 4%, transparent);
  stroke: var(--surface);
  stroke-dasharray: 4 5;
}
/* Sichtbare Bildmarkierung in der Grossansicht – neutral, gepunktet (kein Befund). */
.bi-lightbox__prov-halo {
  fill: none;
  stroke: color-mix(in srgb, var(--ink) 72%, transparent);
  stroke-width: 7;
  vector-effect: non-scaling-stroke;
}
.bi-lightbox__prov-box {
  fill: color-mix(in srgb, var(--surface) 4%, transparent);
  stroke: var(--ink-text-soft);
  stroke-width: 2;
  stroke-dasharray: 2 3;
  vector-effect: non-scaling-stroke;
}
/* Nummern-Chips auf den Boxen (korrelieren mit der Befundliste). */
.bi-lightbox__labels {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.bi-lightbox__label {
  position: absolute;
  transform: translate(2px, 2px);
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--warn);
  color: var(--ink);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
  line-height: 1.4;
}
.bi-lightbox__label--mask {
  background: var(--ink-surface-2);
  color: var(--ink-text);
  border: 1px solid var(--ink-text-muted);
}
/* Befundliste neben dem Bild (Nummer · Dimension · unverifizierter Modelltext). */
.bi-lightbox__aside {
  flex: 0 0 300px;
  max-height: min(74vh, calc(94vh - 110px));
  overflow-y: auto;
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.bi-lightbox__finding {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.bi-lightbox__fid {
  flex: none;
  min-width: 22px;
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
.bi-lightbox__fid--mask {
  background: var(--ink-surface-2);
  color: var(--ink-text);
  border: 1px solid var(--ink-line);
}
.bi-lightbox__fbody {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.bi-lightbox__fmeta {
  font-family: var(--mono);
  font-size: 9.5px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-text-muted);
}
.bi-lightbox__ftext {
  font-family: var(--sans);
  font-size: 13px;
  line-height: 1.45;
  color: var(--ink-text-soft);
}
/* Schmale Viewports: Bild über die Liste stapeln statt nebeneinander. */
@media (max-width: 720px) {
  .bi-lightbox__body {
    flex-direction: column;
    align-items: center;
  }
  .bi-lightbox__frame img {
    max-width: 92vw;
  }
  .bi-lightbox__aside {
    flex: 0 0 auto;
    width: 92vw;
    max-height: 26vh;
  }
}
.bi-lightbox__caption {
  margin: 0;
  text-align: center;
  color: var(--ink-text-muted);
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.04em;
}
@keyframes bi-lightbox-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.bi-lightbox__backdrop[data-state='open'],
.bi-lightbox[data-state='open'] {
  animation: bi-lightbox-fade 0.16s ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .bi-lightbox__backdrop,
  .bi-lightbox {
    animation: none;
  }
}
</style>
