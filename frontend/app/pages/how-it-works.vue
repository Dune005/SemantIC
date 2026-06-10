<script setup lang="ts">
// Erklärseite /how-it-works (how-it-works-spec.md + how-it-works.html · content/how-it-works.md).
// Originalgetreuer Port von Variante C „Laborjournal" (FIX). Skip-Link, AppHeader und
// AppFooter liefert das default-Layout; diese Seite liefert NUR den Inhalt (kein eigenes
// <main>, keinen aktiven Nav-Zustand – das regelt layouts/default.vue via route.path).
//
// Die drei Schema-Grafiken sind seitenlokale CSS-Skizzen (kein ViewModel, keine Daten-
// bindung); Werte (86/64/+22) sind statisch hartkodiert. Das Maskierungs-Beispiel ist
// bewusst NICHT die ScoreBar-Komponente, sondern zwei Gauge-Balken + Δ + lokales Badge
// (Spec §2: ScoreBar/Chip/DimBadge/NoteBlock hier explizit weggelassen).
import Button from '~/components/ui/Button.vue'
import Card from '~/components/ui/Card.vue'

useHead({
  title: 'So funktioniert SemantIC – SemantIC',
})
</script>

<template>
  <!-- ================= SEITENKOPF ================= -->
  <div class="page page--text">
    <header class="page-head">
      <p class="page-head__kicker">So funktioniert SemantIC</p>
      <h1>Was passiert, wenn du ein Bild prüfst.</h1>
      <p class="page-head__lead">
        SemantIC nimmt ein KI-generiertes Bild und sieht es sich entlang von drei
        Dimensionen an: ob es physikalisch plausibel ist, ob es inhaltlich Sinn
        ergibt und welche Klischees es trägt. Auf dieser Seite zeigen wir dir, was
        das Tool tut, woher seine Kriterien kommen und – genauso wichtig – was es
        bewusst nicht tut.
      </p>
    </header>
  </div>

  <!-- ================= 1 · MASKIERUNGSEFFEKT ================= -->
  <section class="section" aria-labelledby="s1-title">
    <div class="page page--text">
      <p class="section__index">01 · Die Idee dahinter</p>
      <h2 id="s1-title">Warum gute Bilder ihre eigenen Fehler verstecken.</h2>
      <div class="section__body">
        <p>
          KI-Bildgeneratoren optimieren auf das, was Menschen sofort als „gut"
          lesen: Schärfe, Farbe, Licht, Komposition. Auf die inhaltliche
          Stimmigkeit – ob eine Szene logisch ist, ob Proportionen passen, ob ein
          Bild nicht in ein Klischee kippt – optimieren sie weit weniger. Das
          Ergebnis ist eine systematische Schieflage: Bilder werden zuverlässig
          schön, aber nur zufällig richtig.
        </p>
        <p>
          Der entscheidende Punkt ist, was daraus folgt. Ein Bild, das visuell
          überzeugt, lädt nicht dazu ein, genauer hinzusehen. Die Oberfläche
          beruhigt das Auge, und die Schwächen rutschen durch. Genau diesen
          Mechanismus nennen wir <strong>Maskierung</strong>: Visuelle Perfektion
          maskiert inhaltliche und ethische Schwächen. Je überzeugender ein Bild,
          desto grösser die Gefahr, dass du seine Probleme übersiehst.
        </p>
      </div>

      <!-- Theoriebezug: ruhiger sunken-Panel (Card-Variante) -->
      <Card tone="sunken" border="hair" padding="none" class="card theory">
        <p class="card__kicker">Theoriebezug</p>
        <p>
          Dieser Effekt ist nicht nur eine Beobachtung, sondern lässt sich
          wissenschaftlich einordnen. Neuere Forschung zeigt, dass künstliche
          neuronale Netze visuelle Eigenschaften priorisieren, während Menschen
          Bilder stärker über ihre Bedeutung erfassen. SemantIC setzt genau in diese
          Lücke: Es schaut dorthin, wo das Auge zu schnell zufrieden ist.
        </p>
      </Card>

      <!-- Schematische Grafik: schöne Oberfläche vs. inhaltliche Schwäche -->
      <Card
        tone="surface"
        border="hair"
        padding="none"
        class="card flow-graphic theory"
        role="img"
        aria-label="Schema: Ein Bild hat eine überzeugende visuelle Oberfläche, darunter aber eine inhaltliche Schwäche. Die Oberfläche maskiert die Schwäche."
      >
        <p class="flow-graphic__title">Oberfläche vs. Inhalt</p>
        <div class="flow">
          <div class="flow__node">
            <span class="mono">Oberfläche</span>
            <strong>überzeugend</strong>
          </div>
          <div class="flow__arrow" aria-hidden="true">maskiert →</div>
          <div class="flow__node">
            <span class="mono">Inhalt</span>
            <strong>schwächer</strong>
          </div>
        </div>
        <p class="figure-note">Schematische Darstellung – endgültige Grafik im Bau.</p>
      </Card>
    </div>
  </section>

  <!-- ================= 2 · ABLAUF IN DREI SCHRITTEN ================= -->
  <section class="section" aria-labelledby="s2-title">
    <div class="page">
      <p class="section__index">02 · Der Ablauf</p>
      <h2 id="s2-title">Vom Bild zum Befund.</h2>

      <div class="steps">
        <Card as="article" tone="surface" border="hair" padding="none" class="step">
          <p class="step__label">01 · Eingabe</p>
          <p class="step__num">1</p>
          <h3>Du legst ein Bild ab und ordnest es ein</h3>
          <p>
            Du lädst dein KI-generiertes Bild hoch und sagst uns zwei Dinge: welche
            Haltung das Bild im Beitrag einnimmt und in welcher Form du es verwenden
            willst. Optional kannst du den Nutzungskontext und den ursprünglichen
            Prompt ergänzen – beides schärft die Einschätzung, ist aber kein Muss.
          </p>
        </Card>
        <Card as="article" tone="surface" border="hair" padding="none" class="step">
          <p class="step__label">02 · Analyse</p>
          <p class="step__num">2</p>
          <h3>SemantIC prüft entlang von drei Dimensionen</h3>
          <p>
            Das Bild wird auf physikalische Kohärenz, semantische Konsistenz und
            Bias untersucht. Parallel dazu bewerten wir getrennt seine rein visuelle
            Wirkung – bewusst getrennt, damit die Ästhetik den inhaltlichen Befund
            nicht beschönigt. Das dauert in der Regel zehn bis dreissig Sekunden.
          </p>
        </Card>
        <Card as="article" tone="surface" border="hair" padding="none" class="step">
          <p class="step__label">03 · Befund</p>
          <p class="step__num">3</p>
          <h3>Du bekommst ein Gesamturteil und die Details</h3>
          <p>
            Zuerst siehst du das Gesamturteil als Ampel – unauffällig, auffällig
            oder kritisch – mit einer klaren Empfehlung. Darunter die drei
            Dimensionen, die Leseart und, wo das Modell Überdeckungs-Stellen
            markiert hat, ein Maskierungs-Hinweis. Jeden einzelnen Befund kannst
            du aufklappen, bis hin zu den Rohdaten.
          </p>
        </Card>
      </div>

      <!-- Schematischer Drei-Schritt-Fluss -->
      <Card
        tone="surface"
        border="hair"
        padding="none"
        class="card flow-graphic"
        role="img"
        aria-label="Ablauf in drei Schritten: Eingabe, dann Analyse, dann Befund."
      >
        <p class="flow-graphic__title">Eingabe → Analyse → Befund</p>
        <div class="flow">
          <div class="flow__node"><span class="mono">01</span><strong>Eingabe</strong></div>
          <div class="flow__arrow" aria-hidden="true">→</div>
          <div class="flow__node"><span class="mono">02</span><strong>Analyse</strong></div>
          <div class="flow__arrow" aria-hidden="true">→</div>
          <div class="flow__node"><span class="mono">03</span><strong>Befund</strong></div>
        </div>
        <p class="figure-note">Schematische Darstellung – endgültige Grafik im Bau.</p>
      </Card>
    </div>
  </section>

  <!-- ================= 3 · DIE DREI DIMENSIONEN ================= -->
  <section class="section" aria-labelledby="s3-title">
    <div class="page">
      <p class="section__index">03 · Die drei Dimensionen</p>
      <h2 id="s3-title">Was hinter Physik, Semantik und Bias steckt.</h2>

      <div class="dims">
        <!-- Akzent OBEN als Severity-Echo (links ist verboten) -->
        <article class="dim-card dim-card--safe">
          <div class="dim-card__top" aria-hidden="true" />
          <div class="dim-card__inner">
            <p class="dim-card__name">Physik</p>
            <h3>Physikalische Kohärenz</h3>
            <p>
              Hier geht es um die Naturgesetze im Bild. Fällt das Licht konsistent?
              Stimmen Schatten mit ihren Quellen überein? Sind Körper, Hände und
              Gegenstände anatomisch und proportional plausibel? Verhalten sich
              Materialien – Glas, Metall, Stoff, Haut – so, wie sie sollten?
              Physikalische Brüche sind oft klein, aber sie verraten ein Bild
              zuverlässig, wenn man sie einmal sieht.
            </p>
          </div>
        </article>
        <article class="dim-card dim-card--warn">
          <div class="dim-card__top" aria-hidden="true" />
          <div class="dim-card__inner">
            <p class="dim-card__name">Semantik</p>
            <h3>Semantische Konsistenz</h3>
            <p>
              Hier geht es um den Sinn der Szene. Passen die Elemente logisch
              zusammen? Ergibt das Bild als Ganzes eine kohärente Situation? Und
              passt es zu dem Kontext, in dem du es verwenden willst? Ein technisch
              sauberes Bild kann inhaltlich trotzdem danebenliegen – etwa wenn es
              eine Szene zeigt, die so nicht stattfinden würde, oder die nicht zu
              deinem Beitrag passt.
            </p>
          </div>
        </article>
        <article class="dim-card dim-card--crit">
          <div class="dim-card__top" aria-hidden="true" />
          <div class="dim-card__inner">
            <p class="dim-card__name">Bias</p>
            <h3>Bias und Stereotypisierung</h3>
            <p>
              Hier geht es um soziale Verzerrungen. Welche Rollen sind wie besetzt?
              Folgen Posen, Kleidung, Kontext einem Klischee? Wird eine Gruppe
              einseitig dargestellt? Dies ist die heikelste Dimension, weil Bias sich
              besonders gut maskieren lässt: Ein schönes Bild eines Klischees bleibt
              ein Klischee. Wichtig dabei – das wahrgenommene Geschlecht oder die
              Hautfarbe einer Person sind für sich genommen kein Befund. Erst wenn
              daraus eine stereotype Rollenbesetzung, eine Machtdynamik oder ein
              Kontextbruch wird, schlägt SemantIC an.
            </p>
          </div>
        </article>
      </div>
    </div>
  </section>

  <!-- ================= 4 · MASKIERUNGS-CHECK ================= -->
  <section class="section" aria-labelledby="s4-title">
    <div class="page page--text">
      <p class="section__index">04 · Der Maskierungs-Check</p>
      <h2 id="s4-title">Wenn die Oberfläche stärker ist als der Inhalt.</h2>
      <div class="section__body">
        <p>
          SemantIC bewertet zwei Dinge strikt getrennt: wie gut ein Bild aussieht
          (die Ästhetik) und wie gut es inhaltlich hält (die Integrität). Liegt
          die Wirkung deutlich über der Substanz, ist das der Nährboden für
          Maskierung: Die perfekte Oberfläche kann Fehler überdecken, bevor du
          sie überhaupt bemerkst.
        </p>
        <p>
          Eine einzelne Maskierungs-Kennzahl findest du bei SemantIC bewusst
          nicht. Wir haben in der eigenen Validierung mehrere Messansätze geprüft
          – keiner hat der menschlichen Einschätzung standgehalten. Statt einer
          Scheinpräzision markiert der Befund konkret die Stellen, an denen ein
          ästhetischer Treiber einen Befund überdecken könnte, und benennt die
          Leseart, über die das Bild seine Wirkung erzeugt. Das ist am Bild
          nachprüfbar – eine Zahl wäre es nicht.
        </p>
      </div>

      <!-- Grafik: Ästhetik-Balken vs. Integritäts-Balken, Differenz markiert -->
      <Card
        tone="surface"
        border="hair"
        padding="none"
        class="card masking-graphic"
        role="img"
        aria-label="Beispiel: Ästhetik 86 von 100, Integrität 64 von 100. Das Bild wirkt stärker, als es inhaltlich hält – solche Lücken markiert SemantIC mit einem beschreibenden Hinweis."
      >
        <p class="card__kicker">Beispiel</p>
        <div class="gauge">
          <span class="gauge__lab">Ästhetik</span>
          <span class="gauge__track"><span class="gauge__fill gauge__fill--aesthetic" style="width:86%" /></span>
          <span class="gauge__val">86 / 100</span>
        </div>
        <div class="gauge">
          <span class="gauge__lab">Integrität</span>
          <span class="gauge__track"><span class="gauge__fill gauge__fill--integrity" style="width:64%" /></span>
          <span class="gauge__val">64 / 100</span>
        </div>
        <div class="masking-delta">
          <span class="mono">Maskierungs-Hinweis</span>
          <span class="badge badge--warn">Wirkung über Substanz</span>
        </div>
        <p class="figure-note">Schematische Darstellung – endgültige Grafik im Bau.</p>
      </Card>
    </div>
  </section>

  <!-- ================= 5 · LESEARTEN ================= -->
  <section class="section" aria-labelledby="s5-title">
    <div class="page">
      <p class="section__index">05 · Lesearten</p>
      <h2 id="s5-title">Wie ein Bild seine Wirkung erzeugt.</h2>
      <div class="section__body">
        <p>
          Jedes Bild erzeugt seine Überzeugungskraft auf eine bestimmte Art.
          SemantIC ordnet jedem Bild eine von fünf Lesearten zu – sie beschreibt,
          über welchen Bildstil das Bild seine Glaubwürdigkeit bezieht und damit
          auch, wie es potenziell maskiert.
        </p>
      </div>

      <table class="table">
        <caption class="table__caption mono">Die fünf Lesearten</caption>
        <thead>
          <tr><th scope="col">Code</th><th scope="col">Leseart</th><th scope="col">Wie sie wirkt</th></tr>
        </thead>
        <tbody>
          <tr><td class="code">WA</td><td class="name">Werbe-Ästhetik</td><td>Überzeugt über eine ideale, makellose Bildwelt</td></tr>
          <tr><td class="code">DA</td><td class="name">Dokumentarisch-Authentisch</td><td>Überzeugt über den Anschein von Objektivität</td></tr>
          <tr><td class="code">CI</td><td class="name">Cinematisch</td><td>Überzeugt über Filmstimmung und Atmosphäre</td></tr>
          <tr><td class="code">AA</td><td class="name">Amateur-Authentisch</td><td>Überzeugt über Vertrautheit und scheinbare Spontaneität</td></tr>
          <tr><td class="code">MI</td><td class="name">Magazin/Inszeniert</td><td>Überzeugt über Professionalität und Status</td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- ================= 6 · DEINE ANGABEN ================= -->
  <section class="section" aria-labelledby="s6-title">
    <div class="page">
      <p class="section__index">06 · Deine Angaben</p>
      <h2 id="s6-title">Warum du das Bild einordnen sollst.</h2>
      <div class="section__body">
        <p>
          Bevor SemantIC prüft, fragen wir nach zwei Dingen: deiner Haltung und der
          Verwendungsform. Beide rahmen die Empfehlung – sie sind keine
          Messfaktoren.
        </p>
      </div>

      <div class="input-frames">
        <Card tone="paper" border="hair" padding="none" class="card card--paper">
          <p class="card__kicker">Haltung</p>
          <h3>Welche Funktion hat das Bild?</h3>
          <p>
            Die Haltung sagt, welche Funktion das Bild in deinem Beitrag hat:
            Untermalt es das Thema bestätigend, ordnet es kritisch ein, dient es als
            neutrales Beispiel? Dieselbe Schwäche wiegt unterschiedlich, je nachdem,
            ob ein Bild ein Klischee bewusst zeigt oder es unreflektiert
            reproduziert.
          </p>
        </Card>
        <Card tone="paper" border="hair" padding="none" class="card card--paper">
          <p class="card__kicker">Verwendungsform</p>
          <h3>Wofür ist das Bild gedacht?</h3>
          <p>
            Die Verwendungsform sagt, wofür das Bild gedacht ist – ein flüchtiges
            Moodbild oder ein redaktionelles Bild mit Anspruch. Daraus leitet
            SemantIC ab, wie streng der Massstab sein sollte.
          </p>
        </Card>
      </div>

      <Card tone="sunken" border="hair" padding="none" class="card card--sunken important-note">
        <p class="card__kicker">Wichtig</p>
        <p>
          Beide Angaben verschieben weder den Score noch die Befunde. Sie ändern nur,
          wie die Empfehlung am Ende formuliert ist.
        </p>
      </Card>
    </div>
  </section>

  <!-- ================= 7 · HINWEIS STATT NACHWEIS ================= -->
  <section class="section" aria-labelledby="s7-title">
    <div class="page page--text">
      <p class="section__index">07 · Hinweis statt Nachweis</p>
      <h2 id="s7-title">Warum SemantIC dir nichts beweist.</h2>
      <div class="section__body">
        <p>
          SemantIC gibt dir keine harten Urteile, sondern begründete Hinweise. Jeder
          Befund ist eine Beobachtung, die dir zeigt, wo du genauer hinsehen solltest
          – nicht der Beweis, dass ein Bild „falsch" ist. Das ist eine bewusste
          Entscheidung. Ob ein Bild in deinen konkreten Kontext passt, kann ein
          Werkzeug nicht für dich entscheiden. Es kann dir nur die Stellen zeigen,
          die du sonst übersehen hättest. Die letzte Beurteilung bleibt bei dir.
        </p>
        <p>
          Aus demselben Grund verzichtet SemantIC auf ein „Fake oder echt"-Verdikt.
          Es bewertet die Qualität eines Bildes, von dem du bereits weisst, dass es
          KI-generiert ist – nicht seine Herkunft.
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

  <!-- ================= 8 · WOHER DIE KRITERIEN STAMMEN ================= -->
  <section class="section" aria-labelledby="s8-title">
    <div class="page page--text">
      <p class="section__index">08 · Woher die Kriterien stammen</p>
      <h2 id="s8-title">Forschung, kein generisches Modellwissen.</h2>
      <div class="section__body">
        <p>
          Die Prüflogik von SemantIC speist sich aus einer eigenen empirischen
          Grundlage: einer qualitativen Inhaltsanalyse von 144 KI-generierten
          Bildern. Daraus sind die Lesearten, die wiederkehrenden Fehlerprofile und
          die visuellen Treiber entstanden, mit denen das Tool arbeitet. Diese
          Heuristik ist der praktische Teil der Bachelorarbeit „Visual Bias im
          KI-generierten Bild" im Studiengang Multimedia-Production an der FH
          Graubünden. SemantIC stützt sich also nicht auf beliebiges Modellwissen,
          sondern auf eine nachvollziehbare, dokumentierte Forschungsbasis.
        </p>
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
          Dein Bild wird zur Analyse an externe Dienste übermittelt und danach nicht
          gespeichert – es gibt keine Datenbank, kein Archiv, keinen Account. Was
          genau an wen geht und wie lange etwas aufbewahrt wird, steht in der
          Datenschutzerklärung.
        </p>
      </div>
      <NuxtLink to="/privacy" class="inline-cta">Zur Datenschutzerklärung →</NuxtLink>
    </div>
  </section>

  <!-- ================= SCHLUSS-CTA ================= -->
  <div class="page page--text">
    <div class="closing">
      <h2>Genug Theorie. Prüf ein Bild<span class="closing__dot">.</span></h2>
      <div class="closing__cta">
        <Button as="a" href="/analyze" variant="primary" size="md">
          Bild prüfen <span class="arrow" aria-hidden="true">→</span>
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

