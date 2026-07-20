<script setup lang="ts">
// Erklärseite /how-it-works (how-it-works-spec.md + how-it-works.html · content/how-it-works.md).
// Originalgetreuer Port von Variante C „Laborjournal" (FIX). Skip-Link, AppHeader und
// AppFooter liefert das default-Layout; diese Seite liefert NUR den Inhalt (kein eigenes
// <main>, keinen aktiven Nav-Zustand – das regelt layouts/default.vue via route.path).
//
// Frontend 1.7: Die Erklär-Grafiken in §2/§2b/§4 sind eigene Komponenten unter
// components/dataviz/ (PipelineDiagram, GuardrailList, MaskingQuadrant) – datenlos,
// rein illustrativ. Der Quadrant-Beispielpunkt (Ästhetik 86 / Integrität 64) ist als
// „Beispiel/Schema" gekennzeichnet, keine Messzahl.
import Button from '~/components/ui/Button.vue'
import Card from '~/components/ui/Card.vue'

// i18n (Seitentext-Migration): Prosa/strukturierte Daten aus pages.howItWorks.*,
// die Datengrafiken (PipelineDiagram/GuardrailList/MaskingQuadrant) haben eigene
// components.*-Keys. Titel als Getter -> folgt dem Sprachwechsel ohne Reload.
const { t, tm, rt } = useI18n()
useHead({ title: () => t('seo.howItWorks.title') })

// String-Array-Messages (Chips §5, Kontrastlisten §6). Key bewusst als `string`
// (nicht Literal) an tm() -> umgeht die tiefe Typ-Instanziierung von vue-i18n (TS2589).
// tm() liefert in diesem Setup KOMPILIERTE Message-Nodes (keine reinen Strings), daher
// jedes Element ueber rt() aufloesen -> sonst rendert Vue die Objekte roh. computed ->
// folgt dem Sprachwechsel.
const list = (key: string): string[] => (tm(key) as unknown[]).map((m) => rt(m as string))
const haltungChips = computed(() => list('pages.howItWorks.s5.haltungChips'))
const verwendungChips = computed(() => list('pages.howItWorks.s5.verwendungChips'))
const isItems = computed(() => list('pages.howItWorks.s6.isItems'))
const isNotItems = computed(() => list('pages.howItWorks.s6.isNotItems'))
</script>

