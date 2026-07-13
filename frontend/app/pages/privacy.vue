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
useHead({ title: 'Datenschutz – SemantIC' })
</script>

<template>
  <article class="doc">
    <header class="doc__head">
      <p class="doc__kicker">Datenschutz · revDSG</p>
      <h1>Datenschutzerklärung</h1>
      <p class="doc__valid">
        Gilt ab 10. Juli 2026 · Schweizer Datenschutzrecht (revDSG)
      </p>
    </header>

    <p class="doc__lead">
      SemantIC verarbeitet so wenige Daten wie möglich. Hier liest du, welche Daten
      wann anfallen, an wen sie weitergegeben werden und wie lange sie bleiben.
    </p>

    <nav class="doc__toc" aria-label="Inhaltsverzeichnis">
      <NuxtLink to="#verantwortlicher">1 Verantwortliche Stelle</NuxtLink> ·
      <NuxtLink to="#worum">2 Worum geht es?</NuxtLink> ·
      <NuxtLink to="#daten">3 Welche Daten</NuxtLink> ·
      <NuxtLink to="#drittanbieter">4 An wen übermittelt</NuxtLink> ·
      <NuxtLink to="#dauer">5 Speicherdauer</NuxtLink> ·
      <NuxtLink to="#rechte">6 Deine Rechte</NuxtLink> ·
      <NuxtLink to="#cookies">7 Cookies und Tracking</NuxtLink> ·
      <NuxtLink to="#sicherheit">8 Sicherheit</NuxtLink> ·
      <NuxtLink to="#stand">9 Stand</NuxtLink>
    </nav>

    <section id="verantwortlicher">
      <h2><span class="num">1</span>Verantwortliche Stelle</h2>
      <p>Verantwortlich für die Bearbeitung der Personendaten ist:</p>
      <p><strong>Claudio Riz</strong></p>
      <p>
        SemantIC ist ein Lehrprojekt im Rahmen der Bachelorarbeit „Visual Bias im
        KI-generierten Bild" im Studiengang Multimedia-Production an der FH Graubünden.
        Verantwortlich für Inhalt und Betrieb des Tools ist der Bearbeiter als
        Privatperson, nicht die FH Graubünden.
      </p>
      <p>
        Bei Fragen zum Datenschutz erreichst du die verantwortliche Stelle unter:
        <strong><a href="mailto:claudio.riz@stud.fhgr.ch">claudio.riz@stud.fhgr.ch</a></strong>
      </p>
    </section>

    <section id="worum">
      <h2><span class="num">2</span>Worum geht es?</h2>
      <p>
        SemantIC prüft KI-generierte Bilder vor der Veröffentlichung. Für diese Prüfung
        wird dein Bild kurzzeitig an externe Dienste übermittelt. Es wird nichts
        dauerhaft gespeichert – kein Account, keine Datenbank, kein Bildarchiv.
      </p>
    </section>

    <section id="daten">
      <h2><span class="num">3</span>Welche Daten werden bearbeitet?</h2>
      <table>
        <thead>
          <tr><th>Datenkategorie</th><th>Inhalt</th><th>Wann</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Bild</td>
            <td>Das von dir hochgeladene Bild, base64-kodiert</td>
            <td>Bei jedem Klick auf „Bild prüfen"</td>
          </tr>
          <tr>
            <td>Optionale Angaben</td>
            <td>Nutzungskontext und Original-Prompt (Freitext, je ≤ 2 000 Zeichen) sowie die redaktionelle Haltung (feste Auswahl)</td>
            <td>Nur wenn du sie angibst</td>
          </tr>
          <tr>
            <td>Technische Daten</td>
            <td>IP-Adresse, Zeitstempel</td>
            <td>Bei jeder Analyse (für das Tageslimit von 3 Analysen pro 24 Stunden) und beim Einlösen eines Zugangscodes</td>
          </tr>
          <tr>
            <td>Bypass-Cookie</td>
            <td>Ein HMAC-signierter Wert ohne personenbezogenen Inhalt</td>
            <td>Nur wenn du einen Zugangscode eingelöst hast</td>
          </tr>
          <tr>
            <td>Sprach-Cookie</td>
            <td>Deine Sprachwahl (z.&nbsp;B. „de"), kein personenbezogener Inhalt</td>
            <td>Nur wenn du die Sprache manuell umschaltest</td>
          </tr>
          <tr>
            <td>Server-Logs</td>
            <td>Vercel-Standard-Logs (angefragter Pfad, Status, Dauer)</td>
            <td>Bei jeder Anfrage</td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>Nicht verarbeitet werden:</strong> Name, E-Mail-Adresse, Accounts, Standortdaten,
        Geräte-IDs oder Browser-Fingerprinting.
      </p>
    </section>

    <section id="drittanbieter">
      <h2><span class="num">4</span>An wen werden Daten übermittelt?</h2>
      <p>
        Für die Analyse arbeitet SemantIC mit externen Dienstleistern. An sie wird nur
        das übermittelt, was der jeweilige Schritt braucht:
      </p>
      <table>
        <thead>
          <tr><th>Anbieter</th><th>Sitz</th><th>Zweck</th><th>Was übermittelt wird</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Google LLC (Gemini API)</td>
            <td>USA</td>
            <td>Bildanalyse</td>
            <td>Bild und optionale Angaben (Nutzungskontext, Original-Prompt, redaktionelle Haltung)</td>
          </tr>
          <tr>
            <td>Anthropic, PBC (Claude API)</td>
            <td>USA</td>
            <td>Ästhetik-Bewertung</td>
            <td>nur das Bild, keine Texte</td>
          </tr>
          <tr>
            <td>Modal Labs, Inc. (Rechen-Endpoints)</td>
            <td>USA</td>
            <td>Ästhetik-Referenzwert (LAION) und Bild-Text-Abgleich (CLIP)</td>
            <td>Bild; für den Bild-Text-Abgleich zusätzlich Nutzungskontext und Original-Prompt (nicht die redaktionelle Haltung)</td>
          </tr>
          <!-- [D2 erledigt 2026-07-10] Upstash-Dashboard verifiziert: AWS eu-central-1 (Frankfurt), Free Tier ohne Read-Replicas -->
          <tr>
            <td>Upstash, Inc. (Redis, EU-Region)</td>
            <td>EU</td>
            <td>Tageslimit-Zähler und Schutz vor dem Durchprobieren von Zugangscodes</td>
            <td>IP-Adresse, Zeitstempel</td>
          </tr>
          <tr>
            <td>Vercel Inc. (Hosting)</td>
            <td>USA</td>
            <td>Auslieferung der Webseite und Betrieb der Funktionen</td>
            <td>Alle Anfragedaten – bei einer Analyse laufen auch Bild und Texte durch die Vercel-Funktion – sowie Funktions-Logs</td>
          </tr>
          <tr>
            <td>Google LLC (Fonts)</td>
            <td>USA</td>
            <td>Auslieferung der Schriften (IBM Plex)</td>
            <td>IP-Adresse, User-Agent und angeforderte Schrift-URL, bei jedem Seitenaufruf</td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>Übermittlung in die USA:</strong> Bei Google, Anthropic, Modal und Vercel findet
        eine Datenübermittlung in die USA statt. Google, Anthropic und Vercel sind unter dem
        Swiss-U.S. Data Privacy Framework (DPF) zertifiziert. Die Schweiz hat das DPF als
        Adäquanz-Mechanismus anerkannt – die Übermittlung an DPF-zertifizierte
        US-Unternehmen ist damit nach revDSG zulässig. Modal ist nicht DPF-zertifiziert;
        hier stützt sich die Übermittlung auf die EU-Standardvertragsklauseln (SCC) im
        Auftragsverarbeitungsvertrag von Modal, der das Schweizer Datenschutzrecht
        ausdrücklich einbezieht. Der Rate-Limit-Zähler bei Upstash liegt in der EU-Region,
        hier findet keine Übermittlung in ein Drittland statt.
      </p>
      <p><strong>Datenschutzerklärungen der Anbieter:</strong></p>
      <ul>
        <li>Google LLC: <a href="https://policies.google.com/privacy">https://policies.google.com/privacy</a></li>
        <li>
          Anthropic: <a href="https://privacy.claude.com/en/">https://privacy.claude.com/en/</a>
          (verbindlich für die API:
          <a href="https://platform.claude.com/docs/en/legal-center/privacy">https://platform.claude.com/docs/en/legal-center/privacy</a>)
        </li>
        <li>
          Modal Labs, Inc.: <a href="https://modal.com/legal/privacy-policy">https://modal.com/legal/privacy-policy</a>
          (Speicherfristen und Sicherheit:
          <a href="https://modal.com/docs/guide/security">https://modal.com/docs/guide/security</a>)
        </li>
        <li>Vercel Inc.: <a href="https://vercel.com/legal/privacy-policy">https://vercel.com/legal/privacy-policy</a></li>
        <li>Upstash, Inc.: <a href="https://upstash.com/trust/privacy.pdf">https://upstash.com/trust/privacy.pdf</a></li>
      </ul>
    </section>

    <section id="dauer">
      <h2><span class="num">5</span>Wie lange werden Daten gespeichert?</h2>
      <table>
        <thead>
          <tr><th>Daten</th><th>Aufbewahrung</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Bild</td>
            <td>Auf dem SemantIC-Server nicht gespeichert. Es liegt nur während der Analyse im Arbeitsspeicher und wird danach verworfen. Keine Datenbank, kein Schreibzugriff auf die Festplatte.</td>
          </tr>
          <tr>
            <td>Texte</td>
            <td>Wie das Bild – nur während der Analyse im Arbeitsspeicher.</td>
          </tr>
          <tr>
            <td>Bei Modal (Referenzwert, Abgleich)</td>
            <td>Ein- und Ausgaben der Rechen-Endpoints werden verschlüsselt zwischengespeichert und spätestens nach 7 Tagen gelöscht (gemäss Modal-Dokumentation).</td>
          </tr>
          <tr>
            <td>Tageslimit-Zähler (IP)</td>
            <td>Maximal 24 Stunden, dann automatisch gelöscht.</td>
          </tr>
          <tr>
            <td>Bypass-Cookie</td>
            <td>Im Browser, maximal 30 Tage. Du kannst es jederzeit über die Browser-Einstellungen löschen.</td>
          </tr>
          <tr>
            <td>Sprach-Cookie</td>
            <td>Im Browser, maximal 1 Jahr. Ebenfalls jederzeit über die Browser-Einstellungen löschbar.</td>
          </tr>
          <tr>
            <td>Server-Logs (Vercel)</td>
            <td>Im aktuellen Vercel-Tarif (Hobby) maximal 1 Stunde.</td>
          </tr>
          <tr>
            <td>Bei den übrigen Analyse-Anbietern</td>
            <td>Nach deren eigenen Richtlinien – darauf haben wir keinen Einfluss, deshalb sind oben ihre Datenschutzerklärungen verlinkt.</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section id="rechte">
      <h2><span class="num">6</span>Deine Rechte</h2>
      <p>Nach revDSG hast du das Recht auf:</p>
      <ul>
        <li><strong>Auskunft</strong> über die zu dir bearbeiteten Daten</li>
        <li><strong>Berichtigung</strong> unrichtiger Daten</li>
        <li>
          <strong>Löschung</strong> – soweit überhaupt Daten vorliegen; bei SemantIC ist das sehr
          beschränkt, weil nichts dauerhaft gespeichert wird
        </li>
        <li><strong>Datenübertragbarkeit</strong></li>
        <li><strong>Widerspruch</strong> gegen die Bearbeitung</li>
      </ul>
      <p>
        Ausserdem hast du ein <strong>Beschwerderecht beim Eidgenössischen Datenschutz- und
        Öffentlichkeitsbeauftragten (EDÖB)</strong>.
      </p>
      <p>
        Für Anfragen wendest du dich an die verantwortliche Stelle:
        <strong><a href="mailto:claudio.riz@stud.fhgr.ch">claudio.riz@stud.fhgr.ch</a></strong>.
      </p>
    </section>

    <section id="cookies">
      <h2><span class="num">7</span>Cookies und Tracking</h2>
      <p>
        SemantIC setzt <strong>kein</strong> Tracking ein – kein Google Analytics, kein Plausible,
        kein Matomo, keine Werbe-Cookies, keine Drittparty-Cookies.
      </p>
      <p>
        SemantIC setzt genau zwei Cookies, beide rein funktional: Den
        <strong>Bypass-Cookie</strong> – er wird nur gesetzt, wenn du selbst einen Zugangscode
        einlöst, ist HMAC-signiert (also nicht fälschbar), enthält keinen personenbezogenen
        Inhalt und läuft nach 30 Tagen ab. Und den <strong>Sprach-Cookie</strong> – er merkt
        sich deine Sprachwahl, wenn du sie manuell umschaltest, und läuft nach einem Jahr ab.
        Beide sind technisch für ihre Funktion nötig und dienen keinem Tracking – deshalb
        braucht SemantIC keinen Cookie-Banner.
      </p>
    </section>

    <section id="sicherheit">
      <h2><span class="num">8</span>Sicherheit</h2>
      <ul>
        <li>Die gesamte Übertragung läuft verschlüsselt über HTTPS.</li>
        <li>Der Bypass-Cookie ist HMAC-signiert und damit nicht fälschbar.</li>
        <li>Ein IP-basiertes Tageslimit schützt vor Missbrauch.</li>
        <li>Bilder werden zu keinem Zeitpunkt dauerhaft gespeichert.</li>
      </ul>
    </section>

    <section id="stand">
      <h2><span class="num">9</span>Stand dieser Erklärung</h2>
      <p>
        Diese Datenschutzerklärung gilt ab <strong>10. Juli 2026</strong>. Bei
        Änderungen wird das Datum aktualisiert.
      </p>
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
