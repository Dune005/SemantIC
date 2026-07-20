<script setup lang="ts">
// ErrorSpecimen (umsetzung-1.10) – ein grosses Beispielbild mit direkt sichtbaren, nummerierten
// Markern auf den belegten Fehlerstellen + zugehöriger Erklärliste. Marker + Liste teilen sich
// eine Hervorhebung (Hover/Fokus koppelt Pin ↔ Listeneintrag). Der Bild-Frame selbst steckt in
// der kontrollierten SpecimenFigure; hier lebt nur der statische Zustand (Hover/Klick-Toggle) +
// die Erklärliste. Marker sind bewusst von Anfang an sichtbar (entscheidungen.md §2, kein
// Suchspiel). Diese Komponente ist der statische Mobile-/Print-Fallback der Scroll-Touren.
import type { ErrorSpecimen } from '~/data/error-guide'

const props = defineProps<{ specimen: ErrorSpecimen }>()

// Zwei getrennte Zustände lösen den mouseenter-vor-click-Konflikt (wie BildInspektor):
//  · hoverIndex  – transiente Vorschau (Hover/Fokus), beim Verlassen geleert.
//  · activeIndex – per Klick/Tap angepinnt (Touch ohne Hover), echtes Toggle.
const hoverIndex = ref<number | null>(null)
const activeIndex = ref<number | null>(null)
const shownIndex = computed(() => hoverIndex.value ?? activeIndex.value)

function onHover(i: number | null) {
  hoverIndex.value = i
}
function setListHover(i: number) {
  hoverIndex.value = i
}
function clearListHover(i: number) {
  if (hoverIndex.value === i) hoverIndex.value = null
}
function toggleActive(i: number) {
  activeIndex.value = activeIndex.value === i ? null : i
}
</script>

<template>
  <figure class="specimen">
    <SpecimenFigure
      :specimen="specimen"
      :highlight-index="shownIndex"
      :pressed-index="activeIndex"
      @select="toggleActive"
      @hover="onHover"
    />

    <figcaption class="specimen__caption">{{ $t(`pages.errorGuide.specimens.${specimen.id}.caption`) }}</figcaption>

    <ol class="specimen__list">
      <li
        v-for="(spot, i) in specimen.spots"
        :key="`item-${i}`"
        class="specimen__item"
        :class="{ 'is-active': shownIndex === i }"
        @mouseenter="setListHover(i)"
        @mouseleave="clearListHover(i)"
      >
        <span class="specimen__num" aria-hidden="true">{{ i + 1 }}</span>
        <span class="specimen__body">
          <span class="specimen__title">{{ $t(`pages.errorGuide.specimens.${specimen.id}.spots.${i}.title`) }}</span>
          <span class="specimen__text">{{ $t(`pages.errorGuide.specimens.${specimen.id}.spots.${i}.text`) }}</span>
        </span>
      </li>
    </ol>

    <p class="specimen__source">{{ $t('pages.errorGuide.specimen.source') }}</p>
  </figure>
</template>

<style scoped>
.specimen {
  margin: 0;
}

.specimen__caption {
  margin-top: 10px;
  font-family: var(--mono);
  font-size: 10.5px;
  letter-spacing: 0.04em;
  color: var(--subtle);
}

.specimen__list {
  list-style: none;
  margin: 16px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.specimen__item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--canvas);
  transition: border-color 0.12s ease-out, background 0.12s ease-out;
}
.specimen__item.is-active {
  border-color: var(--warn);
  background: color-mix(in srgb, var(--warn) 7%, var(--canvas));
}
.specimen__num {
  flex: none;
  min-width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: var(--warn);
  color: var(--ink);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
}
.specimen__body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.specimen__title {
  font-family: var(--sans);
  font-weight: 600;
  font-size: 14px;
  color: var(--ink);
}
.specimen__text {
  font-size: 14px;
  line-height: 1.55;
  color: var(--ink-soft);
}

.specimen__source {
  margin-top: 12px;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.04em;
  color: var(--muted);
}

@media (prefers-reduced-motion: reduce) {
  .specimen__item {
    transition: none;
  }
}
</style>
