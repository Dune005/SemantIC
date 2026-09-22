<script setup lang="ts">
// Ergebnisseite /studie – Ergebnisse der Rezeptionsstudie für die Teilnehmenden (Vault:
// «Ergebnis-Kommunikation Teilnehmende», Notizen 02–05). Text wortgleich aus Notiz 02,
// Grafiken G1–G5 nach Notiz 03, Bildbeispiel fl-ceo-02, Auflösung aufklappbar (default zu),
// Thesis auf Anfrage per Mail, Kontakt. Kein Leistungstest, keine Produktwerbung, kein Tracking.
// Skip-Link, AppHeader, <main> und AppFooter liefert das default-Layout.
//
// Sprache: eine URL für DE und EN (i18n no_prefix); Titel/Description als Getter folgen dem
// Sprachwechsel. Die Akzentfarbe der Grafiken ist ein lokaler Alias (--study-accent) auf dem
// Seiten-Root – tokens.css bleibt unangetastet.
import Disclosure from '~/components/ui/Disclosure.vue'

const { t, tm, rt } = useI18n()
useHead({
  title: () => t('seo.studie.title'),
  meta: [{ name: 'description', content: () => t('seo.studie.description') }],
})

// String-Array-Messages (s2 Punkt 3, s5). Muster wie how-it-works.vue: tm() liefert kompilierte
// Message-Nodes → jedes Element über rt() auflösen; computed folgt dem Sprachwechsel.
const list = (key: string): string[] => (tm(key) as unknown[]).map((m) => rt(m as string))
const pt3Items = computed(() => list('pages.studie.s2.pt3.items'))
const s5Items = computed(() => list('pages.studie.s5.items'))

// Disclosure ist kontrolliert (:open + update:open) → Zustand hier halten. Default: zu.
const revealOpen = ref(false)

const CONTACT_EMAIL = 'claudio.riz@students.fhgr.ch'
</script>

