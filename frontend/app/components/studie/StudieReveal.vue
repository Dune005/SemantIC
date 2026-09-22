<script setup lang="ts">
// Auflösung (Abschnitt 6, im aufklappbaren Block): die sechs bewerteten Bilder mit je einem
// Satz (Fehler oder «fehlerfrei»), danach die sieben Wahl-Sets. «Fehlerfrei» ist doppelt
// codiert (Wort + Rahmen).
//
// Wahl-Sets (Autor-Entscheid 2026-09-15): Die vier Bilder bleiben als Reihe vergleichbar und
// tragen Nummern 1–4; die Sätze stehen darunter als nummerierte Liste in voller Breite – so
// bleibt der Text auch bei 360 px lesbar, ohne Klick-Interaktion. Optionaler Set-Hinweis
// (pages.studie.s6.setNotes.<id>, leer = ausgeblendet) für Befunde, die das ganze Set betreffen.
//
// Die Sätze zu den einzelnen Bildern sind noch nicht freigegeben (Notiz 05): sie stehen als
// i18n-Platzhalter (pages.studie.s6.pending) und werden sichtbar als ausstehend markiert, bis
// der Autor die Keys pages.studie.s6.images.<id>.text füllt. Struktur aus ~/data/studie.
import { part1Images, choiceSets, thumb } from '~/data/studie'

const { t } = useI18n()
const k = 'pages.studie.s6'
const text = (id: string) => t(`${k}.images.${id}.text`)
const isPending = (id: string) => text(id) === t(`${k}.pending`)
const setNote = (id: string) => t(`${k}.setNotes.${id}`)
</script>

<template>
  <div class="rv">
    <p class="rv__intro">{{ $t(`${k}.intro`) }}</p>

    <h3 class="rv__h3">{{ $t(`${k}.part1Title`) }}</h3>
    <ul class="rv__grid rv__grid--part1" role="list">
      <li v-for="img in part1Images" :key="img.id" class="rv__item" :class="{ 'is-clean': img.coherent }">
        <div class="rv__frame" :style="{ aspectRatio: `${img.width} / ${img.height}` }">
          <img :src="thumb(img.id)" :alt="$t(`${k}.images.${img.id}.alt`)" :width="img.width" :height="img.height" loading="lazy" decoding="async" />
        </div>
        <p v-if="img.coherent" class="rv__text"><span class="rv__badge">{{ $t(`${k}.errorFree`) }}</span></p>
        <p v-else class="rv__text" :class="{ 'is-pending': isPending(img.id) }">{{ text(img.id) }}</p>
      </li>
    </ul>

    <h3 class="rv__h3">{{ $t(`${k}.part2Title`) }}</h3>
    <ol class="rv__sets" role="list">
      <li v-for="(set, n) in choiceSets" :key="set.id" class="rv__set">
        <p class="rv__setHead">
          <span class="rv__setIndex">{{ String(n + 1).padStart(2, '0') }}</span>
          <span class="rv__setTitle">{{ $t(`${k}.sets.${set.id}`) }}</span>
        </p>
        <p v-if="setNote(set.id)" class="rv__setNote">{{ setNote(set.id) }}</p>
        <ul class="rv__grid rv__grid--set" role="list">
          <li v-for="(img, i) in set.images" :key="img.id" class="rv__item" :class="{ 'is-clean': img.role === 'control' }">
            <div class="rv__frame" :style="{ aspectRatio: `${img.width} / ${img.height}` }">
              <img :src="thumb(img.id)" :alt="$t(`${k}.images.${img.id}.alt`)" :width="img.width" :height="img.height" loading="lazy" decoding="async" />
              <span class="rv__num" aria-hidden="true">{{ i + 1 }}</span>
            </div>
          </li>
        </ul>
        <ol class="rv__legend" role="list">
          <li v-for="(img, i) in set.images" :key="img.id" class="rv__legendItem" :class="{ 'is-clean': img.role === 'control' }">
            <span class="rv__legendNum">{{ i + 1 }}</span>
            <span v-if="img.role === 'control'" class="rv__badge">{{ $t(`${k}.errorFree`) }}</span>
            <span v-else class="rv__legendText" :class="{ 'is-pending': isPending(img.id) }">{{ text(img.id) }}</span>
          </li>
        </ol>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.rv__intro {
  font-size: 15px;
  line-height: 1.6;
  color: var(--ink-soft);
  max-width: 64ch;
}
.rv__h3 {
  font-family: var(--sans);
  font-weight: 600;
  font-size: 17px;
  letter-spacing: -0.01em;
  color: var(--ink);
  margin-top: 30px;
}
.rv__grid {
  display: grid;
  gap: 20px 16px;
  margin-top: 14px;
  padding: 0;
  list-style: none;
}
.rv__grid--part1 {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}
.rv__grid--set {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}
.rv__frame {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--surface-2);
}
.rv__frame img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
/* Fehlerfrei: Wort (Badge) + Rahmen in --safe – doppelt codiert, nie nur Farbe. */
.rv__item.is-clean .rv__frame {
  border: 2px solid var(--safe);
}
/* Nummer im Bild (oben links) – Bezug zur Liste darunter. */
.rv__num {
  position: absolute;
  top: 6px;
  left: 6px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: color-mix(in srgb, var(--ink) 82%, transparent);
  color: var(--surface);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
}
.rv__item.is-clean .rv__num {
  background: var(--safe);
}
.rv__text {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ink-soft);
}
.is-pending {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--subtle);
}
.rv__badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--r);
  background: color-mix(in srgb, var(--safe) 14%, transparent);
  color: var(--safe-ink);
  font-family: var(--mono);
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.rv__sets {
  margin: 0;
  padding: 0;
  list-style: none;
}
.rv__set {
  padding-top: 22px;
}
.rv__set + .rv__set {
  margin-top: 8px;
  border-top: 1px solid var(--line-soft);
}
.rv__setHead {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.rv__setIndex {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.16em;
  color: var(--subtle);
}
.rv__setTitle {
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
}
.rv__setNote {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--muted);
  max-width: 64ch;
}
/* Satz-Liste unter der Bilderreihe: volle Breite, Nummer als Bezug. */
.rv__legend {
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 6px;
}
.rv__legendItem {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  gap: 10px;
  align-items: baseline;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ink-soft);
}
.rv__legendNum {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
  color: var(--subtle);
  text-align: right;
}
.rv__legendItem.is-clean .rv__legendNum {
  color: var(--safe-ink);
}
/* Badge nicht über die Grid-Spalte strecken. */
.rv__legendItem .rv__badge {
  justify-self: start;
}

@media (max-width: 599px) {
  .rv__grid--set {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