.mono {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-feature-settings: 'tnum';
}

/* Seitenkopf (Mono-Kicker + H1 + Lead) */
.page-head {
  padding: 56px 0 36px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 48px;
}
.page-head__kicker {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--subtle);
}
.page-head h1 {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(28px, 5vw, 42px);
  letter-spacing: -0.02em;
  line-height: 1.08;
  margin-top: 12px;
  color: var(--ink);
}
.page-head__lead {
  font-size: clamp(15px, 2vw, 17px);
  line-height: 1.6;
  color: var(--ink-soft);
  margin-top: 18px;
  max-width: 60ch;
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

/* Theoriebezug-Panel (ruhig, sunken) */
.theory {
  margin-top: 28px;
}

/* ---- Ablauf in drei Schritten (Card-Reihe, kein Links-Streifen) ---- */
.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 28px;
}
.step {
  padding: 22px;
  display: flex;
  flex-direction: column;
}
.step__label {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}
.step__num {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: 34px;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--ink);
  margin: 14px 0 12px;
}
.step h3 {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 1.25;
  color: var(--ink);
}
.step p {
  font-size: 14px;
  line-height: 1.55;
  color: var(--muted);
  margin-top: 10px;
}

/* Schematischer Drei-Schritt-Fluss (CSS-Grafik, in Card eingebettet) */
.flow-graphic {
  margin-top: 20px;
  padding: 22px;
}
.flow-graphic__title {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--subtle);
  margin-bottom: 18px;
}
.flow {
  display: flex;
  align-items: stretch;
  gap: 0;
  flex-wrap: wrap;
}
.flow__node {
  flex: 1 1 0;
  min-width: 120px;
  background: var(--canvas);
  border: 1px solid var(--line);
  border-radius: var(--r);
  padding: 14px 12px;
  text-align: center;
}
.flow__node .mono {
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}
.flow__node strong {
  display: block;
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 600;
  font-size: 14px;
  margin-top: 6px;
  color: var(--ink);
}
.flow__arrow {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  color: var(--subtle);
  padding-inline: 10px;
}
@media (max-width: 639px) {
  .flow {
    flex-direction: column;
  }
  .flow__arrow {
    padding-block: 8px;
    transform: rotate(90deg);
  }
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
}
/* Akzent OBEN (erlaubt) statt links (verboten) – nur Severity-Echo, dezent. */
.dim-card__top {
  height: 4px;
}
.dim-card--safe .dim-card__top {
  background: var(--safe);
}
.dim-card--warn .dim-card__top {
  background: var(--warn);
}
.dim-card--crit .dim-card__top {
  background: var(--crit);
}
.dim-card__inner {
  padding: 22px;
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

/* ---- Badge (Demo, Primitive §4) ---- */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border: 1px solid var(--ink);
  border-radius: 3px;
  padding: 4px 9px;
  line-height: 1;
}
.badge--warn {
  background: var(--warn);
  color: var(--ink);
}

