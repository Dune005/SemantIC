<script setup lang="ts">
// Landing / index — Frontend 1.5, Neukomposition nach Mockup «F – Stille Leinwand»
// (Konzept_Frontend/umsetzung-1.5/landing-F-leinwand.html): eine ruhige Galeriewand
// aus zentrierten, hairline-gerahmten Tafeln, verbunden durch eine Mittel-Hairline.
// Abweichungen vom Mockup (Entscheide 2026-06-10):
//  - Hero = produktisiertes «Mess-Raster» (LandingHero, aus dem Hero-Lab gewählt)
//  - ZWEI dunkle Sektionen für Kontrast (User-Wunsch): «Die Maskierung» (die Seite
//    kippt an ihrem konzeptionellen Wendepunkt ins Dunkle) + Schluss-CTA (Verdikt)
//  - §-Maskierung OHNE Score-Triptychon (F1-Rückbau: die Kennzahl ist intern
//    widerlegt; Maskierung wird als Konzept erklärt, nicht als Zahl behauptet)
//  - Forschungs-Sektion mit Vault-belegten Fakten (F3; nur Belegtes: 144 Bilder,
//    5 Lesearten, 9 Treiber — keine unbelegten Test-Zahlen)
// Skip-Link, AppHeader und AppFooter liefert das default-Layout.
import Button from '~/components/ui/Button.vue'
import LandingHero from '~/components/landing/LandingHero.vue'
import LandingSpecimen from '~/components/landing/LandingSpecimen.vue'
import LandingDimensions from '~/components/landing/LandingDimensions.vue'
import { useReveal } from '~/composables/useReveal'

useHead({
  title: 'SemantIC – Überzeugend ist nicht genug.',
  meta: [
    {
      name: 'description',
      content:
        'SemantIC prüft KI-generierte Bilder vor der Veröffentlichung auf physikalische Kohärenz, semantische Konsistenz und Bias – ein Forschungsprototyp aus der Bachelorarbeit «Visual Bias im KI-generierten Bild».',
    },
  ],
})

const page = ref<HTMLElement | null>(null)
useReveal(page, '.reveal')
</script>

