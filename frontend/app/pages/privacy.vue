<script setup lang="ts">
// Datenschutz-Subpage (/privacy) – originalgetreuer Port des Prototyps
// (_shared/privacy.html, Variante C „Laborjournal"). Copy verbatim aus der
// kanonischen revDSG-Fassung content/privacy.md.
//
// Skip-Link, AppHeader und AppFooter liefert das default-Layout; diese Seite
// liefert NUR den Inhalt (kein eigenes <main>, keinen aktiven Nav-Zustand).
//
// [D2] Verantwortliche Stelle, Kontakt-Mail und Gültig-ab-Datum sind seit
// 2026-07-10 ausgefüllt (Claudio Riz, claudio.riz@stud.fhgr.ch).
// i18n (Frontend, Seitentext-Migration): Prosa/Tabellen aus pages.privacy.*,
// Titel als Getter -> folgt dem Sprachwechsel ohne Reload.
const { t } = useI18n()
useHead({ title: () => t('seo.privacy.title') })
</script>

<template>
  <article class="doc">
    <header class="doc__head">
      <p class="doc__kicker">{{ $t('pages.privacy.kicker') }}</p>
      <h1>{{ $t('pages.privacy.h1') }}</h1>
      <p class="doc__valid">{{ $t('pages.privacy.valid') }}</p>
    </header>

    <p class="doc__lead">{{ $t('pages.privacy.lead') }}</p>

    <nav class="doc__toc" :aria-label="$t('pages.privacy.toc.aria')">
      <NuxtLink to="#verantwortlicher">{{ $t('pages.privacy.toc.responsible') }}</NuxtLink> ·
      <NuxtLink to="#worum">{{ $t('pages.privacy.toc.about') }}</NuxtLink> ·
      <NuxtLink to="#daten">{{ $t('pages.privacy.toc.data') }}</NuxtLink> ·
      <NuxtLink to="#drittanbieter">{{ $t('pages.privacy.toc.thirdParties') }}</NuxtLink> ·
      <NuxtLink to="#dauer">{{ $t('pages.privacy.toc.retention') }}</NuxtLink> ·
      <NuxtLink to="#rechte">{{ $t('pages.privacy.toc.rights') }}</NuxtLink> ·
      <NuxtLink to="#cookies">{{ $t('pages.privacy.toc.cookies') }}</NuxtLink> ·
      <NuxtLink to="#sicherheit">{{ $t('pages.privacy.toc.security') }}</NuxtLink> ·
      <NuxtLink to="#stand">{{ $t('pages.privacy.toc.status') }}</NuxtLink>
    </nav>

    <section id="verantwortlicher">
      <h2><span class="num">1</span>{{ $t('pages.privacy.responsible.title') }}</h2>
      <p>{{ $t('pages.privacy.responsible.p1') }}</p>
      <p><strong>{{ $t('pages.privacy.responsible.name') }}</strong></p>
      <p>{{ $t('pages.privacy.responsible.p2') }}</p>
      <p>
        {{ $t('pages.privacy.responsible.contact') }}
        <strong><a href="mailto:claudio.riz@stud.fhgr.ch">claudio.riz@stud.fhgr.ch</a></strong>
      </p>
    </section>

    <section id="worum">
      <h2><span class="num">2</span>{{ $t('pages.privacy.about.title') }}</h2>
      <p>{{ $t('pages.privacy.about.p') }}</p>
    </section>

    <section id="daten">
      <h2><span class="num">3</span>{{ $t('pages.privacy.data.title') }}</h2>
      <table>
        <thead>
          <tr>
            <th>{{ $t('pages.privacy.data.head.category') }}</th>
            <th>{{ $t('pages.privacy.data.head.content') }}</th>
            <th>{{ $t('pages.privacy.data.head.when') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ $t('pages.privacy.data.rows.image.cat') }}</td>
            <td>{{ $t('pages.privacy.data.rows.image.content') }}</td>
            <td>{{ $t('pages.privacy.data.rows.image.when') }}</td>
          </tr>
          <tr>
            <td>{{ $t('pages.privacy.data.rows.optional.cat') }}</td>
            <td>{{ $t('pages.privacy.data.rows.optional.content') }}</td>
            <td>{{ $t('pages.privacy.data.rows.optional.when') }}</td>
          </tr>
          <tr>
            <td>{{ $t('pages.privacy.data.rows.technical.cat') }}</td>
            <td>{{ $t('pages.privacy.data.rows.technical.content') }}</td>
            <td>{{ $t('pages.privacy.data.rows.technical.when') }}</td>
          </tr>
          <tr>
            <td>{{ $t('pages.privacy.data.rows.bypassCookie.cat') }}</td>
            <td>{{ $t('pages.privacy.data.rows.bypassCookie.content') }}</td>
            <td>{{ $t('pages.privacy.data.rows.bypassCookie.when') }}</td>
          </tr>
          <tr>
            <td>{{ $t('pages.privacy.data.rows.langCookie.cat') }}</td>
            <td>{{ $t('pages.privacy.data.rows.langCookie.content') }}</td>
            <td>{{ $t('pages.privacy.data.rows.langCookie.when') }}</td>
          </tr>
          <tr>
            <td>{{ $t('pages.privacy.data.rows.serverLogs.cat') }}</td>
            <td>{{ $t('pages.privacy.data.rows.serverLogs.content') }}</td>
            <td>{{ $t('pages.privacy.data.rows.serverLogs.when') }}</td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>{{ $t('pages.privacy.data.notProcessedLabel') }}</strong>
        {{ $t('pages.privacy.data.notProcessedBody') }}
      </p>
    </section>

    <section id="drittanbieter">
      <h2><span class="num">4</span>{{ $t('pages.privacy.thirdParties.title') }}</h2>
      <p>{{ $t('pages.privacy.thirdParties.intro') }}</p>
      <table>
        <thead>
          <tr>
            <th>{{ $t('pages.privacy.thirdParties.head.provider') }}</th>
            <th>{{ $t('pages.privacy.thirdParties.head.location') }}</th>
            <th>{{ $t('pages.privacy.thirdParties.head.purpose') }}</th>
            <th>{{ $t('pages.privacy.thirdParties.head.transmitted') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ $t('pages.privacy.thirdParties.rows.google.provider') }}</td>
            <td>{{ $t('pages.privacy.thirdParties.rows.google.loc') }}</td>
            <td>{{ $t('pages.privacy.thirdParties.rows.google.purpose') }}</td>
            <td>{{ $t('pages.privacy.thirdParties.rows.google.data') }}</td>
          </tr>
          <tr>
            <td>{{ $t('pages.privacy.thirdParties.rows.anthropic.provider') }}</td>
            <td>{{ $t('pages.privacy.thirdParties.rows.anthropic.loc') }}</td>
            <td>{{ $t('pages.privacy.thirdParties.rows.anthropic.purpose') }}</td>
            <td>{{ $t('pages.privacy.thirdParties.rows.anthropic.data') }}</td>
          </tr>
          <tr>
            <td>{{ $t('pages.privacy.thirdParties.rows.modal.provider') }}</td>
            <td>{{ $t('pages.privacy.thirdParties.rows.modal.loc') }}</td>
            <td>{{ $t('pages.privacy.thirdParties.rows.modal.purpose') }}</td>
            <td>{{ $t('pages.privacy.thirdParties.rows.modal.data') }}</td>
          </tr>
          <!-- [D2 erledigt 2026-07-10] Upstash-Dashboard verifiziert: AWS eu-central-1 (Frankfurt), Free Tier ohne Read-Replicas -->
          <tr>
            <td>{{ $t('pages.privacy.thirdParties.rows.upstash.provider') }}</td>
            <td>{{ $t('pages.privacy.thirdParties.rows.upstash.loc') }}</td>
            <td>{{ $t('pages.privacy.thirdParties.rows.upstash.purpose') }}</td>
            <td>{{ $t('pages.privacy.thirdParties.rows.upstash.data') }}</td>
          </tr>
          <tr>
            <td>{{ $t('pages.privacy.thirdParties.rows.vercel.provider') }}</td>
            <td>{{ $t('pages.privacy.thirdParties.rows.vercel.loc') }}</td>
            <td>{{ $t('pages.privacy.thirdParties.rows.vercel.purpose') }}</td>
            <td>{{ $t('pages.privacy.thirdParties.rows.vercel.data') }}</td>
          </tr>
          <tr>
            <td>{{ $t('pages.privacy.thirdParties.rows.fonts.provider') }}</td>
            <td>{{ $t('pages.privacy.thirdParties.rows.fonts.loc') }}</td>
            <td>{{ $t('pages.privacy.thirdParties.rows.fonts.purpose') }}</td>
            <td>{{ $t('pages.privacy.thirdParties.rows.fonts.data') }}</td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>{{ $t('pages.privacy.thirdParties.usaLabel') }}</strong>
        {{ $t('pages.privacy.thirdParties.usaBody') }}
      </p>
      <p><strong>{{ $t('pages.privacy.thirdParties.policiesHeading') }}</strong></p>
      <ul>
        <li>Google LLC: <a href="https://policies.google.com/privacy">https://policies.google.com/privacy</a></li>
        <li>
          Anthropic: <a href="https://privacy.claude.com/en/">https://privacy.claude.com/en/</a>
          ({{ $t('pages.privacy.thirdParties.anthropicApiNote') }}
          <a href="https://platform.claude.com/docs/en/legal-center/privacy">https://platform.claude.com/docs/en/legal-center/privacy</a>)
        </li>
        <li>
          Modal Labs, Inc.: <a href="https://modal.com/legal/privacy-policy">https://modal.com/legal/privacy-policy</a>
          ({{ $t('pages.privacy.thirdParties.modalSecurityNote') }}
          <a href="https://modal.com/docs/guide/security">https://modal.com/docs/guide/security</a>)
        </li>
        <li>Vercel Inc.: <a href="https://vercel.com/legal/privacy-policy">https://vercel.com/legal/privacy-policy</a></li>
        <li>Upstash, Inc.: <a href="https://upstash.com/trust/privacy.pdf">https://upstash.com/trust/privacy.pdf</a></li>
      </ul>
    </section>

    <section id="dauer">
      <h2><span class="num">5</span>{{ $t('pages.privacy.retention.title') }}</h2>
      <table>
        <thead>
          <tr>
            <th>{{ $t('pages.privacy.retention.head.data') }}</th>
            <th>{{ $t('pages.privacy.retention.head.retention') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ $t('pages.privacy.retention.rows.image.label') }}</td>
            <td>{{ $t('pages.privacy.retention.rows.image.value') }}</td>
          </tr>
          <tr>
            <td>{{ $t('pages.privacy.retention.rows.texts.label') }}</td>
            <td>{{ $t('pages.privacy.retention.rows.texts.value') }}</td>
          </tr>
          <tr>
            <td>{{ $t('pages.privacy.retention.rows.modal.label') }}</td>
            <td>{{ $t('pages.privacy.retention.rows.modal.value') }}</td>
          </tr>
          <tr>
            <td>{{ $t('pages.privacy.retention.rows.dailyLimit.label') }}</td>
            <td>{{ $t('pages.privacy.retention.rows.dailyLimit.value') }}</td>
          </tr>
          <tr>
            <td>{{ $t('pages.privacy.retention.rows.bypassCookie.label') }}</td>
            <td>{{ $t('pages.privacy.retention.rows.bypassCookie.value') }}</td>
          </tr>
          <tr>
            <td>{{ $t('pages.privacy.retention.rows.langCookie.label') }}</td>
            <td>{{ $t('pages.privacy.retention.rows.langCookie.value') }}</td>
          </tr>
          <tr>
            <td>{{ $t('pages.privacy.retention.rows.serverLogs.label') }}</td>
            <td>{{ $t('pages.privacy.retention.rows.serverLogs.value') }}</td>
          </tr>
          <tr>
            <td>{{ $t('pages.privacy.retention.rows.others.label') }}</td>
            <td>{{ $t('pages.privacy.retention.rows.others.value') }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section id="rechte">
      <h2><span class="num">6</span>{{ $t('pages.privacy.rights.title') }}</h2>
      <p>{{ $t('pages.privacy.rights.intro') }}</p>
      <ul>
        <li><strong>{{ $t('pages.privacy.rights.access.term') }}</strong> {{ $t('pages.privacy.rights.access.desc') }}</li>
        <li><strong>{{ $t('pages.privacy.rights.correction.term') }}</strong> {{ $t('pages.privacy.rights.correction.desc') }}</li>
        <li>
          <strong>{{ $t('pages.privacy.rights.deletion.term') }}</strong> {{ $t('pages.privacy.rights.deletion.desc') }}
        </li>
        <li><strong>{{ $t('pages.privacy.rights.portability.term') }}</strong></li>
        <li><strong>{{ $t('pages.privacy.rights.objection.term') }}</strong> {{ $t('pages.privacy.rights.objection.desc') }}</li>
      </ul>
      <i18n-t keypath="pages.privacy.rights.complaint" tag="p" scope="global">
        <template #right>
          <strong>{{ $t('pages.privacy.rights.complaintRight') }}</strong>
        </template>
      </i18n-t>
      <p>
        {{ $t('pages.privacy.rights.contact') }}
        <strong><a href="mailto:claudio.riz@stud.fhgr.ch">claudio.riz@stud.fhgr.ch</a></strong>.
      </p>
    </section>

    <section id="cookies">
      <h2><span class="num">7</span>{{ $t('pages.privacy.cookies.title') }}</h2>
      <i18n-t keypath="pages.privacy.cookies.p1" tag="p" scope="global">
        <template #no>
          <strong>{{ $t('pages.privacy.cookies.p1Emphasis') }}</strong>
        </template>
      </i18n-t>
      <i18n-t keypath="pages.privacy.cookies.p2" tag="p" scope="global">
        <template #bypass>
          <strong>{{ $t('pages.privacy.cookies.p2Bypass') }}</strong>
        </template>
        <template #lang>
          <strong>{{ $t('pages.privacy.cookies.p2Lang') }}</strong>
        </template>
      </i18n-t>
    </section>

    <section id="sicherheit">
      <h2><span class="num">8</span>{{ $t('pages.privacy.security.title') }}</h2>
      <ul>
        <li>{{ $t('pages.privacy.security.item1') }}</li>
        <li>{{ $t('pages.privacy.security.item2') }}</li>
        <li>{{ $t('pages.privacy.security.item3') }}</li>
        <li>{{ $t('pages.privacy.security.item4') }}</li>
      </ul>
    </section>

    <section id="stand">
      <h2><span class="num">9</span>{{ $t('pages.privacy.status.title') }}</h2>
      <i18n-t keypath="pages.privacy.status.p" tag="p" scope="global">
        <template #date>
          <strong>{{ $t('pages.privacy.status.date') }}</strong>
        </template>
      </i18n-t>
    </section>
  </article>
</template>

<style scoped>
/* ============================================================ */
/* /privacy – Lesespalte für Lang-Text (Variante C „Laborjournal") */
/* ============================================================ */
.doc {
  max-width: var(--container-text);
  margin-inline: auto;
  padding: 56px var(--gutter) 80px;
}

.doc__head {
  padding-bottom: 24px;
  margin-bottom: 32px;
  border-bottom: 1px solid var(--line);
}
.doc__kicker {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--subtle);
}
.doc__head h1 {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(28px, 4.5vw, 38px);
  letter-spacing: -0.02em;
  margin-top: 8px;
  line-height: 1.1;
  color: var(--ink);
}
.doc__valid {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 12px;
  color: var(--muted);
  margin-top: 10px;
}

.doc__lead {
  font-size: 17px;
  line-height: 1.62;
  color: var(--ink-soft);
  max-width: 64ch;
  margin-bottom: 36px;
}

/* Inhaltsverzeichnis (ruhig) */
.doc__toc {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 40px;
  line-height: 1.9;
}
.doc__toc a {
  color: var(--ink-soft);
  text-decoration: none;
}
.doc__toc a:hover {
  text-decoration: underline;
}
.doc__toc a:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
}

.doc section {
  margin-bottom: 40px;
  scroll-margin-top: calc(var(--header-h, 64px) + 16px);
}
.doc h2 {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: 21px;
  letter-spacing: -0.01em;
  margin-bottom: 14px;
  color: var(--ink);
}
.doc h2 .num {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 500;
  font-size: 14px;
  color: var(--subtle);
  margin-right: 10px;
}
.doc h3 {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 600;
  font-size: 16px;
  margin: 20px 0 8px;
  color: var(--ink);
}
.doc p {
  font-size: 16px;
  line-height: 1.65;
  color: var(--ink-soft);
  margin-bottom: 12px;
  max-width: 68ch;
}
.doc ul {
  margin: 0 0 12px 1.1em;
}
.doc li {
  font-size: 16px;
  line-height: 1.6;
  color: var(--ink-soft);
  margin-bottom: 5px;
}
.doc a {
  color: var(--ink);
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-color: var(--line-strong);
}
.doc a:hover {
  text-decoration-color: var(--ink);
}
.doc a:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
}
.doc strong {
  color: var(--ink);
  font-weight: 600;
}

/* Schlichte bordered Tabelle (kein Schatten, kein Akzent-Zebra) */
.doc table {
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0 16px;
  font-size: 14px;
}
.doc th,
.doc td {
  text-align: left;
  vertical-align: top;
  padding: 9px 12px;
  border: 1px solid var(--line);
}
.doc th {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  background: var(--surface-2);
}
.doc td {
  background: var(--surface);
  color: var(--ink-soft);
  line-height: 1.5;
}

</style>
