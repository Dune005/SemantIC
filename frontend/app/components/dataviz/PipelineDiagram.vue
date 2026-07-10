<script setup lang="ts">
// PipelineDiagram (Frontend 1.7, §2) – „Zwei Blicke auf dasselbe Bild".
// Ablauf: Eingabe → ZWEI getrennte, PARALLELE Prüfungen (Gemini = Inhalt/Integrität,
// Claude + LAION-Referenz = Ästhetik; CLIP läuft als reines Diagnosesignal mit und
// bleibt hier bewusst aus dem Diagramm – Details in der Figure-Note der Seite).
// Semantik (Codex): natives <ol> mit
// vier Schritten; die parallelen Prüfungen sind EIN Schritt mit zwei Spuren – nicht
// zwei aufeinanderfolgende. KEIN role="img" über dem Ganzen (echte Struktur bleibt).
// Logos: stilisierte Platzhalter in den Dimensionsfarben (warm = Inhalt, kühl = Ästhetik).
// Offizielle Marken-Logos erst nach Brand-Guideline-Prüfung – Figure-Note „modellagnostisch".
// Reine statische Erklärgrafik, keine Live-Daten, keine Animation.
</script>

<template>
  <ol class="flow" role="list">
    <li class="flow__step">
      <div class="flow__node">
        <p class="flow__k">Eingabe</p>
        <p class="flow__t">Dein Bild</p>
        <p class="flow__s">+ optional Nutzungskontext &amp; Original-Prompt</p>
      </div>
    </li>

    <li class="flow__step">
      <p class="flow__splitlabel">Zwei getrennte Prüfungen · <span>parallel</span></p>
      <div class="flow__split" role="group" aria-label="Zwei parallele, getrennte Modell-Prüfungen">
        <div class="lane lane--warm">
          <p class="lane__tag"><span class="lane__dot" aria-hidden="true" />Prüfung 1 · Inhalt</p>
          <div class="lane__model">
            <svg class="lane__logo" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 1c0 6.075 4.925 11 11 11-6.075 0-11 4.925-11 11 0-6.075-4.925-11-11-11 6.075 0 11-4.925 11-11Z" fill="currentColor" />
            </svg>
            <span class="lane__name">Gemini</span>
          </div>
          <p class="lane__body">
            <b>Integritäts-Analyse:</b> 3 Dimensionen (Physik · Semantik · Bias) plus Research
            Layer → Integritäts-Score.
          </p>
        </div>

        <div class="lane lane--cool">
          <p class="lane__tag"><span class="lane__dot" aria-hidden="true" />Prüfung 2 · Oberfläche</p>
          <div class="lane__model">
            <svg class="lane__logo" viewBox="0 0 24 24" aria-hidden="true">
              <g fill="currentColor">
                <rect x="11.15" y="2.2" width="1.7" height="6.4" rx=".85" />
                <rect x="11.15" y="2.2" width="1.7" height="6.4" rx=".85" transform="rotate(30 12 12)" />
                <rect x="11.15" y="2.2" width="1.7" height="6.4" rx=".85" transform="rotate(60 12 12)" />
                <rect x="11.15" y="2.2" width="1.7" height="6.4" rx=".85" transform="rotate(90 12 12)" />
                <rect x="11.15" y="2.2" width="1.7" height="6.4" rx=".85" transform="rotate(120 12 12)" />
                <rect x="11.15" y="2.2" width="1.7" height="6.4" rx=".85" transform="rotate(150 12 12)" />
                <rect x="11.15" y="2.2" width="1.7" height="6.4" rx=".85" transform="rotate(180 12 12)" />
                <rect x="11.15" y="2.2" width="1.7" height="6.4" rx=".85" transform="rotate(210 12 12)" />
                <rect x="11.15" y="2.2" width="1.7" height="6.4" rx=".85" transform="rotate(240 12 12)" />
                <rect x="11.15" y="2.2" width="1.7" height="6.4" rx=".85" transform="rotate(270 12 12)" />
                <rect x="11.15" y="2.2" width="1.7" height="6.4" rx=".85" transform="rotate(300 12 12)" />
                <rect x="11.15" y="2.2" width="1.7" height="6.4" rx=".85" transform="rotate(330 12 12)" />
              </g>
            </svg>
            <span class="lane__name">Claude</span>
          </div>
          <p class="lane__body">
            <b>Ästhetik-Bewertung:</b> nur die visuelle Wirkung, abgeglichen mit einem
            unabhängigen Referenzmodell → Ästhetik-Score.
          </p>
        </div>
      </div>
      <p class="flow__merge">
        <span class="flow__w">Wirkung</span> und <span class="flow__sub">Substanz</span> werden
        erst hier zusammengeführt – nie vorher.
      </p>
    </li>

    <li class="flow__step">
      <div class="flow__node">
        <p class="flow__k">Zusammenführung</p>
        <p class="flow__t">Wirkung vs. Substanz</p>
        <p class="flow__s">Abgleich Ästhetik ↔ Integrität → Maskierungs-Hinweise (keine einzelne Kennzahl).</p>
      </div>
    </li>

    <li class="flow__step">
      <div class="flow__node">
        <p class="flow__k">Befund</p>
        <p class="flow__t">Dein Ergebnis</p>
        <p class="flow__s">Ampel · 3 Dimensionen · Leseart · Hinweise.</p>
      </div>
    </li>
  </ol>