<template>
  <!-- ================= EINSTIMMUNG · Editorial-Kopf (full-bleed Moodbild + Lead darüber) ================= -->
  <section class="hero">
    <div class="hero__media">
      <img
        class="hero__img"
        src="/landing/band-printstudio.webp"
        alt=""
        aria-hidden="true"
        loading="eager"
        fetchpriority="high"
        decoding="async"
      />
      <div class="hero__scrim" aria-hidden="true" />
    </div>
    <p class="hero__credit">{{ $t('pages.howItWorks.hero.credit') }}</p>
    <div class="hero__inner">
      <div class="page">
        <header class="hero__head">
          <p class="hero__kicker">{{ $t('pages.howItWorks.hero.kicker') }}</p>
          <h1>{{ $t('pages.howItWorks.hero.title') }}</h1>
          <p class="hero__lead">{{ $t('pages.howItWorks.hero.lead') }}</p>
        </header>
      </div>
    </div>
  </section>

  <!-- ================= 1 · MASKIERUNGSEFFEKT ================= -->
  <section class="section" aria-labelledby="s1-title">
    <div class="page page--text">
      <p class="section__index">{{ $t('pages.howItWorks.s1.index') }}</p>
      <h2 id="s1-title">{{ $t('pages.howItWorks.s1.title') }}</h2>
      <div class="s1-grid">
        <div class="section__body">
          <p class="s1-lead">{{ $t('pages.howItWorks.s1.lead') }}</p>
          <i18n-t keypath="pages.howItWorks.s1.body" tag="p" scope="global">
            <template #masking><strong>{{ $t('pages.howItWorks.s1.masking') }}</strong></template>
          </i18n-t>
        </div>

        <!-- Theoriebezug: ruhige Randnotiz (Card-Variante) -->
        <Card tone="sunken" border="hair" padding="none" class="card theory">
          <p class="card__kicker">{{ $t('pages.howItWorks.s1.theoryKicker') }}</p>
          <p>{{ $t('pages.howItWorks.s1.theoryBody') }}</p>
        </Card>
      </div>
    </div>
  </section>

  <!-- ================= 2 · ABLAUF IN DREI SCHRITTEN ================= -->
  <section class="section" aria-labelledby="s2-title">
    <div class="page">
      <p class="section__index">{{ $t('pages.howItWorks.s2.index') }}</p>
      <h2 id="s2-title">{{ $t('pages.howItWorks.s2.title') }}</h2>

      <div class="figure-card">
        <p class="figure-card__lead">{{ $t('pages.howItWorks.s2.lead') }}</p>
        <PipelineDiagram />
        <p class="figure-note">{{ $t('pages.howItWorks.s2.note') }}</p>
      </div>
    </div>
  </section>

  <!-- ============ 2·b · LEITPLANKEN DER BEWERTUNG (dunkle Sektion) ============ -->
  <section class="section section--ink" aria-labelledby="s2b-title">
    <div class="page">
      <p class="section__index">{{ $t('pages.howItWorks.s2b.index') }}</p>
      <h2 id="s2b-title">{{ $t('pages.howItWorks.s2b.title') }}</h2>
      <div class="section__body">
        <p>{{ $t('pages.howItWorks.s2b.body1') }}</p>
      </div>

      <div class="section__figure">
        <GuardrailList />
      </div>
      <div class="section__body">
        <p>{{ $t('pages.howItWorks.s2b.body2') }}</p>
      </div>
      <p class="figure-note">{{ $t('pages.howItWorks.s2b.note') }}</p>
    </div>
  </section>

  <!-- ================= 3 · DIE DREI DIMENSIONEN ================= -->
  <section class="section" aria-labelledby="s3-title">
    <div class="page">
      <p class="section__index">{{ $t('pages.howItWorks.s3.index') }}</p>
      <h2 id="s3-title">{{ $t('pages.howItWorks.s3.title') }}</h2>

      <div class="dims">
        <!-- Gleichrangige Dimensionen: neutrale Mono-Indexziffer statt Ampel-Akzent. -->
        <article class="dim-card">
          <div class="dim-card__inner">
            <div class="dim-card__head">
              <span class="dim-card__idx" aria-hidden="true">01</span>
              <p class="dim-card__name">{{ $t('common.dimensions.physics') }}</p>
            </div>
            <h3>{{ $t('pages.howItWorks.s3.physics.h3') }}</h3>
            <p>{{ $t('pages.howItWorks.s3.physics.body') }}</p>
          </div>
        </article>
        <article class="dim-card">
          <div class="dim-card__inner">
            <div class="dim-card__head">
              <span class="dim-card__idx" aria-hidden="true">02</span>
              <p class="dim-card__name">{{ $t('common.dimensions.semantics') }}</p>
            </div>
            <h3>{{ $t('pages.howItWorks.s3.semantics.h3') }}</h3>
            <p>{{ $t('pages.howItWorks.s3.semantics.body') }}</p>
          </div>
        </article>
        <article class="dim-card">
          <div class="dim-card__inner">
            <div class="dim-card__head">
              <span class="dim-card__idx" aria-hidden="true">03</span>
              <p class="dim-card__name">{{ $t('common.dimensions.bias') }}</p>
            </div>
            <h3>{{ $t('pages.howItWorks.s3.bias.h3') }}</h3>
            <p>{{ $t('pages.howItWorks.s3.bias.body') }}</p>
          </div>
        </article>
      </div>
    </div>
  </section>

  <!-- ================= 4 · MASKIERUNGS-CHECK (dunkle Bild-Sektion) =================
       Hintergrund: ruhige Fotopapier-Textur (KI-generiert, ohne Objekte – das
       frühere Pressekonferenz-Foto wirkte hinter dem Scrim zu unruhig); der Text
       liegt in einer opaken Ink-Tafel (Lesbarkeit vom Bild entkoppelt, AA-sicher),
       der Quadrant als eigene helle Karte davor. Bezug: die „Oberfläche" des
       Fotopapiers als Folie, über der der Maskierungs-Quadrant das Prinzip erklärt. -->
  <section class="section s4 section--ink" aria-labelledby="s4-title">
    <img
      class="s4__bg"
      src="/landing/bg-fotopapier-dark.webp"
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
    />
    <span class="s4__scrim" aria-hidden="true" />
    <div class="page s4__content">
      <div class="s4__top">
        <div class="s4__panel">
          <p class="section__index">{{ $t('pages.howItWorks.s4.index') }}</p>
          <h2 id="s4-title">{{ $t('pages.howItWorks.s4.title') }}</h2>
          <div class="section__body">
            <p>{{ $t('pages.howItWorks.s4.body') }}</p>
          </div>
        </div>
      </div>

      <div class="section__figure s4__figure">
        <MaskingQuadrant :aesthetic="86" :integrity="64" />
      </div>
    </div>
  </section>

  <!-- ================= 5 · DEINE ANGABEN ================= -->
  <section class="section" aria-labelledby="s5-title">
    <div class="page">
      <p class="section__index">{{ $t('pages.howItWorks.s5.index') }}</p>
      <h2 id="s5-title">{{ $t('pages.howItWorks.s5.title') }}</h2>
      <div class="section__body">
        <i18n-t keypath="pages.howItWorks.s5.body" tag="p" scope="global">
          <template #stance><strong>{{ $t('pages.howItWorks.s5.stance') }}</strong></template>
          <template #form><strong>{{ $t('pages.howItWorks.s5.form') }}</strong></template>
        </i18n-t>
      </div>

      <div class="angaben">
        <div class="angaben__card">
          <p class="angaben__kicker">{{ $t('pages.howItWorks.s5.haltungKicker') }}</p>
          <h3>{{ $t('pages.howItWorks.s5.haltungH3') }}</h3>
          <ul class="angaben__opts" :aria-label="$t('pages.howItWorks.s5.optsAria')">
            <li v-for="(chip, i) in haltungChips" :key="`h-${i}`" class="chip">{{ chip }}</li>
          </ul>
          <p class="angaben__hint">{{ $t('pages.howItWorks.s5.haltungHint') }}</p>
        </div>
        <div class="angaben__card">
          <p class="angaben__kicker">{{ $t('pages.howItWorks.s5.verwendungKicker') }}</p>
          <h3>{{ $t('pages.howItWorks.s5.verwendungH3') }}</h3>
          <ul class="angaben__opts" :aria-label="$t('pages.howItWorks.s5.optsAria')">
            <li v-for="(chip, i) in verwendungChips" :key="`v-${i}`" class="chip">{{ chip }}</li>
          </ul>
          <p class="angaben__hint">{{ $t('pages.howItWorks.s5.verwendungHint') }}</p>
        </div>
      </div>
      <p class="figure-note">{{ $t('pages.howItWorks.s5.note') }}</p>
    </div>
  </section>

  <!-- ================= 6 · HINWEIS STATT NACHWEIS ================= -->
  <section class="section" aria-labelledby="s6-title">
    <div class="page page--text">
      <p class="section__index">{{ $t('pages.howItWorks.s6.index') }}</p>
      <h2 id="s6-title">{{ $t('pages.howItWorks.s6.title') }}</h2>
      <div class="section__body">
        <p>{{ $t('pages.howItWorks.s6.body') }}</p>
      </div>

      <!-- Kontrast: Was SemantIC ist / nicht ist (kein Severity-Farbton) -->
      <div class="contrast">
        <div class="contrast__col contrast__col--is">
          <h3>{{ $t('pages.howItWorks.s6.isTitle') }}</h3>
          <ul>
            <li v-for="(item, i) in isItems" :key="`is-${i}`"><span class="mark" aria-hidden="true">+</span><span>{{ item }}</span></li>
          </ul>
        </div>
        <div class="contrast__col">
          <h3>{{ $t('pages.howItWorks.s6.isNotTitle') }}</h3>
          <ul>
            <li v-for="(item, i) in isNotItems" :key="`isnot-${i}`"><span class="mark" aria-hidden="true">–</span><span>{{ item }}</span></li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- ================= 7 · VALIDIERTE GRENZEN (F2) =================
       Grenzen als Qualitätsmerkmal: jede Aussage hier ist empirisch geprüft
       (Anatomie-Batch + verblindeter Zweitmodell-Vergleich, dokumentierte
       Testreihen gegen die menschliche Phase-1-Codierung). -->
  <section class="section" aria-labelledby="s7-title">
    <div class="page page--text">
      <p class="section__index">{{ $t('pages.howItWorks.s7.index') }}</p>
      <h2 id="s7-title">{{ $t('pages.howItWorks.s7.title') }}</h2>
      <div class="section__body">
        <p>{{ $t('pages.howItWorks.s7.body1') }}</p>
      </div>

      <div class="limits-grid">
        <Card tone="paper" border="hair" padding="none" class="card card--paper">
          <p class="card__kicker">{{ $t('pages.howItWorks.s7.cards.0.kicker') }}</p>
          <h3>{{ $t('pages.howItWorks.s7.cards.0.h3') }}</h3>
          <p>{{ $t('pages.howItWorks.s7.cards.0.body') }}</p>
        </Card>
        <Card tone="paper" border="hair" padding="none" class="card card--paper">
          <p class="card__kicker">{{ $t('pages.howItWorks.s7.cards.1.kicker') }}</p>
          <h3>{{ $t('pages.howItWorks.s7.cards.1.h3') }}</h3>
          <p>{{ $t('pages.howItWorks.s7.cards.1.body') }}</p>
        </Card>
        <Card tone="paper" border="hair" padding="none" class="card card--paper">
          <p class="card__kicker">{{ $t('pages.howItWorks.s7.cards.2.kicker') }}</p>
          <h3>{{ $t('pages.howItWorks.s7.cards.2.h3') }}</h3>
          <p>{{ $t('pages.howItWorks.s7.cards.2.body') }}</p>
        </Card>
        <Card tone="paper" border="hair" padding="none" class="card card--paper">
          <p class="card__kicker">{{ $t('pages.howItWorks.s7.cards.3.kicker') }}</p>
          <h3>{{ $t('pages.howItWorks.s7.cards.3.h3') }}</h3>
          <p>{{ $t('pages.howItWorks.s7.cards.3.body') }}</p>
        </Card>
      </div>

      <div class="section__body">
        <p>{{ $t('pages.howItWorks.s7.body2') }}</p>
      </div>
    </div>
  </section>

  <!-- Auflockerung · KI-Moodbild (Prüfstapel mit roten Punkten) vor dem Forschungsteil:
       nimmt das Sichten/Markieren vieler Bilder auf – Bezug zur Phase-1-Analyse. -->
  <MoodBand src="/landing/band-pruefstapel.webp" />

  <!-- ================= 8 · WOHER DIE KRITERIEN STAMMEN ================= -->
  <section class="section" aria-labelledby="s8-title">
    <div class="page page--text">
      <p class="section__index">{{ $t('pages.howItWorks.s8.index') }}</p>
      <h2 id="s8-title">{{ $t('pages.howItWorks.s8.title') }}</h2>
      <div class="s8-grid">
        <aside class="s8-figure" aria-hidden="true">
          <span class="s8-figure__num">{{ $t('pages.howItWorks.s8.figureNum') }}</span>
          <span class="s8-figure__cap">{{ $t('pages.howItWorks.s8.figureCap') }}</span>
        </aside>
        <div class="section__body">
          <p>{{ $t('pages.howItWorks.s8.body1') }}</p>
          <p>{{ $t('pages.howItWorks.s8.body2') }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ================= 9 · DATENSCHUTZ IN EINEM SATZ ================= -->
  <section class="section" aria-labelledby="s9-title">
    <div class="page page--text">
      <p class="section__index">{{ $t('pages.howItWorks.s9.index') }}</p>
      <h2 id="s9-title">{{ $t('pages.howItWorks.s9.title') }}</h2>
      <div class="section__body">
        <p>{{ $t('pages.howItWorks.s9.body') }}</p>
      </div>
      <NuxtLink to="/privacy" class="inline-cta">{{ $t('pages.howItWorks.s9.cta') }}</NuxtLink>
    </div>
  </section>

  <!-- ================= SCHLUSS-CTA ================= -->
  <div class="page page--text">
    <div class="closing">
      <h2>{{ $t('pages.howItWorks.closing.title') }}<span class="closing__dot">.</span></h2>
      <div class="closing__cta">
        <Button as="a" href="/analyze" variant="primary" size="md">
          {{ $t('pages.howItWorks.closing.cta') }} <span class="arrow" aria-hidden="true">→</span>
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================ */
/* PAGE LAYOUT                                                   */
/* ============================================================ */
.page {
  max-width: var(--container);
  margin-inline: auto;
  padding: 0 var(--gutter);
}
.page--text {
  max-width: var(--container-text);
}

/* ---- Editorial-Kopf (Moodbild + Lead darüber im Creme-Scrim) ---- */
/* Editorial-Kopf: full-bleed Bild + dunkler Scrim + heller Text (Stil wie /error-guide). */
.hero {
  position: relative;
  width: 100%;
  min-height: var(--hero-min-h);
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  background: var(--ink-surface);
  border-bottom: 1px solid var(--line);
  isolation: isolate;
}
.hero__media {
  position: absolute;
  inset: 0;
  z-index: -1;
}
.hero__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 42%;
}
/* Dunkler Verlauf: kräftig unten (Titel), leicht oben (Credit) – Text auf jedem Bild lesbar. */
.hero__scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(to top, rgba(19, 20, 15, 0.88) 0%, rgba(19, 20, 15, 0.6) 28%,
      rgba(19, 20, 15, 0.16) 58%, rgba(19, 20, 15, 0) 84%),
    linear-gradient(to bottom, rgba(19, 20, 15, 0.34) 0%, rgba(19, 20, 15, 0) 26%);
}
.hero__credit {
  position: absolute;
  right: clamp(16px, 4vw, 44px);
  bottom: clamp(14px, 3vw, 22px);
  z-index: 1;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(238, 239, 233, 0.72);
}
.hero__inner {
  position: relative;
  width: 100%;
}
.hero__head {
  padding: 56px 0 44px;
  max-width: 62ch;
}
.hero__kicker {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(238, 239, 233, 0.74);
}
.hero__head h1 {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(30px, 5.4vw, 46px);
  letter-spacing: -0.02em;
  line-height: 1.06;
  margin-top: 12px;
  color: #fff;
}
.hero__lead {
  font-size: clamp(15px, 2vw, 17px);
  line-height: 1.6;
  color: rgba(238, 239, 233, 0.9);
  margin-top: 18px;
  max-width: 60ch;
}

