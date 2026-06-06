<script setup lang="ts">
// Landing / index (landing-spec.md + landing.html · content/landing.md) – Startseite.
// Skip-Link, AppHeader und AppFooter liefert das default-Layout; diese Seite liefert
// NUR den Inhalt (kein eigenes <main>, keinen aktiven Nav-Zustand – das regelt
// layouts/default.vue via route.path).
//
// Der Hero-Anker ist eine rein ILLUSTRATIVE, seitenlokale Komposition (zwei Marker
// auf einer Skala + Einmal-Animation). Werte (86/64/+22) sind statisch hartkodiert,
// KEIN AnalysisViewModel und NICHT die generische ScoreBar (die kennt nur einen
// value-Marker) – landing-spec §2/§8, Prototyp-Goldstandard.
import Button from '~/components/ui/Button.vue'
import Card from '~/components/ui/Card.vue'

useHead({
  title: 'SemantIC – Überzeugend ist nicht genug.',
  meta: [
    {
      name: 'description',
      content:
        'SemantIC prüft KI-generierte Bilder vor der Veröffentlichung auf physikalische Kohärenz, semantische Konsistenz und Bias.',
    },
  ],
})
</script>

<template>
  <!-- ================= HERO ================= -->
  <section class="hero" aria-labelledby="hero-headline">
    <div class="hero__inner">
      <!-- Wort-Spalte -->
      <div class="hero__lead">
        <p class="hero__kicker"><span class="dot" aria-hidden="true" />AI Visual Integrity Validator</p>
        <h1 id="hero-headline" class="hero__headline">Überzeugend ist <span class="hero__nowrap">nicht genug<span class="dot-end">.</span></span></h1>
        <p class="hero__subline">
          SemantIC prüft KI-generierte Bilder vor der Veröffentlichung auf physikalische
          Kohärenz, semantische Konsistenz und Bias – und zeigt, ob ein Bild auch
          inhaltlich hält, was sein Eindruck verspricht.
        </p>
        <div class="hero__cta">
          <Button as="a" href="/analyze" variant="primary" size="md">
            Bild prüfen <span class="arrow" aria-hidden="true">→</span>
          </Button>
          <Button as="a" href="/how-it-works" variant="ghost" size="md" class="hero__ghost">
            Wie das funktioniert
          </Button>
        </div>
        <p class="hero__micro">Kein Upload-Konto, keine Speicherung. Du legst ein Bild ab, du bekommst einen Befund.</p>
      </div>

      <!-- Visueller Anker: illustrative Maskierungs-Anzeige (kein ViewModel) -->
      <div
        class="anchor anim"
        role="img"
        aria-label="Schematische Befund-Anzeige: die Ästhetik liegt bei 86 von 100, die inhaltliche Integrität bei 64 von 100. Die Differenz von 22 Punkten ist der Maskierungs-Score, Verdikt: mittlere Tendenz."
      >
        <div class="anchor__strip" aria-hidden="true">
          <span>SemantIC · Befund</span>
          <span class="marks"><i class="safe" /><i class="warn" /><i class="crit" /></span>
        </div>
        <div class="anchor__body" aria-hidden="true">
          <p class="anchor__lab">&gt; Bild im Vergleich</p>

          <div class="gauge">
            <div class="gauge__row">
              <span class="gauge__key">Ästhetik · wie es wirkt</span>
              <span class="gauge__val">86<span class="den"> / 100</span></span>
            </div>
          </div>

          <div class="gauge">
            <div class="gauge__row">
              <span class="gauge__key">Integrität · was hält</span>
              <span class="gauge__val">64<span class="den"> / 100</span></span>
            </div>
            <div class="scorebar">
              <div class="seg crit" />
              <div class="seg warn" />
              <div class="seg ok" />
              <span class="marker marker--aesthetic" />
              <span class="marker marker--integrity" />
            </div>
            <div class="scale">
              <span class="s1">0<b>Crit</b></span>
              <span class="s2">40<b>Warn</b></span>
              <span class="s3">70<b>OK</b></span>
              <span class="s4">100</span>
            </div>
          </div>

          <div class="anchor__result">
            <span class="label">Maskierungs-Score · Δ</span>
            <span class="anchor__delta">
              <span class="num">+22</span>
              <span class="anchor__badge">mittlere Tendenz</span>
            </span>
          </div>
          <p class="anchor__caption">
            Sieht besser aus, als es ist – die Oberfläche zieht den Blick von den Schwächen weg.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- ================= SEKTION 1 – Das Problem ================= -->
  <section class="section section--surface" aria-labelledby="s1-head">
    <div class="section__inner section__inner--text">
      <p class="eyebrow">Der blinde Fleck</p>
      <h2 id="s1-head" class="section__head">Ein Bild kann perfekt aussehen und trotzdem nicht stimmen.</h2>
      <p class="section__body">
        KI-Bildgeneratoren sind gut darin, Bilder schön zu machen: scharf, farbig,
        stimmungsvoll. Sie sind deutlich schlechter darin, Bilder <em>richtig</em> zu machen –
        physikalisch plausibel, inhaltlich passend, frei von Klischees. Das Problem ist
        nicht, dass diese Schwächen fehlen. Das Problem ist, dass die visuelle
        Perfektion sie überdeckt. Ein Bild wirkt so überzeugend, dass du gar nicht erst
        hinschaust, ob es auch hält. Genau diesen Effekt nennen wir Maskierung – und
        genau ihn macht SemantIC sichtbar.
      </p>
    </div>
  </section>

  <!-- ================= SEKTION 2 – Drei Dimensionen ================= -->
  <section class="section section--canvas" aria-labelledby="s2-head">
    <div class="section__inner">
      <p class="eyebrow">Drei Dimensionen</p>
      <h2 id="s2-head" class="section__head">Was wir uns ansehen.</h2>
      <p class="section__body">
        Jedes Bild läuft durch dieselben drei Prüfungen. Du siehst pro Dimension einen
        Score und ein Wort – grün, gelb oder rot – und kannst jeden Befund bis ins
        Detail aufklappen.
      </p>

      <div class="dim-grid">
        <Card as="article" tone="paper" border="hair" padding="md">
          <h3 class="dim-card__title">Physik</h3>
          <p class="dim-card__sub">Licht · Schatten · Anatomie · Materialien</p>
          <div class="dim-card__rule" aria-hidden="true" />
          <p class="dim-card__text">
            Stimmen Lichtrichtung, Schattenwurf, Proportionen und Materialeigenschaften?
            Hier zeigt sich, ob ein Bild der Realität widerspricht, ohne dass es auffällt.
          </p>
        </Card>

        <Card as="article" tone="paper" border="hair" padding="md">
          <h3 class="dim-card__title">Semantik</h3>
          <p class="dim-card__sub">Szenenlogik · Prompt-Passung · Kontext</p>
          <div class="dim-card__rule" aria-hidden="true" />
          <p class="dim-card__text">
            Ergibt die Szene als Ganzes Sinn, und passt sie zu dem, wofür du das Bild
            einsetzen willst? Hier prüfen wir, ob das Bild inhaltlich hält, was sein
            Eindruck verspricht.
          </p>
        </Card>

        <Card as="article" tone="paper" border="hair" padding="md">
          <h3 class="dim-card__title">Bias</h3>
          <p class="dim-card__sub">Stereotype · Rollenbesetzung · Repräsentation</p>
          <div class="dim-card__rule" aria-hidden="true" />
          <p class="dim-card__text">
            Welche Klischees und sozialen Verzerrungen trägt das Bild – in Rollen, Posen,
            wer was darf? Das ist der heikelste Teil, weil er sich am leichtesten
            übersehen lässt.
          </p>
        </Card>
      </div>
    </div>
  </section>

  <!-- ================= SEKTION 3 – Der Maskierungs-Score ================= -->
  <section class="section section--surface" aria-labelledby="s3-head">
    <div class="section__inner section__inner--text">
      <p class="eyebrow">Die Differenz</p>
      <h2 id="s3-head" class="section__head">Die Lücke zwischen schön und stimmig.</h2>
      <p class="section__body">
        Neben den drei Dimensionen rechnet SemantIC eine eigene Kennzahl aus: den
        Maskierungs-Score. Er ist die Differenz zwischen der visuellen Wirkung eines
        Bildes und seiner inhaltlichen Integrität. Ein hoher Wert bedeutet: Das Bild
        sieht besser aus, als es ist – die Oberfläche zieht den Blick weg von den
        Schwächen. Diese Differenz steht nirgends sonst. Sie ist der Kern dessen, was
        SemantIC von einem reinen Qualitäts-Check unterscheidet.
      </p>
    </div>
  </section>

  <!-- ================= SEKTION 4 – Was SemantIC nicht ist ================= -->
  <section class="section section--canvas" aria-labelledby="s4-head">
    <div class="section__inner section__inner--text">
      <Card tone="sunken" border="none" padding="lg" class="contrast-card border-[1.5px] border-line-strong">
        <p class="eyebrow">Zur Einordnung</p>
        <h2 id="s4-head" class="section__head">Kein Echtheits-Detektor.</h2>
        <p class="section__body">
          SemantIC sagt dir nicht, ob ein Bild „echt" oder „KI" ist – diese Frage
          beantwortet es bewusst nicht. Es sortiert auch nicht in „Fake" und „nicht Fake".
          SemantIC setzt eine Ebene tiefer an: Es bewertet die <em>Qualität</em> eines bereits
          als KI-generiert bekannten Bildes. Schlechte KI gegen gute KI, nicht Fälschung
          gegen Wahrheit. Und jeder Befund ist ein Hinweis, kein Urteil – du entscheidest,
          ob das Bild in deinen Kontext passt.
        </p>
      </Card>
    </div>
  </section>

  <!-- ================= SEKTION 5 – Woher die Prüflogik kommt ================= -->
  <section class="section section--surface" aria-labelledby="s5-head">
    <div class="section__inner section__inner--text">
      <p class="eyebrow">Forschungsbasiert</p>
      <h2 id="s5-head" class="section__head">Aus einer eigenen Bildanalyse, nicht aus Bauchgefühl.</h2>
      <p class="section__body">
        Die Kriterien, nach denen SemantIC prüft, sind nicht beliebig. Sie stammen aus
        einer qualitativen Inhaltsanalyse von 144 KI-generierten Bildern – Lesearten,
        wiederkehrende Fehlerprofile, visuelle Treiber. Diese Forschung ist der
        praktische Teil einer Bachelorarbeit zu Visual Bias im KI-generierten Bild und
        steckt direkt in der Prüflogik. Wie das im Detail funktioniert, liest du auf der
        Erklärseite.
      </p>
      <p class="section__link">
        <NuxtLink to="/how-it-works" class="inline-link">
          So funktioniert die Prüfung <span class="arrow" aria-hidden="true">→</span>
        </NuxtLink>
      </p>
    </div>
  </section>

  <!-- ================= SCHLUSS-CTA ================= -->
  <section class="closer" aria-labelledby="closer-head">
    <div class="closer__inner">
      <h2 id="closer-head" class="closer__head">Prüf dein Bild, bevor es jemand anders tut<span class="dot-end">.</span></h2>
      <p class="closer__body">Ein Bild ablegen, kurz warten, einen Befund lesen. Keine Anmeldung.</p>
      <div class="closer__cta">
        <Button as="a" href="/analyze" variant="inverse" size="md">
          Jetzt ein Bild prüfen <span class="arrow" aria-hidden="true">→</span>
        </Button>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ============================================================ */
