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
          Mechanismus nennen wir <strong>Maskierung</strong> – die Arbeitsthese
          hinter SemantIC: Visuelle Perfektion kann inhaltliche und ethische
          Schwächen maskieren. Je überzeugender ein Bild, desto grösser die
          Gefahr, dass du seine Probleme übersiehst.
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
    </div>
  </section>

  <!-- ================= 2 · ABLAUF IN DREI SCHRITTEN ================= -->
  <section class="section" aria-labelledby="s2-title">
    <div class="page">
      <p class="section__index">02 · Der Ablauf</p>
      <h2 id="s2-title">Vom Bild zum Befund.</h2>

      <div class="section__body">
        <p>
          Ein Bildmodell allein lässt sich von der schönen Oberfläche leiten.
          SemantIC trennt deshalb Inhalt und Ästhetik in zwei eigenständige
          Durchläufe – bewusst, damit die Wirkung das inhaltliche Urteil nicht
          beschönigt. Erst danach werden beide Ergebnisse zusammengeführt.
        </p>
      </div>

      <div class="section__figure">
        <PipelineDiagram />
      </div>
      <p class="figure-note">
        Modellagnostisch – Gemini &amp; Claude sind die aktuellen Standard-Modelle,
        austauschbar. Die Symbole sind stilisierte Platzhalter.
      </p>
    </div>
  </section>

  <!-- ============ 2·b · LEITPLANKEN DER BEWERTUNG ============ -->
  <section class="section" aria-labelledby="s2b-title">
    <div class="page">
      <p class="section__index">02 · b · Die Leitplanken</p>
      <h2 id="s2b-title">Die Leitplanken der Bewertung.</h2>
      <div class="section__body">
        <p>
          Ein Bildmodell allein neigt dazu, sich von visueller Perfektion leiten zu
          lassen – genau der Maskierungseffekt. SemantIC legt der Bewertung deshalb
          Leitplanken an, die auf belegte, nachvollziehbare Urteile hinwirken.
        </p>
      </div>

      <div class="section__figure">
        <GuardrailList />
      </div>
      <div class="section__body">
        <p>
          Diese Leitplanken machen die Bewertung disziplinierter und nachvollziehbarer
          – sie sollen dem Maskierungseffekt entgegenwirken. Wo das Tool an Grenzen
          stösst, legt SemantIC das offen (Abschnitt „Wir kennen die Grenzen").
        </p>
      </div>
      <p class="figure-note">
        „Maskiert → klar": Tendenz hinter Schleier, Leitplanke scharf, Hover hebt den
        Schleier. Grösstenteils hart erzwungen (festes Schema &amp; Prüfregeln); die
        Kriterien stammen aus 144 codierten Bildern.
      </p>
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
    <div class="page">
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

      <div class="section__figure">
        <MaskingQuadrant :aesthetic="86" :integrity="64" />
      </div>
      <p class="figure-note">
        Bewusst illustratives Schema, keine Messzahl – es zeigt das Prinzip, nicht das
        Resultat einer einzelnen Prüfung.
      </p>
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

      <div class="table-scroll">
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

  <!-- ================= 8 · VALIDIERTE GRENZEN (F2) =================
       Grenzen als Qualitätsmerkmal: jede Aussage hier ist empirisch geprüft
       (Anatomie-Batch + verblindeter Zweitmodell-Vergleich, dokumentierte
       Testreihen gegen die menschliche Phase-1-Codierung). -->
  <section class="section" aria-labelledby="s-limits-title">
    <div class="page page--text">
      <p class="section__index">08 · Validierte Grenzen</p>
      <h2 id="s-limits-title">Wir kennen die Grenzen – und legen sie offen.</h2>
      <div class="section__body">
        <p>
          Jede Grenze, die hier steht, ist kein juristisches Kleingedrucktes,
          sondern empirisch geprüft: in dokumentierten Testreihen gegen die
          menschliche Codierung, bei der Anatomie zusätzlich verblindet mit einem
          zweiten Vision-Modell. Diese Offenheit ist Teil des Forschungsanspruchs –
          du sollst wissen, wann du dich auf einen Befund verlassen kannst und wann
          dein eigener Blick gefragt ist.
        </p>
      </div>

      <div class="limits-grid">
        <Card tone="paper" border="hair" padding="none" class="card card--paper">
          <p class="card__kicker">Verlässlich</p>
          <h3>Die rote Ampel</h3>
          <p>
            In der Validierung gab es keinen einzigen unbegründet roten Befund.
            Zeigt SemantIC rot, gibt es etwas zu klären – nimm es ernst.
          </p>
        </Card>
        <Card tone="paper" border="hair" padding="none" class="card card--paper">
          <p class="card__kicker">Richtig lesen</p>
          <h3>Grün heisst: nichts gefunden</h3>
          <p>
            Ein grünes Ergebnis heisst, dass das Tool nichts gefunden hat – nicht,
            dass das Bild fehlerfrei ist. Es ersetzt deine Sichtprüfung nicht,
            es fokussiert sie.
          </p>
        </Card>
        <Card tone="paper" border="hair" padding="none" class="card card--paper">
          <p class="card__kicker">Bekannte Lücke</p>
          <h3>Anatomie: Flag = Prüfauftrag</h3>
          <p>
            In den Tests fand das Tool lokale Hand- und Finger-Artefakte
            zuverlässig. Strukturelle Körperfehler – Kopforientierung, Anzahl
            Gliedmassen, Beinstellung – kann es übersehen; das ist über zwei
            verschiedene Vision-Modelle hinweg validiert. Ein Anatomie-Flag ist
            deshalb ein manueller Prüfauftrag an dich, keine abschliessende Diagnose.
          </p>
        </Card>
        <Card tone="paper" border="hair" padding="none" class="card card--paper">
          <p class="card__kicker">Einordnung</p>
          <h3>Schwere ist eine Einschätzung</h3>
          <p>
            Die Stufen an einzelnen Befunden – schwer, moderat, gering – sind eine
            Einschätzung des Vision-Modells, keine Messung. Gerade bei Anatomie ist
            die Schwere nicht verlässlich: Ob ein markierter Punkt
            publikationskritisch ist, entscheidet dein Blick aufs Bild.
          </p>
        </Card>
      </div>

      <div class="section__body">
        <p>
          Die andere Seite derselben Tests: SemantIC fand darin auch Befunde, die
          ein menschlicher Blick übersehen hatte. Die Hinweise ergänzen deine
          Sichtprüfung – ersetzen sie nicht. Genau dafür ist jeder Befund mit
          Markierung und Beobachtung am Bild nachprüfbar gebaut.
        </p>
      </div>
    </div>
  </section>

  <!-- ================= 9 · WOHER DIE KRITERIEN STAMMEN ================= -->
  <section class="section" aria-labelledby="s8-title">
    <div class="page page--text">
      <p class="section__index">09 · Woher die Kriterien stammen</p>
      <h2 id="s8-title">Forschung, kein generisches Modellwissen.</h2>
      <div class="section__body">
        <p>
          Die Prüflogik von SemantIC speist sich aus einer eigenen empirischen
          Grundlage: einer qualitativen Inhaltsanalyse von 144 KI-generierten
          Bildern. Daraus sind die fünf Lesearten, die wiederkehrenden Fehlerprofile
          und die neun visuellen Treiber entstanden, mit denen das Tool arbeitet.
          Diese Heuristik ist der praktische Teil der Bachelorarbeit „Visual Bias im
          KI-generierten Bild" im Studiengang Multimedia-Production an der FH
          Graubünden. Die Bildanalyse selbst führt ein Vision-Modell aus – aber
          nach welchen Kriterien es prüft und was als Befund zählt, bestimmt diese
          nachvollziehbare, dokumentierte Forschungsbasis.
        </p>
        <p>
          Die Pipeline dahinter wurde über dokumentierte Iterationsrunden entwickelt
          und systematisch gegen die menschliche Codierung geprüft – die validierten
          Grenzen oben stammen aus genau diesen Tests. Und sie ist bewusst
          modellagnostisch gebaut: Die Kriterien, die Evidenz-Pflicht und die
          deterministischen Prüfregeln hängen nicht an einem bestimmten KI-Modell.
          Werden die Vision-Modelle besser, wird die Prüfung besser – am Prüfraster
          ändert das nichts.
        </p>
      </div>
    </div>
  </section>

  <!-- ================= 10 · DATENSCHUTZ IN EINEM SATZ ================= -->
  <section class="section" aria-labelledby="s9-title">
    <div class="page page--text">
      <p class="section__index">10 · Datenschutz</p>
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

/* ---- Eingebettete Datengrafik (dataviz/*) – einheitlicher Abstand ---- */
.section__figure {
  margin-top: 28px;
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

/* ---- Lesearten-Tabelle ---- */
.table-scroll {
  max-width: 100%;
  overflow-x: auto; /* Sicherheitsnetz: Tabelle scrollt intern, nie die ganze Seite */
}
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
/* Mobil: lange Lesearten-Namen umbrechen lassen, kompaktere Zellen – so passt die
   Tabelle ohne Seiten-Scroll; der .table-scroll-Wrapper bleibt als Sicherheitsnetz. */
@media (max-width: 520px) {
  .table {
    font-size: 14px;
  }
  .table th,
  .table td {
    padding: 9px 10px;
  }
  .table td.name {
    white-space: normal;
    overflow-wrap: anywhere;
  }
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

/* ---- Validierte Grenzen (F2) – vier Panels, gleiche Sprache wie input-frames ---- */
.limits-grid {
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
  .input-frames,
  .limits-grid {
    grid-template-columns: 1fr;
  }
  .page-head {
    padding: 40px 0 28px;
    margin-bottom: 36px;
  }
}
@media (min-width: 720px) and (max-width: 959px) {
  .dims {
    grid-template-columns: 1fr;
  }
}
</style>