/* Editorialer Initial im ersten Textblock (§01) – gleiche Wirkung wie /error-guide. */
.s1-lead::first-letter {
  float: left;
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: 3.4em;
  line-height: 0.82;
  padding: 6px 12px 0 0;
  color: var(--ink);
}

/* ---- §1: Fliesstext + Theorie-Randnotiz nebeneinander (Desktop) ---- */
.s1-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 32px;
  align-items: start;
  margin-top: 4px;
}
.s1-grid .theory {
  margin-top: 0;
}

/* ---- §8: „144" als Mono-Drop-Figure neben dem Fliesstext ---- */
.s8-grid {
  display: grid;
  grid-template-columns: minmax(0, auto) minmax(0, 1fr);
  gap: 36px;
  align-items: start;
}
.s8-figure {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-right: 1px solid var(--line-soft);
  padding-right: 32px;
}
.s8-figure__num {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 700;
  font-size: clamp(56px, 8vw, 88px);
  line-height: 0.9;
  letter-spacing: -0.04em;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}
.s8-figure__cap {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--subtle);
  margin-top: 10px;
}

/* Section-Rhythmus */
.section {
  padding-block: 40px 48px;
  border-bottom: 1px solid var(--line-soft);
}
.section:last-of-type {
  border-bottom: none;
}
.section__index {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 500;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--subtle);
}
.section h2 {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(21px, 3vw, 27px);
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin-top: 8px;
  max-width: 24ch;
  color: var(--ink);
}
.section__body {
  max-width: 64ch;
}
.section__body p {
  font-size: 16px;
  line-height: 1.65;
  color: var(--ink-soft);
  margin-top: 16px;
}
.section__body p strong {
  color: var(--ink);
  font-weight: 600;
}