/* HERO – zwei Spalten: links Wort, rechts illustrativer Anker  */
/* ============================================================ */
.hero {
  background: var(--page-bg);
}
.hero__inner {
  max-width: var(--container);
  margin-inline: auto;
  padding: clamp(48px, 9vh, 96px) var(--gutter) clamp(40px, 7vh, 72px);
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: clamp(36px, 5vw, 72px);
  align-items: center;
}
.hero__lead {
  max-width: 34ch;
}
.hero__kicker {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 500;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--subtle);
  margin-bottom: 20px;
  display: inline-flex;
  align-items: center;
  gap: 9px;
}
.hero__kicker .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--ink);
}
.hero__headline {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(40px, 6.2vw, 68px);
  line-height: 0.98;
  letter-spacing: -0.035em;
  color: var(--ink);
}
.dot-end {
  color: var(--accent);
}
/* hält „nicht genug." zusammen (Goldstandard-Umbruchschutz), ohne &nbsp; im
   Text-String – Headline bleibt string-exakt „Überzeugend ist nicht genug.". */
.hero__nowrap {
  white-space: nowrap;
}
.hero__subline {
  margin-top: 22px;
  font-size: clamp(15px, 1.5vw, 17px);
  line-height: 1.55;
  color: var(--ink-soft);
  max-width: 46ch;
}
.hero__cta {
  margin-top: 30px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
}
/* Hero-Sekundär (ghost) prototyptreu unterstrichen (Goldstandard .btn--ghost). */
.hero__ghost {
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: var(--line-strong);
}
.hero__ghost:hover {
  text-decoration-color: var(--ink);
}
.arrow {
  display: inline-block;
}
.hero__micro {
  margin-top: 18px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 12px;
  letter-spacing: 0.02em;
  color: var(--muted);
  line-height: 1.6;
  max-width: 42ch;
}