<template>
  <article class="studie">
    <!-- ================= Kopf ================= -->
    <header class="head">
      <div class="page page--text">
        <h1>{{ $t('pages.studie.head.title') }}</h1>
        <p class="head__sub">{{ $t('pages.studie.head.subtitle') }}</p>
        <p class="head__meta">{{ $t('pages.studie.head.meta') }}</p>
      </div>
    </header>

    <!-- ================= 1 · Worum es ging ================= -->
    <section class="section" aria-labelledby="s1-title">
      <div class="page page--text">
        <p class="section__index">{{ $t('pages.studie.s1.index') }}</p>
        <h2 id="s1-title">{{ $t('pages.studie.s1.title') }}</h2>
        <div class="section__body">
          <p>{{ $t('pages.studie.s1.p1') }}</p>
          <p>{{ $t('pages.studie.s1.p1b') }}</p>
          <i18n-t keypath="pages.studie.s1.p2" tag="p" scope="global">
            <template #question><strong>{{ $t('pages.studie.s1.p2Question') }}</strong></template>
          </i18n-t>
          <p>{{ $t('pages.studie.s1.p3') }}</p>
        </div>
      </div>
    </section>

    <!-- ================= 2 · Das Wichtigste in vier Punkten ================= -->
    <section class="section" aria-labelledby="s2-title">
      <div class="page page--text">
        <p class="section__index">{{ $t('pages.studie.s2.index') }}</p>
        <h2 id="s2-title">{{ $t('pages.studie.s2.title') }}</h2>

        <div class="point">
          <h3>{{ $t('pages.studie.s2.pt1.h3') }}</h3>
          <div class="section__body">
            <p>{{ $t('pages.studie.s2.pt1.p1') }}</p>
          </div>
          <div class="figure-card">
            <StudieChartRecognition />
          </div>
          <div class="section__body">
            <p>{{ $t('pages.studie.s2.pt1.p2') }}</p>
          </div>
        </div>

        <div class="point">
          <h3>{{ $t('pages.studie.s2.pt2.h3') }}</h3>
          <div class="section__body">
            <p>{{ $t('pages.studie.s2.pt2.p1') }}</p>
            <p>{{ $t('pages.studie.s2.pt2.p2') }}</p>
          </div>
          <div class="figure-card">
            <StudieChartCredibility />
          </div>
          <div class="section__body">
            <p>{{ $t('pages.studie.s2.pt2.p3') }}</p>
          </div>
        </div>

        <div class="point">
          <h3>{{ $t('pages.studie.s2.pt3.h3') }}</h3>
          <div class="section__body">
            <p>{{ $t('pages.studie.s2.pt3.p1') }}</p>
            <ul class="body-list">
              <li v-for="(item, i) in pt3Items" :key="i">{{ item }}</li>
            </ul>
          </div>
          <div class="figure-card">
            <StudieChartErrorsNamed />
          </div>
          <StudieFigureCeo />
          <div class="section__body">
            <p>{{ $t('pages.studie.s2.pt3.p2') }}</p>
            <p>{{ $t('pages.studie.s2.pt3.p3') }}</p>
          </div>
        </div>

        <div class="point">
          <h3>{{ $t('pages.studie.s2.pt4.h3') }}</h3>
          <div class="section__body">
            <p>{{ $t('pages.studie.s2.pt4.p1') }}</p>
          </div>
          <div class="figure-card">
            <StudieChartChoice />
          </div>
          <div class="section__body">
            <p>{{ $t('pages.studie.s2.pt4.p2') }}</p>
          </div>
          <div class="figure-card">
            <StudieChartReasons />
          </div>
        </div>
      </div>
    </section>

    <!-- ================= 3 · Blick hinter die Kulissen ================= -->
    <section class="section" aria-labelledby="s3-title">
      <div class="page page--text">
        <p class="section__index">{{ $t('pages.studie.s3.index') }}</p>
        <h2 id="s3-title">{{ $t('pages.studie.s3.title') }}</h2>
        <div class="section__body">
          <p>{{ $t('pages.studie.s3.p1') }}</p>
          <p>{{ $t('pages.studie.s3.p2') }}</p>
          <p>{{ $t('pages.studie.s3.p3') }}</p>
        </div>
      </div>
    </section>

    <!-- ================= 4 · Was heisst das? ================= -->
    <section class="section" aria-labelledby="s4-title">
      <div class="page page--text">
        <p class="section__index">{{ $t('pages.studie.s4.index') }}</p>
        <h2 id="s4-title">{{ $t('pages.studie.s4.title') }}</h2>
        <div class="section__body">
          <p>{{ $t('pages.studie.s4.p1') }}</p>
          <p>{{ $t('pages.studie.s4.p1b') }}</p>
          <p>{{ $t('pages.studie.s4.p2') }}</p>
          <p>{{ $t('pages.studie.s4.p3') }}</p>
        </div>
      </div>
    </section>

    <!-- ================= 5 · Ablauf und Grenzen ================= -->
    <section class="section" aria-labelledby="s5-title">
      <div class="page page--text">
        <p class="section__index">{{ $t('pages.studie.s5.index') }}</p>
        <h2 id="s5-title">{{ $t('pages.studie.s5.title') }}</h2>
        <div class="section__body">
          <ul class="body-list">
            <li v-for="(item, i) in s5Items" :key="i">{{ item }}</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ================= 6 · Auflösung (aufklappbar) ================= -->
    <section class="section" aria-labelledby="s6-title">
      <div class="page page--text">
        <p class="section__index">{{ $t('pages.studie.s6.index') }}</p>
        <h2 id="s6-title">{{ $t('pages.studie.s6.title') }}</h2>
        <div class="reveal">
          <Disclosure v-model:open="revealOpen" :title="$t('pages.studie.s6.toggle')">
            <StudieReveal />
          </Disclosure>
        </div>
      </div>
    </section>

    <!-- ================= 7 · Weiterführend ================= -->
    <section class="section" aria-labelledby="s7-title">
      <div class="page page--text">
        <p class="section__index">{{ $t('pages.studie.s7.index') }}</p>
        <h2 id="s7-title">{{ $t('pages.studie.s7.title') }}</h2>
        <div class="section__body">
          <ul class="body-list">
            <li>{{ $t('pages.studie.s7.thesis') }}</li>
            <li>{{ $t('pages.studie.s7.semantic') }}</li>
            <li>
              {{ $t('pages.studie.s7.contact') }}
              <a class="mail" :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>
            </li>
          </ul>
          <p class="privacy">{{ $t('pages.studie.s7.privacy') }}</p>
        </div>
      </div>
    </section>
  </article>