/* ---- Dunkle Sektion (Ink-Inversion) – gemeinsamer Modifier für §2·b + §4.
   Muster wie Landing .wall--ink: dunkler Grund, helle Text-Tokens, Ink-Hairline.
   Eingebettete Datengrafiken (GuardrailList, MaskingQuadrant) bleiben eigene helle
   Karten und „poppen" – Scoped-CSS leakt nicht in ihre Interna. ---- */
.section--ink {
  background: var(--ink-surface);
  border-color: var(--ink-line);
}
.section--ink .section__index {
  color: var(--ink-text-muted);
}
.section--ink h2 {
  color: var(--ink-text);
}
.section--ink .section__body p {
  color: var(--ink-text-soft);
}
.section--ink .figure-note {
  color: var(--ink-text-muted);
}
/* Guardrail-Pfeil: Normal-Stroke --line-strong hält auf Dunkel (6.6:1); der
   Hover-Recolor auf --substance (2.9:1) wäre zu schwach → auf helle Ink-Farbe. */
.section--ink :deep(.rail:hover .rail__arrow :is(line, path)),
.section--ink :deep(.rail:focus-within .rail__arrow :is(line, path)) {
  stroke: var(--ink-text-soft);
}

/* ---- Card / Panel (Primitive §2) – Fläche/Border liefert Card.vue, Padding lokal ---- */
.card {
  padding: 24px;
}
.card__kicker {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--subtle);
  margin-bottom: 10px;
}
.card h3 {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 600;
  font-size: 17px;
  letter-spacing: -0.01em;
  color: var(--ink);
}
.card p {
  font-size: 15px;
  line-height: 1.6;
  color: var(--ink-soft);
  margin-top: 10px;
}

