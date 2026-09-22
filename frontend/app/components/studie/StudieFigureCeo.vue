<script setup lang="ts">
// Bildbeispiel fl-ceo-02 (Abschnitt 2, nach G3): das Porträt mit markierter Armbanduhr.
// Marker-Idiom aus errorguide/SpecimenFigure (Halo + Ring, non-scaling-stroke, --warn),
// aber als Kreis im echten Bildmass-viewBox (1200×900, kein preserveAspectRatio="none"),
// damit der Kreis rund bleibt. Kein Pin, keine Interaktion, kein Aufdeck-Spiel (Notiz 05).
import { ceoFigure } from '~/data/studie'
</script>

<template>
  <figure class="ceo">
    <div class="ceo__frame" :style="{ aspectRatio: `${ceoFigure.width} / ${ceoFigure.height}` }">
      <img
        :src="ceoFigure.image"
        :alt="$t('pages.studie.figureCeo.alt')"
        :width="ceoFigure.width"
        :height="ceoFigure.height"
        loading="lazy"
        decoding="async"
      />
      <svg class="ceo__overlay" :viewBox="`0 0 ${ceoFigure.width} ${ceoFigure.height}`" aria-hidden="true">
        <circle class="ceo__halo" :cx="ceoFigure.mark.cx" :cy="ceoFigure.mark.cy" :r="ceoFigure.mark.r" />
        <circle class="ceo__ring" :cx="ceoFigure.mark.cx" :cy="ceoFigure.mark.cy" :r="ceoFigure.mark.r" />
      </svg>
    </div>
    <figcaption class="ceo__caption">{{ $t('pages.studie.figureCeo.caption') }}</figcaption>
  </figure>
</template>

<style scoped>
.ceo {
  margin: 28px 0 0;
}
.ceo__frame {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--surface-2);
}
.ceo__frame img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.ceo__overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.ceo__halo {
  fill: none;
  stroke: color-mix(in srgb, var(--ink) 72%, transparent);
  stroke-width: 7;
  vector-effect: non-scaling-stroke;
}
.ceo__ring {
  fill: color-mix(in srgb, var(--warn) 10%, transparent);
  stroke: var(--warn);
  stroke-width: 3;
  vector-effect: non-scaling-stroke;
}
.ceo__caption {
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.55;
  color: var(--muted);
  max-width: 60ch;
}
</style>
