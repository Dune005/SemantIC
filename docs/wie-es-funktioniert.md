# Wie SemantIC funktioniert

SemantIC ist ein Werkzeug, das KI-generierte Bilder prüft, bevor sie veröffentlicht werden. Es richtet sich an alle, die mit Bildern arbeiten – Redaktionen, Content-Creators, Lehrpersonen oder Einzelpersonen – und es ist so gebaut, dass man es ohne KI-Vorwissen verstehen kann.

Die Grundfrage lautet nicht «Ist dieses Bild echt oder gefälscht?», sondern «Ist dieses Bild gut oder schlecht gemacht?» – im Sinne von inhaltlicher Stimmigkeit und Fairness. Diese Seite erklärt, was SemantIC tut und warum, ganz ohne technische Details.

## Das Problem: der Maskierungseffekt

KI-Bildgeneratoren sind erstaunlich gut darin, Bilder schön aussehen zu lassen: scharfe Details, satte Farben, stimmungsvolles Licht. Genau das ist auch das Problem – so die These der zugrunde liegenden Bachelorarbeit: Diese Werkzeuge sind vor allem auf die *visuelle Oberfläche* hin optimiert, also darauf, dass ein Bild überzeugend und ästhetisch wirkt. Ob das Bild inhaltlich stimmt, hat dabei oft geringere Priorität.

Die Folge: Ein Bild kann handwerklich brillant aussehen und trotzdem inhaltliche Fehler oder problematische Klischees enthalten. Die perfekte Oberfläche lenkt davon ab. Ein Schatten, der in die falsche Richtung fällt, eine Hand mit zu vielen Fingern oder eine stereotype Rollenverteilung fällt weniger auf, weil das Bild insgesamt so professionell und «echt» wirkt.

Diesen Mechanismus nennen wir den **Maskierungseffekt**: Die visuelle Perfektion *maskiert* (verdeckt) inhaltliche oder ethische Schwächen. Je überzeugender ein Bild aussieht, desto eher übersieht man seine Probleme. SemantIC ist darauf ausgelegt, genau diese Verdeckung sichtbar zu machen.

## Die drei Prüfdimensionen

SemantIC schaut sich jedes Bild aus drei Blickwinkeln an.

**Physikalische Kohärenz.** Hier geht es um die Frage: Funktioniert die Welt im Bild so, wie eine echte Welt funktionieren würde? Geprüft werden Dinge wie Licht und Schatten (fallen sie konsistent in dieselbe Richtung?), Anatomie und Proportionen (stimmt die Zahl der Finger, sind Körper und Gesichter stimmig?) und Materialeigenschaften (sehen Oberflächen, Spiegelungen und Texturen plausibel aus?). Klassische KI-Fehler tauchen genau hier auf.

**Semantische Konsistenz.** Hier geht es um den Inhalt im Verhältnis zum geplanten Verwendungszweck: Passt das, was das Bild zeigt, zu dem Kontext, in dem es eingesetzt werden soll? Ein technisch einwandfreies Bild kann inhaltlich trotzdem am Thema vorbeigehen oder etwas zeigen, das nicht zur Aussage passt. Diese Prüfung wird treffsicherer, wenn man SemantIC mitteilt, wofür das Bild gedacht ist.

**Bias und Stereotypisierung.** Hier geht es um soziale Verzerrungen: Werden bestimmte Gruppen klischeehaft dargestellt? Gibt es stereotype Rollen-, Geschlechter- oder Körperbilder? Wichtig ist die Abgrenzung: Dass ein Bild eine Person mit bestimmten Merkmalen zeigt, ist für sich genommen *kein* Problem und wird nicht als Verzerrung gewertet. Ein Befund entsteht erst dort, wo eine Darstellung tatsächlich klischeehaft oder einseitig ausfällt – etwa durch stereotype Rollenbesetzung oder verzerrte Machtverhältnisse im Bild.

## Ästhetik vs. Integrität: das Maskierungspotenzial

Das Herzstück von SemantIC ist eine bewusste Trennung von zwei Bewertungen, die unabhängig voneinander erhoben werden:

- Eine **Ästhetik-Bewertung** beurteilt allein die visuelle Oberfläche: Wie überzeugend, schön, professionell wirkt das Bild?
- Eine **Integritäts-Bewertung** beurteilt die inhaltliche Stimmigkeit: Wie sauber ist das Bild bei Physik, Semantik und Bias?

Diese beiden Werte werden getrennt ermittelt, damit der ästhetische Eindruck die inhaltliche Prüfung nicht beeinflusst. Anschliessend stellt SemantIC sie einander gegenüber.

Entscheidend ist die *Spannung* zwischen den beiden Werten. Wenn ein Bild sehr ästhetisch wirkt, bei der Integrität aber schwach abschneidet, ist diese Lücke gross – und genau das ist das Muster des Maskierungseffekts: ein schönes Bild, das inhaltliche Probleme hinter seiner Oberfläche verbergen kann. Die Lage der beiden Werte zueinander ist dabei eine Betrachtungshilfe – für sich allein erlaubt sie keine Aussage darüber, ob tatsächlich etwas maskiert wird.