/* ---- HERO-ANKER (illustrativ, seitenlokal – KEINE ScoreBar-Komponente) ---- */
.anchor {
  background: var(--surface);
  border: 1.5px solid var(--ink);
  border-radius: var(--r);
  overflow: hidden;
}
.anchor__strip {
  background: var(--ink);
  color: var(--surface);
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 500;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 9px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.anchor__strip .marks {
  display: flex;
  gap: 5px;
}
.anchor__strip .marks i {
  width: 9px;
  height: 9px;
  border-radius: 2px;
  display: block;
}
.anchor__strip .marks .safe {
  background: var(--safe);
}
.anchor__strip .marks .warn {
  background: var(--warn);
}
.anchor__strip .marks .crit {
  background: var(--crit);
}
.anchor__body {
  padding: 22px 22px 24px;
}
.anchor__lab {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-soft);
  margin-bottom: 14px;
}
.gauge {
  margin-bottom: 18px;
}
.gauge__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  margin-bottom: 7px;
}
.gauge__key {
  font-weight: 500;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}
.gauge__val {
  font-weight: 600;
  font-size: 15px;
  color: var(--ink);
}
.gauge__val .den {
  font-weight: 500;
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 0.04em;
}
/* lokale Severity-Balken-Geometrie (Goldstandard, zwei Marker auf einer Skala) */
.scorebar {
  position: relative;
  display: grid;
  grid-template-columns: 40fr 30fr 30fr;
  border: 1.5px solid var(--ink);
  height: 20px;
  border-radius: 2px;
  background: var(--canvas);
  overflow: hidden;
}
.scorebar .seg {
  border-right: 1px solid var(--ink);
}
.scorebar .seg:last-child {
  border-right: none;
}
.scorebar .seg.crit {
  background: var(--crit);
}
.scorebar .seg.warn {
  background: var(--warn);
}
.scorebar .seg.ok {
  background: var(--safe);
}
.scorebar .marker {
  position: absolute;
  top: -6px;
  bottom: -6px;
  width: 3px;
  background: var(--ink);
  z-index: 3;
  transform: translateX(-50%);
}
.scorebar .marker--aesthetic {
  left: 86%;
}
.scorebar .marker--integrity {
  left: 64%;
  opacity: 0.55;
}
.scale {
  position: relative;
  height: 14px;
  margin-top: 8px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--ink-soft);
}
.scale span {
  position: absolute;
  white-space: nowrap;
}
.scale .s1 {
  left: 0;
}
.scale .s2 {
  left: 40%;
  transform: translateX(-50%);
}
.scale .s3 {
  left: 70%;
  transform: translateX(-50%);
}
.scale .s4 {
  right: 0;
}
.scale b {
  font-weight: 700;
  margin-left: 3px;
}
.scale .s1 b {
  color: var(--crit-ink);
}
.scale .s2 b {
  color: var(--warn-ink);
}
.scale .s3 b {
  color: var(--safe-ink);
}
.anchor__result {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
}
.anchor__result .label {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 500;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}
.anchor__delta {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.anchor__delta .num {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: 30px;
  letter-spacing: -0.02em;
  line-height: 1;
  color: var(--ink);
}
.anchor__badge {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 5px 9px;
  border-radius: 3px;
  border: 1px solid var(--ink);
  background: var(--warn);
  color: var(--ink);
  display: inline-flex;
  align-items: center;
  line-height: 1;
}
.anchor__caption {
  margin-top: 14px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--muted);
}

