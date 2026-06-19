<script setup lang="ts">
// MoodBand (Frontend 1.7-Feedback) – vollbreiter KI-Moodbild-Streifen. Zwei Rollen:
// als grosszügige „Einstimmung" oben (tall + eager, above the fold) und zur Auflockerung
// der Wall-of-Text zwischen Sektionen (lazy). Muster aus der Landing (.band): Hairline
// oben/unten, dezentes warmes Ton-Overlay, kein Schatten. Das Bild selbst ist dekorativ
// (alt='' + aria-hidden); der Mono-Chip „KI-generiert" bleibt zugänglicher Text
// (F4-Kennzeichnung). Bildquelle: committete /landing/-Assets (NICHT public/lab16/, untracked).
withDefaults(defineProps<{ src: string; chip?: string; tall?: boolean; eager?: boolean }>(), {
  chip: 'KI-generiertes Moodbild',
  tall: false,
  eager: false,
})
</script>

<template>
  <div class="moodband" :class="{ 'moodband--tall': tall }">
    <img
      class="moodband__img"
      :src="src"
      alt=""
      aria-hidden="true"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : 'auto'"
      decoding="async"
    />
    <span class="moodband__tone" aria-hidden="true" />
    <span class="moodband__chip">{{ chip }}</span>
  </div>
</template>

<style scoped>
.moodband {
  position: relative;
  width: 100%;
  height: clamp(190px, 28vh, 340px);
  overflow: hidden;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  background: var(--surface-2);
}
.moodband--tall {
  height: clamp(300px, 46vh, 520px);
}
.moodband__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.moodband__tone {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(rgba(228, 229, 221, 0.12), rgba(228, 229, 221, 0.12));
}
.moodband__chip {
  position: absolute;
  left: 14px;
  bottom: 12px;
  padding: 4px 9px;
  background: var(--canvas);
  border: 1px solid var(--line);
  border-radius: 3px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 9.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
</style>
