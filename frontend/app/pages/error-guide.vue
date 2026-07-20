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

// i18n (Seitentext-Migration): Prosa aus pages.errorGuide.*, Specimen-/Bias-Texte
// per id abgeleitet (siehe data/error-guide.ts). Titel als Getter -> folgt dem Sprachwechsel.
const { t } = useI18n()
useHead({ title: () => t('seo.errorGuide.title') })

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
          :alt="$t('pages.errorGuide.hero.imageAlt')"
          width="1600"
          height="1200"
          fetchpriority="high"
          decoding="async"
        />
        <div class="eg-hero__scrim" aria-hidden="true" />
      </div>
      <p class="eg-hero__credit">{{ $t('pages.errorGuide.hero.credit') }}</p>
      <div class="eg-hero__inner">
        <div class="page">
          <p class="eg-hero__kicker">{{ $t('pages.errorGuide.hero.kicker') }}</p>
          <h1 class="eg-hero__title">{{ $t('pages.errorGuide.hero.title') }}</h1>
          <p class="eg-hero__lead">{{ $t('pages.errorGuide.hero.lead') }}</p>
        </div>
      </div>
    </header>

    <!-- ================= EINLEITUNG (Prosa, keine Kacheln) ================= -->
    <section class="eg-block" aria-labelledby="eg-intro">
      <div class="page page--text">
        <h2 id="eg-intro" class="sr-only">{{ $t('pages.errorGuide.intro.srHeading') }}</h2>
        <i18n-t keypath="pages.errorGuide.intro.lead" tag="p" scope="global" class="eg-prose eg-prose--lead">
          <template #effect>
            <strong>{{ $t('pages.errorGuide.intro.effect') }}</strong>
          </template>
          <template #link>
            <NuxtLink to="/how-it-works">{{ $t('pages.errorGuide.intro.linkText') }}</NuxtLink>
          </template>
        </i18n-t>
        <p class="eg-prose">{{ $t('pages.errorGuide.intro.body') }}</p>
      </div>
    </section>

    <!-- ================= ANATOMIE ================= -->
    <section class="eg-chapter" aria-labelledby="eg-anatomie">
      <div class="page page--text">
        <p class="eg-chapter__eyebrow">{{ $t('pages.errorGuide.chapters.anatomy.eyebrow') }}</p>
        <h2 id="eg-anatomie" class="eg-chapter__title">{{ $t('pages.errorGuide.chapters.anatomy.title') }}</h2>
        <p class="eg-prose">{{ $t('pages.errorGuide.chapters.anatomy.prose') }}</p>
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
        <p class="eg-chapter__eyebrow">{{ $t('pages.errorGuide.chapters.context.eyebrow') }}</p>
        <h2 id="eg-kontext" class="eg-chapter__title">{{ $t('pages.errorGuide.chapters.context.title') }}</h2>
        <p class="eg-prose">{{ $t('pages.errorGuide.chapters.context.prose') }}</p>
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
        <p class="eg-chapter__eyebrow">{{ $t('pages.errorGuide.chapters.physics.eyebrow') }}</p>
        <h2 id="eg-physik" class="eg-chapter__title">{{ $t('pages.errorGuide.chapters.physics.title') }}</h2>
        <p class="eg-prose">{{ $t('pages.errorGuide.chapters.physics.prose') }}</p>
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
        <p class="eg-chapter__eyebrow">{{ $t('pages.errorGuide.chapters.stereotype.eyebrow') }}</p>
        <h2 id="eg-stereotype" class="eg-chapter__title">{{ $t('pages.errorGuide.chapters.stereotype.title') }}</h2>
        <i18n-t keypath="pages.errorGuide.chapters.stereotype.prose" tag="p" scope="global" class="eg-prose">
          <template #no>
            <strong>{{ $t('pages.errorGuide.chapters.stereotype.no') }}</strong>
          </template>
        </i18n-t>
      </div>
      <div class="page">
        <div class="eg-bias">
          <figure v-for="ex in biasExamples" :key="ex.id" class="eg-bias__card">
            <div class="eg-bias__frame">
              <img :src="ex.image" :alt="$t(`pages.errorGuide.bias.${ex.id}.alt`)" loading="lazy" decoding="async" />
            </div>
            <figcaption class="eg-bias__cap">
              <span class="eg-bias__prompt">{{ $t('pages.errorGuide.bias.promptLabel', { prompt: ex.prompt }) }}</span>
              <span class="eg-bias__text">{{ $t(`pages.errorGuide.bias.${ex.id}.caption`) }}</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>

    <!-- ================= SCHLUSS + CTA ================= -->
    <section class="eg-chapter eg-chapter--closing" aria-labelledby="eg-schluss">
      <div class="page page--text">
        <p class="eg-chapter__eyebrow">{{ $t('pages.errorGuide.chapters.closing.eyebrow') }}</p>
        <h2 id="eg-schluss" class="eg-chapter__title">{{ $t('pages.errorGuide.chapters.closing.title') }}</h2>
        <i18n-t keypath="pages.errorGuide.chapters.closing.prose" tag="p" scope="global" class="eg-prose">
          <template #coherence>
            <strong>{{ $t('pages.errorGuide.chapters.closing.coherence') }}</strong>
          </template>
        </i18n-t>
        <p class="eg-cta">
          <Button as="a" href="/analyze" variant="primary" size="md">
            {{ $t('pages.errorGuide.chapters.closing.cta') }} <span aria-hidden="true">→</span>
          </Button>
        </p>
        <i18n-t keypath="pages.errorGuide.chapters.closing.crossref" tag="p" scope="global" class="eg-crossref">
          <template #link>
            <NuxtLink to="/how-it-works">{{ $t('pages.errorGuide.chapters.closing.crossrefLink') }}</NuxtLink>
          </template>
        </i18n-t>
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
  min-height: var(--hero-min-h);
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
