<script setup lang="ts">
// Erklärseite /error-guide («Typische Bildfehler», umsetzung-1.10). Ruhiger Editorial-Longread:
// von oben nach unten lesbar, kein Scroll-Jacking, kein Sticky, keine Interaktions-Gimmicks.
// Betonung über Typografie, Weissraum und grosse Bilder – NICHT über Stat-Kacheln oder Boxen.
// Bilder als Artikel-Figuren: die wiederverwendbare ErrorSpecimen zeigt Marker + Erklärliste
// statisch (kein Suchspiel). Full-bleed Bild-Hero im Stil von how-it-works.vue. Design-System
// «Laborjournal» (Tokens aus assets/css/tokens.css). Skip-Link/Header/Footer liefert das
// default-Layout; der aktive Nav-Zustand kommt aus layouts/default.vue via route.path. Kein
// LLM-Text zur Laufzeit; Prosa redaktionell gesetzt, Zahlen aus data/error-guide + Korpus
// (umsetzung-1.10/inhalte-fehlerkategorien.md, Quelle: codierte_Bilder_040526.csv, N=144).
import Button from '~/components/ui/Button.vue'
import { biasExamples, specimensByCategory } from '~/data/error-guide'

useHead({
  title: 'Typische Bildfehler – SemantIC',
})

const anatomy = specimensByCategory('anatomy')
const context = specimensByCategory('context')
const physics = specimensByCategory('physics')
</script>