<template>
  <div ref="page">
    <!-- ================= HERO · Mess-Raster ================= -->
    <LandingHero />

    <!-- ============ §1 PROBLEM · Der blinde Fleck ============ -->
    <section class="wall" aria-labelledby="s1-head">
      <span class="wall__axis" aria-hidden="true" />
      <div class="center">
        <div class="tablet tablet--canvas">
          <p class="eyebrow reveal">Der blinde Fleck</p>
          <h2 id="s1-head" class="h2 reveal r1">Ein Bild kann perfekt aussehen und trotzdem nicht stimmen.</h2>
          <p class="lead reveal r2">
            KI-Bildgeneratoren sind gut darin, Bilder schön zu machen: scharf, farbig,
            stimmungsvoll. Sie sind deutlich schlechter darin, Bilder <em>richtig</em> zu
            machen – physikalisch plausibel, inhaltlich passend, frei von Klischees.
            Das Problem ist nicht, dass diese Schwächen fehlen. Das Problem ist, dass
            die visuelle Perfektion sie überdeckt. Ein Bild wirkt so überzeugend, dass
            du gar nicht erst hinschaust, ob es auch hält. Genau diesen Effekt nennen
            wir <em>Maskierung</em> – und genau ihm arbeitet SemantIC entgegen.
          </p>
        </div>
      </div>
    </section>

    <!-- ============ STILLES SPECIMEN · randlos, frei hängend ============ -->
    <section class="wall" aria-labelledby="specimen-title">
      <span class="wall__axis" aria-hidden="true" />
      <div class="center">
        <LandingSpecimen />
      </div>
    </section>

    <!-- ============ §2 DREI DIMENSIONEN · Hairline-Zeilen ============ -->
    <section class="wall" aria-labelledby="s2-head">
      <span class="wall__axis" aria-hidden="true" />
      <div class="center">
        <div class="tablet tablet--surface2">
          <p class="eyebrow reveal">Drei Dimensionen</p>
          <h2 id="s2-head" class="h2 reveal r1">Was wir uns ansehen.</h2>
          <p class="lead reveal r2">
            Jedes Bild läuft durch dieselben drei Prüfungen. Du siehst pro Dimension
            einen Score und ein Wort – grün, gelb oder rot – und kannst jeden Befund
            bis ins Detail aufklappen.
          </p>
          <div class="reveal r2">
            <LandingDimensions />
          </div>
        </div>
      </div>
    </section>

    <!-- ============ §3 DIE MASKIERUNG · dunkle Tafel (Wendepunkt) ============ -->
    <section class="wall wall--ink" aria-labelledby="s3-head">
      <span class="wall__axis" aria-hidden="true" />
      <div class="center">
        <div class="tablet tablet--ink">
          <p class="eyebrow reveal">Die Maskierung</p>
          <h2 id="s3-head" class="h2 reveal r1">Die Lücke zwischen schön und stimmig.</h2>
          <p class="lead reveal r2">
            SemantIC bewertet zwei Dinge strikt getrennt: wie ein Bild <em>wirkt</em>
            (Ästhetik) und was es inhaltlich <em>hält</em> (Integrität). So wird sichtbar,
            wenn ein Bild besser aussieht, als es ist – genau dort setzt die Maskierung
            an: Die perfekte Oberfläche kann Fehler überdecken. Diese Lücke lässt sich
            nicht seriös als einzelne Zahl messen – das haben wir in der eigenen
            Validierung geprüft und deshalb bewusst darauf verzichtet. Stattdessen
            markiert der Befund konkret die Stellen, an denen die Ästhetik einen Befund
            überdecken könnte – nachprüfbar direkt am Bild.
          </p>
        </div>
      </div>
    </section>

    <!-- ============ §4 EINORDNUNG · hellster Moment (randlos) ============ -->
    <section class="wall wall--surface" aria-labelledby="s4-head">
      <span class="wall__axis" aria-hidden="true" />
      <div class="center">
        <div class="open">
          <p class="eyebrow reveal">Zur Einordnung</p>
          <h2 id="s4-head" class="h2 reveal r1">Kein Echtheits-Detektor.</h2>
          <p class="lead reveal r2">
            SemantIC sagt dir nicht, ob ein Bild „echt" oder „KI" ist – diese Frage
            beantwortet es bewusst nicht. Es sortiert auch nicht in „Fake" und „nicht
            Fake". SemantIC setzt eine Ebene tiefer an: Es bewertet die <em>Qualität</em>
            eines bereits als KI-generiert bekannten Bildes. Schlechte KI gegen gute KI,
            nicht Fälschung gegen Wahrheit. Und jeder Befund ist ein Hinweis, kein
            Urteil – du entscheidest, ob das Bild in deinen Kontext passt.
          </p>
        </div>
      </div>
    </section>

    <!-- ============ §5 DIE FORSCHUNG DAHINTER (F3) ============ -->
    <section class="wall" aria-labelledby="s5-head">
      <span class="wall__axis" aria-hidden="true" />
      <div class="center">
        <div class="tablet tablet--canvas">
          <p class="eyebrow reveal">Die Forschung dahinter</p>
          <h2 id="s5-head" class="h2 reveal r1">Aus einer eigenen Bildanalyse, nicht aus Bauchgefühl.</h2>
          <p class="lead reveal r2">
            Die Kriterien, nach denen SemantIC prüft, stammen aus Phase 1 der
            Bachelorarbeit ‹Visual Bias im KI-generierten Bild› (FH Graubünden):
            einer qualitativen Inhaltsanalyse von 144 KI-generierten Bildern. Daraus
            entstanden fünf Lesearten, neun visuelle Treiber und die Fehlerprofile,
            gegen die jedes Bild geprüft wird. Die Prüf-Pipeline wurde über
            dokumentierte Iterationsrunden entwickelt und systematisch gegen die
            menschliche Codierung geprüft – inklusive ihrer Grenzen: Welche Stärken
            und Grenzen die Tests gezeigt haben, steht offen auf der Erklärseite.
          </p>

          <div class="data reveal r2">
            <span class="data__item"><b>144</b> Bilder</span>
            <span class="data__sep" aria-hidden="true">·</span>
            <span class="data__item"><b>5</b> Lesearten (WA · DA · CI · AA · MI)</span>
            <span class="data__sep" aria-hidden="true">·</span>
            <span class="data__item"><b>9</b> visuelle Treiber</span>
          </div>

          <p class="reveal r3">
            <NuxtLink to="/how-it-works" class="inline-link">
              So funktioniert die Prüfung <span class="arrow" aria-hidden="true">→</span>
            </NuxtLink>
          </p>
        </div>
      </div>
    </section>

    <!-- ================= SCHLUSS-CTA · dunkel, einziger Verdikt-Moment ================= -->
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
  </div>
</template>

<style scoped>
/* ============================================================ */
/* GALERIEWAND (Mockup F): Tiefe über Flächenwechsel + Hairlines,*/
/* kein Schatten, kein Gradient-als-Idee.                        */
/* ============================================================ */
.wall {
  position: relative;
  background: var(--page-bg);
  padding-block: clamp(72px, 11vw, 140px);
}
.wall--surface {
  background: var(--surface);
}
/* verbindendes Motiv: zentrierte Mittel-Hairline oben an jeder Wand-Zone */
.wall__axis {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 1px;
  height: clamp(40px, 7vw, 80px);
  background: var(--line);
}

/* zentrierte, schmale Inhalts-Achse */
.center {
  width: 100%;
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: var(--gutter);
  text-align: center;
}