/* Theoriebezug-Panel (ruhig, sunken) – als Randnotiz im §1-Grid */
.theory {
  margin-top: 0;
}

/* ---- Eingebettete Datengrafik (dataviz/*) – einheitlicher Abstand ---- */
.section__figure {
  margin-top: 28px;
}

/* ---- §4: Pressekonferenz-Foto vollflächig sichtbar; Text in opaker Ink-Tafel,
   Quadrant als helle Karte davor ---- */
.s4 {
  position: relative;
  overflow: hidden;
  /* Dunkler Ink-Grund als Basisschicht – Fallback, falls das Foto nicht lädt. */
  background: var(--ink-surface);
}
.s4__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Foto in die rechte (offene) Spalte rücken, damit die Person dort sichtbar wird. */
  object-position: 72% center;
}
/* Horizontaler Mood-Verlauf: links (Inhaltsspalte) dunkel für Kohäsion, rechts klar,
   damit das Foto als starke Fläche durchkommt. Textlesbarkeit trägt die Ink-Tafel. */
.s4__scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(
      to right,
      rgba(35, 37, 29, 0.58) 0%,
      rgba(35, 37, 29, 0.4) 38%,
      rgba(35, 37, 29, 0.12) 68%,
      rgba(35, 37, 29, 0) 100%
    );
}
.s4__content {
  position: relative;
  z-index: 1;
}
/* Obere Reihe: Text-Tafel links, Foto rechts als starke, offene Fläche. */
.s4__top {
  display: grid;
  grid-template-columns: minmax(0, 560px) 1fr;
  gap: clamp(24px, 4vw, 56px);
  align-items: start;
  min-height: clamp(280px, 32vh, 380px);
}
/* Ink-Tafel hinter dem Text: nahezu opak → Lesbarkeit vom Foto entkoppelt (AA),
   minimaler Foto-Schimmer bleibt. Muster wie Landing .tablet--ink. */