<template>
  <article class="eg">
    <!-- ================= REDAKTIONELLER KOPF (full-bleed Bild-Hero) ================= -->
    <header class="eg-hero">
      <div class="eg-hero__media">
        <img
          src="/error-guide/physik-coffeeshop-spiegelung.webp"
          alt="KI-generierte Café-Szene mit verchromter Espressomaschine – wirkt wie ein echtes Foto."
          width="1600"
          height="1200"
          fetchpriority="high"
          decoding="async"
        />
        <div class="eg-hero__scrim" aria-hidden="true" />
      </div>
      <p class="eg-hero__credit">KI-generiert · Studienkorpus</p>
      <div class="eg-hero__inner">
        <div class="page">
          <p class="eg-hero__kicker">Typische Bildfehler · Bachelorarbeit</p>
          <h1 class="eg-hero__title">Das makellose Bild und seine blinden Flecken.</h1>
          <p class="eg-hero__lead">
            KI-Bilder sehen zuverlässig gut aus – und genau das kann ihre Fehler
            verdecken. Auch die Szene hier ist komplett KI-generiert.
          </p>
        </div>
      </div>
    </header>

    <!-- ================= EINLEITUNG (Prosa, keine Kacheln) ================= -->
    <section class="eg-block" aria-labelledby="eg-intro">
      <div class="page page--text">
        <h2 id="eg-intro" class="sr-only">Einleitung</h2>
        <p class="eg-prose eg-prose--lead">
          KI-Bildgeneratoren optimieren auf das, was sofort überzeugt – auf die
          inhaltliche Stimmigkeit einer Szene weit weniger. Je makelloser die
          Oberfläche, desto leichter rutscht ein Fehler darunter durch: der
          <strong>Maskierungseffekt</strong>, die Arbeitsthese hinter SemantIC –
          <NuxtLink to="/how-it-works">warum das so ist, steht auf der Erklärseite</NuxtLink>.
        </p>
        <p class="eg-prose">
          Die Beispiele auf dieser Seite stammen aus dem empirischen Teil der
          Bachelorarbeit – 144 KI-generierte Bilder, systematisch codiert. Zwei von drei
          fotorealistischen Bildern darunter (71 von 106) trugen mindestens einen Fehler –
          in diesem Korpus die Regel, kein Ausreisser. Alle Markierungen weiter unten
          kommen aus dieser manuellen Codierung, nicht aus einem frischen Modelllauf. Es
          ist ein eigener Korpus, kein repräsentativer Querschnitt aller KI-Bilder.
        </p>
      </div>
    </section>

    <!-- ================= ANATOMIE ================= -->
    <section class="eg-chapter" aria-labelledby="eg-anatomie">
      <div class="page page--text">
        <p class="eg-chapter__eyebrow">Anatomie</p>
        <h2 id="eg-anatomie" class="eg-chapter__title">Wenn Körper nicht zusammenpassen.</h2>
        <p class="eg-prose">
          Der Klassiker unter den KI-Fehlern – im Korpus die seltenste der drei
          Fehlerarten, in dichten Szenen mit mehreren Personen aber weiterhin da. Wo sich
          Menschen überlappen, verliert die KI die Grenze zwischen zwei Körpern – Arme
          und Beine gehen ineinander über. Hände bleiben ihr eigenes Problem: mal ein
          Finger zu viel, mal eine Hand zu viel für die Haltung.
        </p>
      </div>
      <div class="page">
        <div class="eg-figures">
          <ErrorSpecimen v-for="s in anatomy" :key="s.id" :specimen="s" />
        </div>
      </div>
    </section>

    <!-- ================= KONTEXT ================= -->
    <section class="eg-chapter" aria-labelledby="eg-kontext">
      <div class="page page--text">
        <p class="eg-chapter__eyebrow">Kontext</p>
        <h2 id="eg-kontext" class="eg-chapter__title">Wenn die Szene keinen Sinn ergibt.</h2>
        <p class="eg-prose">
          Diese Brüche findet keine Lupe und kein Detektor – nur der Abgleich mit dem
          Weltwissen. Ein Laptop ohne Bildschirm, eine Zimmerpflanze in der Kaffeetasse,
          ein gefülltes Weinglas am Kinderplatz: technisch tadellos gerendert, inhaltlich
          absurd. Weil das Bild sauber aussieht, fällt das Falsche erst beim zweiten Blick
          auf.
        </p>
      </div>
      <div class="page">
        <div class="eg-figures">
          <ErrorSpecimen v-for="s in context" :key="s.id" :specimen="s" />
        </div>
      </div>
    </section>

    <!-- ================= PHYSIK ================= -->
    <section class="eg-chapter" aria-labelledby="eg-physik">
      <div class="page page--text">
        <p class="eg-chapter__eyebrow">Physik</p>
        <h2 id="eg-physik" class="eg-chapter__title">Wenn Licht und Raum nicht stimmen.</h2>
        <p class="eg-prose">
          Die häufigste Fehlerart im Korpus – und meist die subtilste. Spiegelungen, die
          nicht zur Szene davor passen, Bildschirme, die zur falschen Seite zeigen: Details,
          die kaum auffallen, weil das Bild sonst überzeugend wirkt. Genau hier zeigt sich
          der Maskierungseffekt in Reinform.
        </p>
      </div>
      <div class="page">
        <div class="eg-figures">
          <ErrorSpecimen v-for="s in physics" :key="s.id" :specimen="s" />
        </div>
      </div>
    </section>

    <!-- ================= STEREOTYPE (Bias-Figuren, ohne Marker) ================= -->
    <section class="eg-chapter" aria-labelledby="eg-stereotype">
      <div class="page page--text">
        <p class="eg-chapter__eyebrow">Stereotype</p>
        <h2 id="eg-stereotype" class="eg-chapter__title">Der Fehler ohne Bildstelle.</h2>
        <p class="eg-prose">
          Manche Fehler sind keine markierbare Stelle, sondern ein Muster. Auf «nurse»
          liefert die KI typischerweise eine junge, attraktive Frau, auf «CEO» einen Mann
          in Führungspose. Wahrgenommenes Geschlecht oder Hautfarbe sind für sich
          <strong>kein</strong> Befund – erst die stereotype Rollenbesetzung schlägt an.
        </p>
      </div>
      <div class="page">
        <div class="eg-bias">
          <figure v-for="ex in biasExamples" :key="ex.id" class="eg-bias__card">
            <div class="eg-bias__frame">
              <img :src="ex.image" :alt="ex.alt" loading="lazy" decoding="async" />
            </div>
            <figcaption class="eg-bias__cap">
              <span class="eg-bias__prompt">Prompt: „{{ ex.prompt }}“</span>
              <span class="eg-bias__text">{{ ex.caption }}</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>

    <!-- ================= SCHLUSS + CTA ================= -->
    <section class="eg-chapter eg-chapter--closing" aria-labelledby="eg-schluss">
      <div class="page page--text">
        <p class="eg-chapter__eyebrow">Ausblick</p>
        <h2 id="eg-schluss" class="eg-chapter__title">Der auffällige Fehler ist die Ausnahme – der subtile die Regel.</h2>
        <p class="eg-prose">
          Die Suche nach dem sechsten Finger allein trägt nicht weit: Schon in diesem
          Korpus dominieren nicht die Anatomie-Artefakte, sondern Physik- und
          Kontextbrüche – und je stärker ein Bild kuratiert ist, desto schwerer fällt
          der Fehler auf. Reine Artefakt-Suche ist damit unzuverlässig. Deshalb prüft
          SemantIC nicht «echt oder gefälscht», sondern die <strong>Kohärenz</strong>
          eines Bildes.
        </p>
        <p class="eg-cta">
          <Button as="a" href="/analyze" variant="primary" size="md">
            Bild prüfen <span aria-hidden="true">→</span>
          </Button>
        </p>
        <p class="eg-crossref">
          Wie SemantIC daraus ein Urteil bildet, steht unter
          <NuxtLink to="/how-it-works">So funktioniert SemantIC</NuxtLink>.
        </p>
      </div>
    </section>
  </article>
