<script setup lang="ts">
// Drei Dimensionen als stille Hairline-Zeilen (Frontend 1.5, Landing F):
// jede Zeile ist ein natives <details> (Progressive Disclosure ohne JS).
// Kein Meter, kein Balken — nur Score + Statuswort + Severity-Punkt
// (Doppelkodierung Farbe + Wort, Goldstandard). Werte sind ILLUSTRATIV
// (kein analysiertes Bild), die Fussnote sagt das explizit.

interface DimRow {
  key: string
  name: string
  kw: string
  desc: string
  detail: string
  sev: 'ok' | 'warn' | 'crit'
  score: number
  word: string
}

const DIMS: DimRow[] = [
  {
    key: 'physics',
    name: 'Physik',
    kw: 'Licht · Schatten · Anatomie · Materialien',
    desc: 'Stimmen Lichtrichtung, Schatten, Proportionen und Materialien?',
    detail:
      'Stimmen Lichtrichtung, Schattenwurf, Proportionen und Materialeigenschaften? '
      + 'Hier zeigt sich, ob ein Bild der Realität widerspricht, ohne dass es auffällt.',
    sev: 'ok',
    score: 78,
    word: 'OK',
  },
  {
    key: 'semantics',
    name: 'Semantik',
    kw: 'Szenenlogik · Prompt-Passung · Kontext',
    desc: 'Ergibt die Szene Sinn, und passt sie zu deinem Einsatz?',
    detail:
      'Ergibt die Szene als Ganzes Sinn, und passt sie zu dem, wofür du das Bild '
      + 'einsetzen willst? Hier prüfen wir, ob das Bild inhaltlich hält, was sein '
      + 'Eindruck verspricht.',
    sev: 'warn',
    score: 61,
    word: 'WARN',
  },
  {
    key: 'bias',
    name: 'Bias',
    kw: 'Stereotype · Rollenbesetzung · Repräsentation',
    desc: 'Welche Klischees trägt das Bild – in Rollen, Posen, wer was darf?',
    detail:
      'Welche Klischees und sozialen Verzerrungen trägt das Bild – in Rollen, Posen, '
      + 'wer was darf? Das ist der heikelste Teil, weil er sich am leichtesten '
      + 'übersehen lässt.',
    sev: 'crit',
    score: 38,
    word: 'CRIT',
  },
]
</script>

<template>
  <div>
    <div
      class="dims"
      role="group"
      aria-label="Drei Prüf-Dimensionen mit illustrativen Beispiel-Scores (kein analysiertes Bild)"
    >
      <details v-for="d in DIMS" :key="d.key" class="dim" :data-sev="d.sev">
        <summary>
          <span class="dim__id">
            <span class="dim__name">{{ d.name }}</span>
            <span class="dim__kw">{{ d.kw }}</span>
          </span>
          <span class="dim__desc" aria-hidden="true">{{ d.desc }}</span>
          <span class="dim__status">
            <span class="dim__pt" aria-hidden="true" />
            <span class="dim__score"><span class="sr-only">Beispiel-Score </span>{{ d.score }}<span class="sr-only"> von 100</span></span>
            <span class="dim__word"><span class="sr-only">Status </span>{{ d.word }}</span>
            <span class="dim__pm" aria-hidden="true" />
          </span>
        </summary>
        <div class="dim__detail">
          <p>{{ d.detail }}</p>
        </div>
      </details>
    </div>

    <div class="dims__scale" aria-hidden="true">
      <span>Skala 0–100</span>
      <span>illustrative Beispielwerte – kein analysiertes Bild</span>
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
.dims {
  margin-top: clamp(34px, 5vw, 52px);
  text-align: left;
}
.dim {
  border-top: 1px solid var(--line-soft);
}
.dims .dim:last-of-type {
  border-bottom: 1px solid var(--line-soft);
}
.dim > summary {
  list-style: none;
  cursor: pointer;
  display: grid;
  grid-template-columns: 1fr auto auto;
  column-gap: clamp(14px, 2.4vw, 28px);
  align-items: center;
  padding: clamp(18px, 2.6vw, 24px) 4px;
}
.dim > summary::-webkit-details-marker {
  display: none;
}
.dim__id {
  min-width: 0;
}
.dim__name {
  font-weight: 600;
  font-size: clamp(17px, 1.9vw, 19px);
  letter-spacing: -0.01em;
  color: var(--ink);
}
.dim__kw {
  display: block;
  margin-top: 4px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10.5px;
  letter-spacing: 0.03em;
  color: var(--muted);
}
.dim__desc {
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--muted);
  max-width: 30ch;
  justify-self: end;
  text-align: right;
}
/* Score + Statuswort dürfen NIE getrennt umbrechen (Doppelkodierung) */
.dim__status {
  display: inline-flex;
  align-items: baseline;
  gap: 9px;
  justify-self: end;
  white-space: nowrap;
}
.dim__score {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: clamp(22px, 3vw, 28px);
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}
.dim__word {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.07em;
}
.dim__pt {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex: none;
  align-self: center;
}
.dim[data-sev='ok'] .dim__word { color: var(--safe-ink); }
.dim[data-sev='warn'] .dim__word { color: var(--warn-ink); }
.dim[data-sev='crit'] .dim__word { color: var(--crit-ink); }
.dim[data-sev='ok'] .dim__pt { background: var(--safe); }
.dim[data-sev='warn'] .dim__pt { background: var(--warn); }
.dim[data-sev='crit'] .dim__pt { background: var(--crit); }
/* eigener +/–-Marker statt Default-Dreieck */
.dim__pm {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 15px;
  color: var(--subtle);
  width: 1ch;
  text-align: center;
  align-self: center;
}
.dim[open] .dim__pm {
  color: var(--ink-soft);
}
.dim__pm::after {
  content: '+';
}
.dim[open] .dim__pm::after {
  content: '\2013'; /* Halbgeviertstrich */
}
.dim__detail {
  padding: 0 4px clamp(18px, 2.4vw, 24px) 4px;
}
.dim__detail p {
  color: var(--ink-soft);
  font-size: 14px;
  line-height: 1.62;
  max-width: 56ch;
}
.dims__scale {
  margin-top: 16px;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.dims__scale span {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10.5px;
  letter-spacing: 0.06em;
  color: var(--subtle);
  font-variant-numeric: tabular-nums;
}
@media (max-width: 719px) {
  /* Beschreibung unter Name/Score stapeln; Score+Statuswort bleiben zusammen */
  .dim > summary {
    grid-template-columns: 1fr auto;
    column-gap: 14px;
    row-gap: 10px;
    padding: 18px 2px;
  }
  .dim__desc {
    grid-column: 1 / -1;
    justify-self: start;
    text-align: left;
    max-width: none;
    order: 3;
  }
  .dim__status { order: 2; }
  .dim__pm { order: 1; }
}
</style>
