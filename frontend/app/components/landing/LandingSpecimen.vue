<script setup lang="ts">
// Stilles Specimen (Frontend 1.5, Landing F · Bild seit Lab-D-Übernahme): das
// un-instrumentierte Exponat zwischen Problem-Tafel und Dimensionen — ein
// gerahmter, echter KI-Galeriedruck, der nichts behauptet. Passepartout-
// Schichtung (canvas → Bild mit line-strong-Rahmen), bewusst KEINE Marker,
// Meter oder Befunde. Einziges Motion-Element: ein langsames Ganzflächen-Fade
// (ruhigster Moment der Seite), via useReveal; reduced-motion zeigt sofort
// den Endzustand.
import { useReveal } from '~/composables/useReveal'

const root = ref<HTMLElement | null>(null)
useReveal(root, '.specimen-fade')
</script>

<template>
  <div ref="root" class="specimen-wrap">
    <div class="specimen specimen-fade">
      <h2 id="specimen-title" class="sr-only">Beispiel-Exponat – KI-generiert, bewusst ohne Analyse</h2>
      <div class="specimen__mat">
        <img
          class="specimen__img"
          src="/landing/specimen-werkstatt.webp"
          width="1536"
          height="1072"
          loading="lazy"
          alt="KI-generiertes Beispielbild: Älterer Schreiner arbeitet in seiner Werkstatt an einem Holzbrett, weiches Fensterlicht."
        />
      </div>
      <div class="specimen__card">
        <p>Beispiel-Exponat · KI-generiert · bewusst ohne Befund – die Prüfung beginnt mit deinem Bild</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
.specimen {
  max-width: 520px;
  margin-inline: auto;
}
/* (1) breites Passepartout = canvas, 1px line */
.specimen__mat {
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--canvas);
  padding: clamp(28px, 6vw, 56px);
}
/* (2) der Galeriedruck selbst, 1.5px line-strong als innerer Rahmen */
.specimen__img {
  display: block;
  width: 100%;
  height: auto;
  border: 1.5px solid var(--line-strong);
  border-radius: calc(var(--r) - 1px);
}
/* Museums-Kärtchen: winzig, Mono, klar abgesetzt */
.specimen__card {
  margin-top: clamp(20px, 3vw, 30px);
  text-align: center;
}
.specimen__card p {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.05em;
  line-height: 1.7;
  color: var(--subtle);
  font-variant-numeric: tabular-nums;
  max-width: 46ch;
  margin-inline: auto;
}
/* das eine, langsame Ganzflächen-Fade (Gate: reveal-ready kommt von useReveal) */
.reveal-ready .specimen-fade {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.reveal-ready .specimen-fade.is-in {
  opacity: 1;
  transform: none;
}
@media (prefers-reduced-motion: reduce) {
  .reveal-ready .specimen-fade {
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>