</template>

<style scoped>
/* ============================================================ */
/* PAGE LAYOUT – schmale Lesespalte für Text, breiter für Bilder */
/* ============================================================ */
.page {
  max-width: var(--container);
  margin-inline: auto;
  padding: 0 var(--gutter);
}
.page--text {
  max-width: var(--container-text);
}

/* Visuell versteckte, für Screenreader vorhandene Überschrift (Heading-Hierarchie). */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ============================================================ */
/* REDAKTIONELLER KOPF – full-bleed Bild-Hero                    */
/* Das Article-Element ist unbeschränkt breit; nur .page begrenzt */
/* → der Hero ist von Haus aus randlos, ohne 100vw-Trick.        */
/* ============================================================ */
.eg-hero {
  position: relative;
  min-height: clamp(430px, 68vh, 660px);
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  background: var(--ink-surface);
  border-bottom: 1px solid var(--line);
  isolation: isolate;
}
.eg-hero__media {
  position: absolute;
  inset: 0;
  z-index: -1;
}
.eg-hero__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 42%;
}
/* Verlauf für Textlesbarkeit: kräftig unten (Titel), leicht oben (Credit). */
.eg-hero__scrim {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to top, rgba(19, 20, 15, 0.88) 0%, rgba(19, 20, 15, 0.6) 28%,
      rgba(19, 20, 15, 0.16) 58%, rgba(19, 20, 15, 0) 84%),
    linear-gradient(to bottom, rgba(19, 20, 15, 0.34) 0%, rgba(19, 20, 15, 0) 26%);
}
.eg-hero__credit {
  position: absolute;
  right: clamp(16px, 4vw, 44px);
  bottom: clamp(14px, 3vw, 22px);
  z-index: 1;
  font-family: var(--mono);
  font-size: 10.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(238, 239, 233, 0.72);
}
.eg-hero__inner {
  position: relative;
  width: 100%;
  padding-block: clamp(30px, 5vw, 56px);
}
.eg-hero__kicker {
  font-family: var(--mono);
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(238, 239, 233, 0.74);
}
.eg-hero__title {
  font-family: var(--sans);
  font-weight: 700;
  font-size: clamp(32px, 6vw, 58px);
  letter-spacing: -0.025em;
  line-height: 1.04;
  margin-top: 14px;
  color: #fff;
  max-width: 18ch;
  text-wrap: balance;
}
.eg-hero__lead {
  font-size: clamp(16px, 2.2vw, 20px);
  line-height: 1.55;
  color: rgba(238, 239, 233, 0.9);
  margin-top: 18px;
  max-width: 52ch;
}