.s4__panel {
  padding: clamp(22px, 3vw, 34px);
  background: rgba(35, 37, 29, 0.9);
  border: 1px solid var(--ink-line);
  border-radius: var(--r);
}
/* Quadrant über die volle Sektionsbreite – gross, eigene helle Karte. */
.s4__figure {
  margin-top: clamp(28px, 4vw, 44px);
}
@media (max-width: 859px) {
  .s4__top {
    grid-template-columns: 1fr;
    min-height: 0;
  }
}
/* Der Quadrant bringt eigene helle Tafel + Rahmen mit – bleibt als klarer
   Vordergrund vor dem Foto lesbar. */
.s4__figure :deep(.quad) {
  box-shadow: 0 1px 0 rgba(35, 37, 29, 0.04);
}

/* ---- §2: Intro + Diagramm + Note „aus einem Guss" in einer Kachel ---- */
.figure-card {
  margin-top: 28px;
  padding: clamp(24px, 4vw, 40px);
  background: var(--canvas);
  border: 1px solid var(--line);
  border-radius: var(--r);
}
.figure-card__lead {
  max-width: 56ch;
  margin: 0 auto 28px;
  text-align: center;
  font-size: 16px;
  line-height: 1.6;
  color: var(--ink-soft);
}
.figure-card .figure-note {
  text-align: center;
  margin-top: 22px;
}