/* ---- Hero-Anker: ruhige Einmal-Animation (integrity-Marker fährt 86→64) ---- */
@keyframes integritySettle {
  0% {
    left: 86%;
    opacity: 0;
  }
  25% {
    opacity: 0.55;
  }
  100% {
    left: 64%;
    opacity: 0.55;
  }
}
@keyframes deltaReveal {
  0%,
  18% {
    opacity: 0;
    transform: translateY(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.anim .scorebar .marker--integrity {
  animation: integritySettle 1.9s cubic-bezier(0.22, 0.61, 0.36, 1) 0.35s both;
}
.anim .anchor__delta,
.anim .anchor__badge,
.anim .anchor__caption {
  animation: deltaReveal 1.4s ease 0.9s both;
}
@media (prefers-reduced-motion: reduce) {
  .anim .scorebar .marker--integrity {
    animation: none;
    left: 64%;
    opacity: 0.55;
  }
  .anim .anchor__delta,
  .anim .anchor__badge,
  .anim .anchor__caption {
    animation: none;
    opacity: 1;
    transform: none;
  }
}

/* ============================================================ */
/* HINFÜHRUNGS-SEKTIONEN (eine Aufgabe pro Sektion)             */
/* ============================================================ */
.section {
  border-top: 1px solid var(--line);
}
.section--surface {
  background: var(--surface);
}
.section--canvas {
  background: var(--canvas);
}
.section__inner {
  max-width: var(--container);
  margin-inline: auto;
  padding: clamp(56px, 8vh, 88px) var(--gutter);
}
.section__inner--text {
  max-width: var(--container-text);
}
.eyebrow {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 500;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--subtle);
  margin-bottom: 16px;
}
.section__head {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(24px, 3vw, 34px);
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--ink);
  max-width: 20ch;
}
.section__body {
  margin-top: 18px;
  font-size: 16px;
  line-height: 1.62;
  color: var(--ink-soft);
  max-width: 62ch;
}
.section__body em {
  font-style: italic;
  color: var(--ink);
}
.section__link {
  margin-top: 22px;
}
.inline-link {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 600;
  font-size: 15px;
  color: var(--ink);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: var(--line-strong);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.inline-link:hover {
  text-decoration-color: var(--ink);
}

/* ---- Drei-Dimensionen-Karten (Card liefert Fläche/Border, Typo lokal) ---- */
.dim-grid {
  margin-top: 32px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}
.dim-card__title {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: 19px;
  letter-spacing: -0.01em;
  color: var(--ink);
}
.dim-card__sub {
  margin-top: 7px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 500;
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--muted);
  line-height: 1.5;
}
.dim-card__rule {
  height: 1px;
  background: var(--line-soft);
  margin: 16px 0;
}
.dim-card__text {
  font-size: 14px;
  line-height: 1.58;
  color: var(--ink-soft);
}

/* ---- Kontrast-Karte „Was es nicht ist" (Flächenwechsel, kein Links-Akzent) ---- */
.contrast-card .eyebrow {
  margin-bottom: 14px;
}
.contrast-card .section__head {
  max-width: 24ch;
}
.contrast-card .section__body {
  max-width: 60ch;
}

/* ============================================================ */
/* SCHLUSS-CTA                                                   */
/* ============================================================ */
.closer {
  background: var(--ink);
  color: var(--surface);
  border-top: 1px solid var(--line);
}
.closer__inner {
  max-width: var(--container);
  margin-inline: auto;
  padding: clamp(56px, 8vh, 84px) var(--gutter);
  text-align: center;
}
.closer__head {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(26px, 3.4vw, 40px);
  line-height: 1.08;
  letter-spacing: -0.03em;
  color: var(--surface);
  max-width: 22ch;
  margin-inline: auto;
}
.closer__head .dot-end {
  color: var(--crit);
}
.closer__body {
  margin-top: 16px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 13px;
  letter-spacing: 0.02em;
  color: var(--line);
  line-height: 1.6;
}
.closer__cta {
  margin-top: 30px;
}

/* ============================================================ */
/* RESPONSIVE                                                    */
/* ============================================================ */
@media (max-width: 899px) {
  .hero__inner {
    grid-template-columns: 1fr;
    gap: 36px;
  }
  .hero__lead {
    max-width: none;
  }
  .anchor {
    max-width: 520px;
  }
  .dim-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}
@media (max-width: 719px) {
  .hero__cta {
    flex-direction: column;
    align-items: stretch;
  }
  .hero__cta :deep(a) {
    width: 100%;
  }
  .anchor__result {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media print {
  .closer {
    display: none;
  }
  .hero,
  .section {
    background: #fff;
  }
}
</style>