</template>

<style scoped>
/* Seiten-Root: einzige Chromfarbe der Grafiken als lokaler Alias (Notiz 03: eine Akzentfarbe
   plus Grau). --substance ist der warme Dataviz-Ton «Inhalt/Integrität» aus tokens.css. */
.studie {
  --study-accent: var(--substance);
}

/* ============================================================ */
/* PAGE LAYOUT (Muster how-it-works.vue)                          */
/* ============================================================ */
.page {
  max-width: var(--container);
  margin-inline: auto;
  padding: 0 var(--gutter);
}
.page--text {
  max-width: var(--container-text);
}

/* ---- Kopf: ruhiger Textkopf, kein Moodbild (Ergebnisseite, kein Werbekopf) ---- */
.head {
  padding: clamp(48px, 8vw, 88px) 0 clamp(28px, 4vw, 40px);
  border-bottom: 1px solid var(--line-soft);
}
.head h1 {
  font-family: var(--sans);
  font-weight: 700;
  font-size: clamp(32px, 6vw, 52px);
  letter-spacing: -0.025em;
  line-height: 1.04;
  color: var(--ink);
  max-width: 16ch;
}
.head__sub {
  margin-top: 18px;
  font-size: clamp(17px, 2.2vw, 20px);
  line-height: 1.5;
  color: var(--ink-soft);
  max-width: 40ch;
}
.head__meta {
  margin-top: 22px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--subtle);
}

/* ---- Sektionen ---- */
.section {
  padding-block: 40px 48px;
  border-bottom: 1px solid var(--line-soft);
}
.section:last-of-type {
  border-bottom: none;
}
.section__index {
  font-family: var(--mono);
  font-weight: 500;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--subtle);
}
.section h2 {
  font-family: var(--sans);
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
.body-list {
  margin-top: 16px;
  padding-left: 1.2em;
  display: grid;
  gap: 10px;
}
.body-list li {
  font-size: 16px;
  line-height: 1.65;
  color: var(--ink-soft);
}
.body-list li::marker {
  color: var(--subtle);
}

/* ---- Die vier Punkte (s2): h3 mit Hairline darüber, Grafiken dazwischen ---- */
.point {
  margin-top: 36px;
  padding-top: 28px;
  border-top: 1px solid var(--line-soft);
}
.point h3 {
  font-family: var(--sans);
  font-weight: 700;
  font-size: clamp(18px, 2.4vw, 22px);
  letter-spacing: -0.015em;
  line-height: 1.25;
  color: var(--ink);
  max-width: 34ch;
}

/* ---- Grafik-Träger (Muster how-it-works .figure-card) ---- */
.figure-card {
  margin-top: 24px;
  padding: clamp(20px, 4vw, 36px);
  background: var(--canvas);
  border: 1px solid var(--line);
  border-radius: var(--r);
}

/* ---- Auflösung ---- */
.reveal {
  margin-top: 20px;
  border-bottom: 1px solid var(--line);
}

/* ---- Weiterführend ---- */
.mail {
  color: var(--ink);
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-color: var(--line-strong);
}
.mail:hover {
  text-decoration-color: var(--ink);
}
.section__body .privacy {
  font-style: italic;
  font-size: 14px;
  color: var(--muted);
  margin-top: 28px;
}

@media (max-width: 719px) {
  .section {
    padding-block: 32px 40px;
  }
  .point {
    margin-top: 28px;
    padding-top: 22px;
  }
}
</style>