Wichtig: Die Spannung ist ein **Hinweis auf Maskierungspotenzial**, keine Messung der Maskierung. SemantIC verrechnet die beiden Werte bewusst nicht zu einer einzelnen Maskierungs-Zahl – ein solcher Wert würde mehr Präzision behaupten, als methodisch gedeckt ist. Stattdessen wird die Maskierung **qualitativ** ausgewiesen: Der Report markiert Bildstellen, an denen ein erkannter Fehler ästhetisch verdeckt wird, und ergänzt eine begründete Einschätzung dazu, wie stark das Bild über seine Inszenierung wirkt.

## So läuft eine Prüfung ab

Eine Prüfung mit SemantIC folgt einem einfachen Ablauf.

**1. Bild hochladen.** Man lädt das zu prüfende KI-Bild hoch. Das Bild wird nur für die Analyse verwendet, nicht dauerhaft gespeichert.

**2. Verwendungsform und Haltung wählen.** Zwei kurze Pflicht-Auswahlen gehören dazu: die geplante Verwendungsform des Bildes (Headerbild, Moodbild, Symbolbild, Illustration, Social-Post, Werbe-/Marketingbild oder Editorial-Bild) und die redaktionelle Haltung (Standard, Bestätigend, Kritisch oder Illustrativ). Die Verwendungsform bestimmt, wie streng die Empfehlung am Ende ausfällt: Ein inszenierter Hochglanz-Look ist für ein Werbebild in Ordnung, für ein Editorial-Bild dagegen ein Warnsignal. Diese Einordnung passiert direkt bei der Aufbereitung des Reports – ohne die Angabe müsste das Tool den Verwendungszweck aus dem Bildstil raten, was früh im Projekt zu systematischen Fehleinschätzungen führte.

**3. Kontext und Prompt ergänzen (optional, aber empfohlen).** Man kann zusätzlich angeben, wofür das Bild gedacht ist (den Nutzungskontext) und welcher Text-Prompt es erzeugt hat. Beides ist freiwillig, verbessert die Prüfung aber spürbar: Der Nutzungskontext schärft die semantische Prüfung und die Einschätzung des Maskierungspotenzials, der Prompt hilft dabei, mögliche Verzerrungsachsen gezielter zu betrachten.

**4. Analyse.** SemantIC untersucht das Bild entlang der drei Dimensionen, ordnet es ein und ermittelt die Ästhetik- und Integritäts-Werte – getrennt voneinander.

**5. Report lesen.** Das Ergebnis erscheint als übersichtlicher Report. Nach dem Prinzip «Erst das Wichtigste, dann die Details» ist zuerst das Gesamtbild sichtbar: ein Ampelsystem (grün/gelb/rot) pro Dimension, die Gegenüberstellung von Ästhetik und Integrität und eine kurze Einordnung. Wer mehr wissen will, klappt die einzelnen Befunde auf und sieht knappe Erklärungen, am Bild verankerte Hinweise und – auf Wunsch – die ausführliche Begründung. Befunde werden dabei sichtbar getrennt in das, was beobachtet wurde, und das, was daraus interpretiert wird. Der Report erscheint auf Deutsch oder Englisch – er folgt der gewählten Sprache der Oberfläche und wird zu Beginn der Analyse festgelegt – und lässt sich als PDF exportieren.

![Beispiel-Report: kritisches Verdikt mit markierter Bildstelle, Befunden und der Gegenüberstellung von Ästhetik und Integrität](assets/screenshot-report.png)

## Was SemantIC NICHT ist

- **Kein Fake-vs-Real-Detektor.** SemantIC sagt nicht «echt» oder «gefälscht». Es gibt auch kein Deepfake-Urteil ab. Die Frage ist die nach inhaltlicher und ethischer Qualität, nicht nach Authentizität.
- **Kein automatischer Wahrheitsdetektor.** Die Befunde des Modells sind *Hinweise*, keine Beweise. Sie sollen zu einer begründeten Entscheidung verhelfen, nicht sie ersetzen. Modellresultate dürfen nicht sicherer oder präziser wirken, als sie methodisch sind.
- **Keine dekorative Datenflut.** Kein neonfarbenes Kontrollzentrum, keine typische KI-Dashboard-Optik. SemantIC versteht sich eher wie ein sorgfältig geführtes Laborjournal: analytisch, sachlich, transparent.

## Grenzen

SemantIC ist eine **Heuristik**, kein endgültiges Urteil. Es liefert eine strukturierte, begründete Einschätzung – die letzte Entscheidung über eine Veröffentlichung trifft die verantwortliche Person.

Die zugrunde liegende Prüflogik wurde aus einer Forschungsarbeit abgeleitet: Sie beruht auf 144 KI-Bildern, die im Rahmen der Bachelorarbeit *«Visual Bias im KI-generierten Bild»* (Multimedia Production, Schweiz) qualitativ ausgewertet wurden. Daraus folgen zwei wichtige Einschränkungen:

- Die Kalibrierung ist vor allem auf **fotorealistische Bilder** ausgerichtet. Bei stilisierten, illustrativen oder abstrakten Bildern sind die Ergebnisse weniger belastbar.
- Wie jedes KI-gestützte Werkzeug kann SemantIC Fehler übersehen oder Dinge anders einschätzen als ein Mensch. Die Befunde sind ein Ausgangspunkt für die eigene kritische Prüfung – nicht ihr Ersatz.

Kurz: SemantIC verschiebt die Aufmerksamkeit dorthin, wo sie hingehört – weg von der blendenden Oberfläche, hin zur inhaltlichen Substanz. Die Bewertung selbst bleibt eine Hilfe zur Entscheidung, kein Freibrief und kein Verbot.
