<script setup lang="ts">
// StudieFigure – gemeinsamer Rahmen der fünf Ergebnisgrafiken auf /studie (Notiz 03,
// «Gestaltungsregeln»): Titel als Aussage-Satz (echter Text, lesbar), Grafik-Körper als
// role="img" mit Alt-Text = Botschaft + Kernzahl (Kinder werden von Screenreadern nicht
// einzeln vorgelesen), Anmerkung in einer Zeile mit der Bezugsbasis. Farben: nur der
// Seiten-Alias --study-accent plus Grau – gesetzt auf dem Seiten-Root in studie.vue.
defineProps<{
  title: string
  aria: string
  note: string
}>()
</script>

<template>
  <figure class="sfig">
    <p class="sfig__title">{{ title }}</p>
    <div class="sfig__body" role="img" :aria-label="aria">
      <slot />
    </div>
    <figcaption class="sfig__note">{{ note }}</figcaption>
  </figure>
</template>

<style scoped>
.sfig {
  margin: 0;
}
.sfig__title {
  font-family: var(--sans);
  font-weight: 600;
  font-size: clamp(16px, 2vw, 18px);
  line-height: 1.4;
  letter-spacing: -0.01em;
  color: var(--ink);
  max-width: 44ch;
}
.sfig__body {
  margin-top: 22px;
}
.sfig__note {
  font-family: var(--mono);
  font-size: 11px;
  line-height: 1.55;
  letter-spacing: 0.04em;
  color: var(--subtle);
  margin-top: 18px;
  max-width: 60ch;
}
</style>
