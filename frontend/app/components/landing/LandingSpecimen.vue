<script setup lang="ts">
// Stilles Specimen (Frontend 1.5, Landing F): das un-instrumentierte Exponat
// zwischen Problem-Tafel und Dimensionen — ein gerahmter Galeriedruck, der
// nichts behauptet. Passepartout-Schichtung aus drei flachen Flächen-Ebenen
// (canvas → surface → Hatch), bewusst KEINE Marker, Meter oder Befunde.
// Einziges Motion-Element: ein langsames Ganzflächen-Fade (ruhigster Moment
// der Seite), via useReveal; reduced-motion zeigt sofort den Endzustand.
import { useReveal } from '~/composables/useReveal'

const root = ref<HTMLElement | null>(null)
useReveal(root, '.specimen-fade')
</script>

<template>
  <div ref="root" class="specimen-wrap">
    <div class="specimen specimen-fade">
      <h2 id="specimen-title" class="sr-only">Beispiel-Exponat – bewusst ohne Analyse</h2>
      <div class="specimen__mat">
        <div
          class="specimen__field"
          role="img"
          aria-label="Leeres, neutrales Bildfeld eines gerahmten Galeriedrucks. Bewusst ohne analysiertes Bild und ohne Befunde."
        />
      </div>
      <div class="specimen__card">
        <p>Beispiel-Exponat · bewusst ohne Befund – die Prüfung beginnt mit deinem Bild</p>
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
/* (2) Bildfeld = surface, 1.5px line-strong · (3) sehr leises Diagonal-Hatch */
.specimen__field {
  aspect-ratio: 4 / 3;
  border: 1.5px solid var(--line-strong);
  border-radius: calc(var(--r) - 1px);
  background:
    repeating-linear-gradient(135deg, transparent 0 26px, rgba(35, 37, 29, 0.018) 26px 27px),
    var(--surface);
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
