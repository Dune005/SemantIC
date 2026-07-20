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

useHead({
  title: 'So funktioniert SemantIC – SemantIC',
})
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
    <p class="hero__credit">KI-generiertes Moodbild</p>
    <div class="hero__inner">
      <div class="page">
        <header class="hero__head">
          <p class="hero__kicker">So funktioniert SemantIC</p>
          <h1>Was passiert, wenn SemantIC dein Bild prüft.</h1>
          <p class="hero__lead">
            SemantIC nimmt ein KI-generiertes Bild und sieht es sich entlang von drei
            Dimensionen an: ob es physikalisch plausibel ist, ob es inhaltlich Sinn
            ergibt und welche Klischees es trägt. Auf dieser Seite zeigen wir dir, was
            das Tool tut, woher seine Kriterien kommen und – genauso wichtig – was es
            bewusst nicht tut.
          </p>
        </header>
      </div>
    </div>
  </section>

  <!-- ================= 1 · MASKIERUNGSEFFEKT ================= -->
  <section class="section" aria-labelledby="s1-title">
    <div class="page page--text">
      <p class="section__index">01 · Die Idee dahinter</p>
      <h2 id="s1-title">Warum gute Bilder ihre eigenen Fehler verstecken.</h2>
      <div class="s1-grid">
        <div class="section__body">
          <p class="s1-lead">
            KI-Bildgeneratoren optimieren auf das, was sofort als „gut" gelesen wird:
            Schärfe, Farbe, Licht, Komposition. Auf die inhaltliche Stimmigkeit –
            Logik der Szene, Proportionen, Klischees – optimieren sie weit weniger.
            Bilder werden so zuverlässig schön, aber nicht zuverlässig richtig.
          </p>
          <p>
            Die Folge ist das eigentliche Problem: Ein überzeugendes Bild lädt nicht
            dazu ein, genauer hinzusehen. Die Oberfläche beruhigt das Auge, und
            Schwächen rutschen durch. Diesen Zusammenhang nennen wir
            <strong>Maskierung</strong> – die Arbeitsthese hinter SemantIC: Eine
            überzeugende Oberfläche kann die kritische Prüfung erschweren. Die Studie
            dahinter stützt diese Annahme, beweisen kann sie sie nicht.
          </p>
        </div>

        <!-- Theoriebezug: ruhige Randnotiz (Card-Variante) -->
        <Card tone="sunken" border="hair" padding="none" class="card theory">
          <p class="card__kicker">Theoriebezug</p>
          <p>
            Dieser Effekt ist nicht nur eine Beobachtung, sondern lässt sich
            wissenschaftlich einordnen. Neuere Forschung zeigt an KI-Erkennungssystemen,
            dass künstliche neuronale Netze visuelle Eigenschaften priorisieren, während
            Menschen Bilder stärker über ihre Bedeutung erfassen. Dass dasselbe für
            Bildgeneratoren gilt, ist die Annahme dieser Arbeit. SemantIC setzt genau in
            diese Lücke: Es schaut dorthin, wo das Auge zu schnell zufrieden ist.
          </p>
        </Card>
      </div>
    </div>
  </section>

  <!-- ================= 2 · ABLAUF IN DREI SCHRITTEN ================= -->
  <section class="section" aria-labelledby="s2-title">
    <div class="page">
      <p class="section__index">02 · Der Ablauf</p>
      <h2 id="s2-title">Vom Bild zum Befund.</h2>

      <div class="figure-card">
        <p class="figure-card__lead">
          SemantIC trennt Inhalt und Ästhetik in zwei getrennte Bewertungsstränge –
          damit die Wirkung das inhaltliche Urteil nicht beschönigt. Die Ästhetik
          wird doppelt geschätzt: von einem Vision-Modell und einem unabhängigen
          Referenzmodell; weichen beide stark voneinander ab, weist der Befund das
          aus. Erst danach werden beide Ergebnisse zusammengeführt.
        </p>
        <PipelineDiagram />
        <p class="figure-note">
          Modellagnostisch – Gemini &amp; Claude sind die aktuellen Standard-Modelle,
          austauschbar. Der Ästhetik-Score ist der Mittelwert aus Claude und einem
          unabhängigen Referenzmodell (LAION Aesthetic Predictor); weichen beide um
          20 Punkte oder mehr ab, weist der Befund das aus, fällt die Referenz aus,
          zählt Claude allein. Gibst du Prompt oder Kontext an, läuft zusätzlich ein
          Bild-Text-Abgleich (CLIP) mit – ein reines Diagnosesignal ohne Einfluss auf
          Scores und Ampeln. Die Symbole sind stilisierte Platzhalter.
        </p>
      </div>
    </div>
  </section>

  <!-- ============ 2·b · LEITPLANKEN DER BEWERTUNG (dunkle Sektion) ============ -->
  <section class="section section--ink" aria-labelledby="s2b-title">
    <div class="page">
      <p class="section__index">02 · b · Die Leitplanken</p>
      <h2 id="s2b-title">Die Leitplanken der Bewertung.</h2>
      <div class="section__body">
        <p>
          Ein Bildmodell allein neigt dazu, sich von visueller Perfektion leiten zu
          lassen. SemantIC legt der Bewertung deshalb Leitplanken an, die auf belegte,
          nachvollziehbare Urteile hinwirken.
        </p>
      </div>

      <div class="section__figure">
        <GuardrailList />
      </div>
      <div class="section__body">
        <p>
          Das macht die Bewertung disziplinierter und nachvollziehbarer. Wo das Tool
          an Grenzen stösst, legt SemantIC das offen (Abschnitt „Wir kennen die Grenzen").
        </p>
      </div>
      <p class="figure-note">
        „Maskiert → klar": Tendenz gedämpft, Leitplanke scharf. Grösstenteils hart
        erzwungen (festes Schema &amp; Prüfregeln); die Kriterien stammen aus 144
        codierten Bildern.
      </p>
    </div>
  </section>

  <!-- ================= 3 · DIE DREI DIMENSIONEN ================= -->
  <section class="section" aria-labelledby="s3-title">
    <div class="page">
      <p class="section__index">03 · Die drei Dimensionen</p>
      <h2 id="s3-title">Was hinter Physik, Semantik und Bias steckt.</h2>

      <div class="dims">
        <!-- Gleichrangige Dimensionen: neutrale Mono-Indexziffer statt Ampel-Akzent. -->
        <article class="dim-card">
          <div class="dim-card__inner">
            <div class="dim-card__head">
              <span class="dim-card__idx" aria-hidden="true">01</span>
              <p class="dim-card__name">Physik</p>
            </div>
            <h3>Physikalische Kohärenz</h3>
            <p>
              Gehorcht das Bild den Naturgesetzen? Licht, Schatten, Anatomie,
              Proportionen, Materialien. Solche Brüche sind oft klein – aber sie
              verraten ein Bild zuverlässig, wenn man sie einmal sieht.
            </p>
          </div>
        </article>
        <article class="dim-card">
          <div class="dim-card__inner">
            <div class="dim-card__head">
              <span class="dim-card__idx" aria-hidden="true">02</span>
              <p class="dim-card__name">Semantik</p>
            </div>
            <h3>Semantische Konsistenz</h3>
            <p>
              Ergibt die Szene Sinn – und passt sie zu deinem Kontext? Ein technisch
              sauberes Bild kann inhaltlich trotzdem danebenliegen: eine Situation,
              die so nicht stattfinden würde, oder die nicht zu deinem Beitrag passt.
            </p>
          </div>
        </article>
        <article class="dim-card">
          <div class="dim-card__inner">
            <div class="dim-card__head">
              <span class="dim-card__idx" aria-hidden="true">03</span>
              <p class="dim-card__name">Bias</p>
            </div>
            <h3>Bias und Stereotypisierung</h3>
            <p>
              Welche Rollen, Posen, Klischees zeigt das Bild? Ein schönes Bild eines
              Klischees bleibt ein Klischee. Wichtig: Geschlecht oder Hautfarbe sind
              für sich kein Befund – erst eine stereotype Rollenbesetzung, Machtdynamik
              oder ein Kontextbruch schlägt an.
            </p>
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
          <p class="section__index">04 · Der Maskierungs-Check</p>
          <h2 id="s4-title">Wenn die Oberfläche stärker ist als der Inhalt.</h2>
          <div class="section__body">
            <p>
              SemantIC bewertet getrennt, wie gut ein Bild aussieht (die Ästhetik) und wie
              gut es inhaltlich hält (die Integrität). Liegt die Wirkung deutlich über der
              Substanz, ist das der Nährboden für Maskierung – die perfekte Oberfläche
              kann Fehler überdecken, bevor du sie bemerkst. Eine einzelne Maskierungs-Kennzahl
              gibt es bewusst nicht; der Quadrant zeigt das Prinzip, nicht das Resultat
              einer Prüfung.
            </p>
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
      <p class="section__index">05 · Deine Angaben</p>
      <h2 id="s5-title">Warum du das Bild einordnen sollst.</h2>
      <div class="section__body">
        <p>
          Bevor SemantIC prüft, fragen wir zwei Dinge: deine
          <strong>Haltung</strong> zum Bild und seine
          <strong>Verwendungsform</strong>. Beide rahmen nur die Empfehlung – sie
          verschieben weder den Score noch die Befunde.
        </p>
      </div>

      <div class="angaben">
        <div class="angaben__card">
          <p class="angaben__kicker">Haltung</p>
          <h3>Welche Funktion hat das Bild?</h3>
          <ul class="angaben__opts" aria-label="Auswahl im Tool">
            <li class="chip">Standard</li>
            <li class="chip">Bestätigend</li>
            <li class="chip">Kritisch</li>
            <li class="chip">Illustrativ</li>
          </ul>
          <p class="angaben__hint">
            Dieselbe Schwäche wiegt anders, je nachdem ob ein Bild ein Klischee
            bewusst zeigt oder es unreflektiert reproduziert.
          </p>
        </div>
        <div class="angaben__card">
          <p class="angaben__kicker">Verwendungsform</p>
          <h3>Wofür ist es gedacht?</h3>
          <ul class="angaben__opts" aria-label="Auswahl im Tool">
            <li class="chip">Headerbild</li>
            <li class="chip">Moodbild</li>
            <li class="chip">Symbolbild</li>
            <li class="chip">Illustration</li>
            <li class="chip">Social-Post</li>
            <li class="chip">Werbe-/Marketingbild</li>
            <li class="chip">Editorial-Bild</li>
          </ul>
          <p class="angaben__hint">
            Daraus leitet SemantIC ab, wie streng der Massstab sein sollte.
          </p>
        </div>
      </div>
      <p class="figure-note">Auswahl im Tool – hier nur zur Übersicht, nicht anklickbar.</p>
    </div>
  </section>

  <!-- ================= 6 · HINWEIS STATT NACHWEIS ================= -->
  <section class="section" aria-labelledby="s6-title">
    <div class="page page--text">
      <p class="section__index">06 · Hinweis statt Nachweis</p>
      <h2 id="s6-title">Warum SemantIC dir nichts beweist.</h2>
      <div class="section__body">
        <p>
          SemantIC gibt keine harten Urteile, sondern begründete Hinweise: Jeder
          Befund zeigt, wo du genauer hinsehen solltest – nicht, dass ein Bild
          „falsch" ist. Ob es in deinen Kontext passt, entscheidet kein Werkzeug für
          dich; die letzte Beurteilung bleibt bei dir.
        </p>
      </div>

      <!-- Kontrast: Was SemantIC ist / nicht ist (kein Severity-Farbton) -->
      <div class="contrast">
        <div class="contrast__col contrast__col--is">
          <h3>Was SemantIC ist</h3>
          <ul>
            <li><span class="mark" aria-hidden="true">+</span><span>Ein Qualitäts- und Integritäts-Bewerter für KI-Bilder</span></li>
            <li><span class="mark" aria-hidden="true">+</span><span>Ein Werkzeug, das dir zeigt, wo du genauer hinsehen solltest</span></li>
            <li><span class="mark" aria-hidden="true">+</span><span>Eine Einordnung vor der Veröffentlichung – die Entscheidung bleibt bei dir</span></li>
          </ul>
        </div>
        <div class="contrast__col">
          <h3>Was SemantIC nicht ist</h3>
          <ul>
            <li><span class="mark" aria-hidden="true">–</span><span>Kein Fake- oder Deepfake-Detektor</span></li>
            <li><span class="mark" aria-hidden="true">–</span><span>Kein „echt oder gefälscht"-Verdikt über die Herkunft</span></li>
            <li><span class="mark" aria-hidden="true">–</span><span>Kein Ersatz für dein eigenes redaktionelles Urteil</span></li>
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
      <p class="section__index">07 · Validierte Grenzen</p>
      <h2 id="s7-title">Wir kennen die Grenzen – und legen sie offen.</h2>
      <div class="section__body">
        <p>
          Jede Grenze hier ist empirisch geprüft – in dokumentierten Testreihen gegen
          die menschliche Codierung, bei der Anatomie zusätzlich verblindet mit einem
          zweiten Vision-Modell. Du sollst wissen, wann du dich auf einen Befund
          verlassen kannst und wann dein eigener Blick gefragt ist.
        </p>
      </div>

      <div class="limits-grid">
        <Card tone="paper" border="hair" padding="none" class="card card--paper">
          <p class="card__kicker">Im Test belastbar</p>
          <h3>Die rote Ampel</h3>
          <p>
            Im dokumentierten Anatomie-Testlauf (16 Bilder, 42 Läufe) löste kein
            sauberes Bild einen roten Befund aus. Zeigt SemantIC rot, nimm es ernst –
            gelbe Hinweise können dagegen auch mal danebenliegen.
          </p>
        </Card>
        <Card tone="paper" border="hair" padding="none" class="card card--paper">
          <p class="card__kicker">Richtig lesen</p>
          <h3>Grün heisst: nichts gefunden</h3>
          <p>
            Grün heisst „nichts gefunden" – nicht „fehlerfrei". Es fokussiert deine
            Sichtprüfung, ersetzt sie nicht.
          </p>
        </Card>
        <Card tone="paper" border="hair" padding="none" class="card card--paper">
          <p class="card__kicker">Bekannte Lücke</p>
          <h3>Anatomie: Flag = Prüfauftrag</h3>
          <p>
            Lokale Hand- und Finger-Artefakte findet das Tool eher als strukturelle
            Körperfehler (Kopf, Gliedmassen, Beinstellung) – aber bildabhängig: In
            den Tests gab es übersehene wie fälschlich gemeldete Befunde, über zwei
            Vision-Modelle hinweg geprüft. Ein Anatomie-Flag ist deshalb ein
            Prüfauftrag an dich, keine Diagnose.
          </p>
        </Card>
        <Card tone="paper" border="hair" padding="none" class="card card--paper">
          <p class="card__kicker">Einordnung</p>
          <h3>Schwere ist eine Einschätzung</h3>
          <p>
            Schwer, moderat, gering sind eine Einschätzung des Vision-Modells, keine
            Messung. Ob ein markierter Punkt publikationskritisch ist, entscheidet
            dein Blick aufs Bild.
          </p>
        </Card>
      </div>

      <div class="section__body">
        <p>
          Dieselben Tests zeigten auch Befunde, die ein menschlicher Blick übersehen
          hatte. Die Hinweise ergänzen deine Sichtprüfung – jeder Befund ist mit
          Markierung am Bild nachprüfbar gebaut.
        </p>
      </div>
    </div>
  </section>

  <!-- Auflockerung · KI-Moodbild (Prüfstapel mit roten Punkten) vor dem Forschungsteil:
       nimmt das Sichten/Markieren vieler Bilder auf – Bezug zur Phase-1-Analyse. -->
  <MoodBand src="/landing/band-pruefstapel.webp" />

  <!-- ================= 8 · WOHER DIE KRITERIEN STAMMEN ================= -->
  <section class="section" aria-labelledby="s8-title">
    <div class="page page--text">
      <p class="section__index">08 · Woher die Kriterien stammen</p>
      <h2 id="s8-title">Forschung, kein generisches Modellwissen.</h2>
      <div class="s8-grid">
        <aside class="s8-figure" aria-hidden="true">
          <span class="s8-figure__num">144</span>
          <span class="s8-figure__cap">codierte Bilder</span>
        </aside>
        <div class="section__body">
          <p>
            Die Prüflogik stützt sich auf eine eigene empirische Grundlage: eine
            qualitative Inhaltsanalyse von 144 KI-generierten Bildern. Daraus entstanden
            die wiederkehrenden Fehlerprofile, die Lesearten und die visuellen Treiber,
            mit denen das Tool arbeitet – der praktische Teil der Bachelorarbeit „Visual
            Bias im KI-generierten Bild" (Multimedia-Production, FH Graubünden).
          </p>
          <p>
            Die Pipeline wurde über dokumentierte Iterationen entwickelt und gegen die
            menschliche Codierung geprüft – die validierten Grenzen oben stammen aus
            genau diesen Tests. Sie ist bewusst modellagnostisch: Kriterien,
            Evidenz-Pflicht und Prüfregeln hängen an der Forschungsbasis, nicht an einem
            KI-Modell. Die eingesetzten Modelle sind austauschbar – das Prüfraster
            bleibt.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- ================= 9 · DATENSCHUTZ IN EINEM SATZ ================= -->
  <section class="section" aria-labelledby="s9-title">
    <div class="page page--text">
      <p class="section__index">09 · Datenschutz</p>
      <h2 id="s9-title">Was mit deinem Bild passiert.</h2>
      <div class="section__body">
        <p>
          Dein Bild wird zur Analyse an externe Dienste übermittelt und bei SemantIC
          selbst nicht gespeichert – was genau an wen geht und wie lange etwas
          aufbewahrt wird, steht in der Datenschutzerklärung.
        </p>
      </div>
      <NuxtLink to="/privacy" class="inline-cta">Zur Datenschutzerklärung →</NuxtLink>
    </div>
  </section>

  <!-- ================= SCHLUSS-CTA ================= -->
  <div class="page page--text">
    <div class="closing">
      <h2>Genug Theorie. Lass ein Bild prüfen<span class="closing__dot">.</span></h2>
      <div class="closing__cta">
        <Button as="a" href="/analyze" variant="primary" size="md">
          Bild prüfen lassen <span class="arrow" aria-hidden="true">→</span>
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