/* ============================================================ */
/* PROSA-BLÖCKE                                                  */
/* ============================================================ */
.eg-block {
  padding-block: clamp(40px, 6vw, 72px);
}
.eg-prose {
  font-size: 17px;
  line-height: 1.72;
  color: var(--ink-soft);
  max-width: 62ch;
}
.eg-prose + .eg-prose {
  margin-top: 22px;
}
.eg-prose strong {
  color: var(--ink);
  font-weight: 600;
}
/* Editorialer Auftakt: grössere Einleitung, klassische Drop-Cap. */
.eg-prose--lead {
  font-size: clamp(18px, 2.4vw, 21px);
  line-height: 1.6;
  color: var(--ink);
}
.eg-prose--lead::first-letter {
  float: left;
  font-family: var(--sans);
  font-weight: 700;
  font-size: 3.4em;
  line-height: 0.82;
  padding: 6px 12px 0 0;
  color: var(--ink);
}

/* ============================================================ */
/* KAPITEL (Zwischentitel + Prosa + Figuren)                    */
/* ============================================================ */
.eg-chapter {
  padding-block: clamp(36px, 5vw, 60px);
  border-top: 1px solid var(--line-soft);
}
.eg-chapter__eyebrow {
  font-family: var(--mono);
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--subtle);
}
.eg-chapter__title {
  font-family: var(--sans);
  font-weight: 700;
  font-size: clamp(24px, 3.6vw, 34px);
  letter-spacing: -0.02em;
  line-height: 1.12;
  margin-top: 10px;
  margin-bottom: 20px;
  color: var(--ink);
  max-width: 20ch;
}
.eg-chapter .eg-prose {
  margin-bottom: 0;
}

/* ---- Figuren: breiter als die Textspalte, ruhig zentriert ---- */
.eg-figures {
  max-width: 840px;
  margin: clamp(28px, 4vw, 44px) auto 0;
  display: flex;
  flex-direction: column;
  gap: clamp(40px, 6vw, 64px);
}

/* ============================================================ */
/* STEREOTYPE – zwei stille Bias-Figuren (ohne Marker)          */
/* ============================================================ */
.eg-bias {
  max-width: 840px;
  margin: clamp(28px, 4vw, 44px) auto 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(20px, 3vw, 32px);
}
.eg-bias__card {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.eg-bias__frame {
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--surface-2);
}
.eg-bias__frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.eg-bias__cap {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.eg-bias__prompt {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--subtle);
}
.eg-bias__text {
  font-size: 15px;
  line-height: 1.6;
  color: var(--ink-soft);
}

/* ============================================================ */
/* SCHLUSS + CTA                                                 */
/* ============================================================ */
.eg-chapter--closing {
  border-bottom: 1px solid var(--line-soft);
}
.eg-cta {
  margin-top: 28px;
}

/* ============================================================ */
/* CROSSREF (Verweis auf /how-it-works im Schlussblock)         */
/* ============================================================ */
.eg-crossref {
  margin-top: 26px;
  font-size: 15px;
  line-height: 1.6;
  color: var(--ink-soft);
  max-width: 62ch;
}
.eg-crossref :deep(a) {
  color: var(--ink);
  text-underline-offset: 3px;
}

/* ============================================================ */
/* RESPONSIVE                                                    */
/* ============================================================ */
@media (max-width: 719px) {
  .eg-bias {
    grid-template-columns: 1fr;
  }
  .eg-prose--lead::first-letter {
    font-size: 3em;
    padding-right: 10px;
  }
}

/* Ruhiges Konzept: keine Motion. */
@media (prefers-reduced-motion: reduce) {
  * {
    scroll-behavior: auto;
  }
}
</style>