/* ---- Maskierungs-Grafik (Ästhetik vs. Integrität, CSS) ---- */
.masking-graphic {
  margin-top: 24px;
}
.gauge {
  display: grid;
  grid-template-columns: 88px 1fr 56px;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}
.gauge__lab {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}
.gauge__track {
  position: relative;
  height: 14px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 2px;
  overflow: hidden;
}
.gauge__fill {
  position: absolute;
  inset: 0 auto 0 0;
}
.gauge__fill--aesthetic {
  background: var(--ink-soft);
}
.gauge__fill--integrity {
  background: var(--muted);
}
.gauge__val {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 13px;
  color: var(--ink);
  text-align: right;
}
.masking-delta {
  margin-top: 6px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.masking-delta .mono {
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}

/* ---- Lesearten-Tabelle ---- */
.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 24px;
  font-size: 15px;
}
.table__caption {
  text-align: left;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--subtle);
  padding-bottom: 8px;
}
.table th,
.table td {
  text-align: left;
  vertical-align: top;
  padding: 11px 14px;
  border: 1px solid var(--line);
}
.table thead th {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  background: var(--surface-2);
}
.table td {
  background: var(--surface);
  color: var(--ink-soft);
  line-height: 1.5;
}
.table td.code {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 13px;
  color: var(--ink);
  white-space: nowrap;
}
.table td.name {
  font-weight: 600;
  color: var(--ink);
  white-space: nowrap;
}

/* ---- „Was es nicht ist" – Kontrastliste (kein Severity-Farbton) ---- */
.contrast {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 24px;
}
.contrast__col {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r);
  padding: 22px;
}
.contrast__col--is {
  background: var(--canvas);
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

/* ---- Angaben (Haltung / Verwendungsform) – zwei Panels ---- */
.input-frames {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 24px;
}
.important-note {
  margin-top: 16px;
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

/* ---- Grafik-Hinweis (im-Bau-Vermerk, dezent) ---- */
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
  .steps,
  .dims,
  .contrast,
  .input-frames {
    grid-template-columns: 1fr;
  }
  .gauge {
    grid-template-columns: 72px 1fr 48px;
  }
  .page-head {
    padding: 40px 0 28px;
    margin-bottom: 36px;
  }
}
@media (min-width: 720px) and (max-width: 959px) {
  .steps,
  .dims {
    grid-template-columns: 1fr;
  }
}
</style>