/* ---- Drei Dimensionen im Detail (Cards mit Severity-Marker oben) ---- */
.dims {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 28px;
}
.dim-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r);
  padding: 0;
  overflow: hidden;
  position: relative;
}
/* Subtiler Anker: Haarlinie OBEN (nie links – CLAUDE.md), Tiefe über Flächenwechsel. */
.dim-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--line-strong);
}
.dim-card__inner {
  padding: 22px;
}
/* Gleichrangige Dimensionen: neutrale Mono-Indexziffer statt Ampel-Balken. */
.dim-card__head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 2px;
}
.dim-card__idx {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 700;
  font-size: 24px;
  line-height: 1;
  color: var(--line-strong);
  font-variant-numeric: tabular-nums;
}
.dim-card__name {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
}
.dim-card h3 {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: 18px;
  letter-spacing: -0.01em;
  margin-top: 10px;
  color: var(--ink);
}
.dim-card p {
  font-size: 14px;
  line-height: 1.58;
  color: var(--ink-soft);
  margin-top: 12px;
}

/* ---- „Was es nicht ist" – Kontrastliste (kein Severity-Farbton) ---- */
.contrast {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 24px;
}
.contrast__col {
  background: var(--canvas);
  border: 1px solid var(--line);
  border-radius: var(--r);
  padding: 22px;
}
.contrast__col--is {
  background: var(--surface);
  border-color: var(--line-strong);
}
.contrast__col h3 {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 14px;
}
.contrast__col ul {
  list-style: none;
}
.contrast__col li {
  font-size: 15px;
  line-height: 1.5;
  color: var(--ink-soft);
  padding: 8px 0;
  border-top: 1px solid var(--line-soft);
  display: flex;
  gap: 10px;
}
.contrast__col li:first-child {
  border-top: none;
}
.contrast__col li .mark {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 700;
  color: var(--subtle);
  flex: 0 0 auto;
}
.contrast__col--is li .mark {
  color: var(--ink);
}