</template>

<style scoped>
.flow {
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;
}
.flow__step {
  position: relative;
}
.flow__step + .flow__step {
  margin-top: 26px;
}
/* Connector NUR in den Lücken zwischen den Schritten – nie hinter Text (Codex):
   kurze Mittellinie im 26px-Abstand statt eines durchgehenden Stamms, der sonst
   hinter Split-Label und Merge-Text läge. */
.flow__step + .flow__step::before {
  content: '';
  position: absolute;
  left: 50%;
  top: -26px;
  width: 2px;
  height: 26px;
  transform: translateX(-50%);
  background: var(--line-strong);
}

.flow__node {
  position: relative;
  margin: 0 auto;
  max-width: 520px;
  padding: 20px 24px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r);
  text-align: center;
}
.flow__k {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--subtle);
  margin: 0 0 8px;
}
.flow__t {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 600;
  font-size: 21px;
  line-height: 1.1;
  letter-spacing: -0.01em;
  margin: 0 0 6px;
  color: var(--ink);
}
.flow__s {
  font-size: 14px;
  color: var(--muted);
  margin: 0;
}

.flow__splitlabel {
  text-align: center;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--subtle);
  margin: 0 0 14px;
}
.flow__splitlabel span {
  color: var(--ink-soft);
}

.flow__split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  max-width: 720px;
  margin: 0 auto;
}
.lane {
  position: relative;
  padding: 20px 20px 22px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r);
}
.lane__tag {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin: 0 0 14px;
}
.lane--warm .lane__tag {
  color: var(--substance);
}
.lane--cool .lane__tag {
  color: var(--appeal);
}
.lane__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: 0 0 auto;
}
.lane--warm .lane__dot {
  background: var(--substance);
}
.lane--cool .lane__dot {
  background: var(--appeal);
}
.lane__model {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
/* Logo = stilisierter Platzhalter, neutral (kein Markenlogo). Die Dimensions-
   Zuordnung (warm = Inhalt, kühl = Ästhetik) tragen Dot + Tag, nicht das Logo –
   so wirken die Modelle nicht „rot/grün umrandet". */
.lane__logo {
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  color: var(--ink-soft);
}
.lane__name {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 600;
  font-size: 20px;
  letter-spacing: -0.01em;
  color: var(--ink);
}
.lane__body {
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--muted);
  margin: 0;
}
.lane__body b {
  color: var(--ink);
  font-weight: 500;
}

.flow__merge {
  text-align: center;
  font-size: 14px;
  color: var(--muted);
  margin: 22px auto 0;
  max-width: 46ch;
}
/* Neutral + fett statt dimensionsfarben: --substance fällt auf --page-bg unter AA
   (4.2:1). Die warm/kühl-Zuordnung tragen die Spuren oben; hier reicht Betonung. */
.flow__w,
.flow__sub {
  color: var(--ink);
  font-weight: 600;
}

@media (max-width: 559px) {
  .flow__split {
    grid-template-columns: 1fr;
  }
}
</style>