/* Tafel: frei «hängende» Wand-Tafel (umrahmte Box, KEIN Schatten) */
.tablet {
  max-width: 760px;
  margin-inline: auto;
  border: 1px solid var(--line);
  border-radius: var(--r);
  padding: clamp(48px, 8vw, 96px) clamp(28px, 6vw, 72px);
}
.tablet--canvas {
  background: var(--canvas);
}
.tablet--surface2 {
  background: var(--surface-2);
}
/* Zonen bewusst OHNE Box = reiner Weissraum (Specimen, §4) */
.open {
  max-width: 760px;
  margin-inline: auto;
}

/* ---- gemeinsame Typo der Tafeln (zentriert, übergross, ruhig) ---- */
.eyebrow {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 500;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--subtle);
  margin-bottom: clamp(18px, 3vw, 28px);
}
.h2 {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(28px, 4.6vw, 46px);
  letter-spacing: -0.03em;
  line-height: 1.06;
  color: var(--ink);
  max-width: 18ch;
  margin-inline: auto;
  text-wrap: balance;
}
.lead {
  margin: clamp(22px, 3.5vw, 34px) auto 0;
  max-width: 58ch;
  color: var(--ink-soft);
  font-size: clamp(15px, 1.5vw, 17px);
  line-height: 1.64;
  text-align: left;
}
.lead em {
  font-style: normal;
  font-weight: 600;
  color: var(--ink);
}

/* ============================================================ */
/* DUNKLE SEKTION «Die Maskierung» (Ink-Inversion, Tokens 1.5)  */
/* REGEL (tokens.css): keine Severity-Wörter/Kleintext auf      */
/* dunklen Flächen.                                              */
/* ============================================================ */
.wall--ink {
  background: var(--ink-surface);
}
.wall--ink .wall__axis {
  background: var(--ink-line);
}
.tablet--ink {
  background: var(--ink-surface-2);
  border-color: var(--ink-line);
}
.wall--ink .eyebrow {
  color: var(--ink-text-muted);
}
.wall--ink .h2 {
  color: var(--ink-text);
}
.wall--ink .lead {
  color: var(--ink-text-soft);
}
.wall--ink .lead em {
  color: var(--ink-text);
}

/* ---- Forschungs-Datenfeld (Mono, drei neutrale Einträge) ---- */
.data {
  margin-top: clamp(30px, 4.5vw, 44px);
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: center;
  gap: clamp(12px, 2.6vw, 24px);
}
.data__item {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 13px;
  letter-spacing: 0.02em;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
.data__item b {
  color: var(--ink-soft);
  font-weight: 600;
}
.data__sep {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 13px;
  color: var(--subtle);
}
.inline-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: clamp(26px, 4vw, 38px);
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 600;
  font-size: 15px;
  color: var(--ink);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: var(--line-strong);
}
.inline-link:hover {
  text-decoration-color: var(--ink);
}
.inline-link .arrow {
  transition: transform 0.14s ease;
}
.inline-link:hover .arrow {
  transform: translateX(3px);
}

/* ============================================================ */
/* SCHLUSS-CTA (zweiter dunkler Moment · trägt den einzigen     */
/* roten Verdikt-Punkt der Wand-Sektionen)                       */
/* ============================================================ */
.closer {
  background: var(--ink-surface);
  color: var(--ink-text);
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
  color: var(--ink-text);
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
  color: var(--ink-text-soft);
  line-height: 1.6;
}
.closer__cta {
  margin-top: 30px;
}
.arrow {
  display: inline-block;
}

/* ============================================================ */
/* REVEALS («sanftes Eintreten»; Gate reveal-ready via useReveal,*/
/* ohne JS ist alles sofort sichtbar)                            */
/* ============================================================ */
.reveal-ready .reveal {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.reveal-ready .reveal.is-in {
  opacity: 1;
  transform: none;
}
/* A11y (Codex-Review 2026-06-11): Tastatur-Fokus auf ein noch nicht enthülltes
   Element (z.B. den Erklärseiten-Link) macht es sofort sichtbar. */
.reveal-ready .reveal:focus-within {
  opacity: 1;
  transform: none;
  transition: none;
}
.reveal-ready .reveal.r1 {
  transition-delay: 0.07s;
}
.reveal-ready .reveal.r2 {
  transition-delay: 0.14s;
}
.reveal-ready .reveal.r3 {
  transition-delay: 0.21s;
}
@media (prefers-reduced-motion: reduce) {
  .reveal-ready .reveal {
    opacity: 1 !important;
    transform: none !important;
  }
}

/* ============================================================ */
/* RESPONSIVE + PRINT                                            */
/* ============================================================ */
@media (max-width: 719px) {
  .lead {
    text-align: center;
  }
}
@media print {
  .closer {
    display: none;
  }
  .wall,
  .wall--ink {
    background: #fff;
    padding-block: 24px;
  }
  .wall--ink .h2,
  .wall--ink .lead,
  .wall--ink .eyebrow {
    color: var(--ink);
  }
}
</style>