/* ---- §5 Angaben (Haltung / Verwendungsform) – zwei Karten mit echten Tool-Optionen ---- */
.angaben {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 24px;
}
.angaben__card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r);
  padding: 22px;
}
.angaben__kicker {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--subtle);
  margin-bottom: 10px;
}
.angaben__card h3 {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 600;
  font-size: 17px;
  letter-spacing: -0.01em;
  color: var(--ink);
}
.angaben__opts {
  list-style: none;
  margin: 14px 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
/* Statische Tool-Optionen – reine Labels, KEINE Klick-Affordanz (Codex). */
.chip {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 12px;
  letter-spacing: 0.02em;
  color: var(--ink-soft);
  background: var(--canvas);
  border: 1px solid var(--line);
  border-radius: 3px;
  padding: 4px 9px;
}
.angaben__hint {
  font-size: 14px;
  line-height: 1.55;
  color: var(--muted);
  margin-top: 14px;
}

/* ---- Validierte Grenzen (F2) – vier Panels, gleiche Sprache wie .angaben ---- */
.limits-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 24px;
}

/* ---- Datenschutz-Kurzblock + CTA-Link ---- */
.inline-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 600;
  font-size: 15px;
  color: var(--ink);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: var(--line-strong);
  margin-top: 18px;
}
.inline-cta:hover {
  text-decoration-color: var(--ink);
}

/* ---- Schluss-CTA-Block ---- */
.closing {
  background: var(--canvas);
  border: 1.5px solid var(--ink);
  border-radius: var(--r);
  padding: clamp(28px, 5vw, 44px);
  margin: 48px 0 64px;
  text-align: center;
}
.closing h2 {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(24px, 4vw, 34px);
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: var(--ink);
}
.closing__dot {
  color: var(--accent);
}
.closing__cta {
  margin-top: 22px;
}
.arrow {
  display: inline-block;
}

/* ---- Figure-Note / Bildunterschrift (dezent) ---- */
.figure-note {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--subtle);
  margin-top: 14px;
}

/* ============================================================ */
/* RESPONSIVE                                                    */
/* ============================================================ */
@media (max-width: 719px) {
  .dims,
  .contrast,
  .angaben,
  .limits-grid,
  .s1-grid {
    grid-template-columns: 1fr;
  }
  .hero__head {
    padding: 40px 0 32px;
  }
  /* §1-Randnotiz rutscht unter den Text, wieder mit Abstand wie ursprünglich. */
  .s1-grid .theory {
    margin-top: 8px;
  }
  /* §8-Drop-Figure über dem Text, ohne trennende rechte Linie. */
  .s8-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .s8-figure {
    flex-direction: row;
    align-items: baseline;
    gap: 14px;
    border-right: none;
    border-bottom: 1px solid var(--line-soft);
    padding-right: 0;
    padding-bottom: 18px;
  }
  .s8-figure__num {
    font-size: 56px;
  }
}
@media (min-width: 720px) and (max-width: 959px) {
  .dims {
    grid-template-columns: 1fr;
  }
}

/* ============================================================ */
/* DRUCK – dunkle Sektionen (§2·b, §4) auf hell zurücksetzen,    */
/* sonst erzwingt die globale Druckregel vollflächigen Dunkel-   */
/* druck (analog zu index.vue).                                  */
/* ============================================================ */
@media print {
  .section--ink {
    background: #fff;
    border-color: var(--line);
  }
  .section--ink .section__index,
  .section--ink .figure-note {
    color: var(--muted);
  }
  .section--ink h2 {
    color: var(--ink);
  }
  .section--ink .section__body p {
    color: var(--ink-soft);
  }
  .s4__bg,
  .s4__scrim {
    display: none;
  }
  /* Ohne Foto keine zweispaltige Reihe nötig – sonst klafft rechts Leerraum. */
  .s4__top {
    grid-template-columns: 1fr;
    min-height: 0;
  }
  .s4__panel {
    background: #fff;
    border-color: var(--line);
  }
}
</style>
