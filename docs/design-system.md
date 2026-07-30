# Das Design-System von SemantIC

SemantIC folgt einer eigenen, konsequent durchgezogenen Designrichtung: **«Laborjournal»** – nüchtern, dokumentarisch, mit der Anmutung eines Mess-Protokolls. Diese Wahl ist inhaltlich begründet: Ein Werkzeug, das die verführerische Oberfläche von KI-Bildern zum Thema macht, darf nicht selbst auf Hochglanz-Inszenierung setzen. Die Oberfläche soll wirken wie das, was sie ist – ein Prüfinstrument, das Befunde protokolliert.

Diese Seite stellt die Grundzüge des Designs vor. Die ausführliche, maschinenlesbare Fassung liegt als [`frontend/DESIGN.md`](../frontend/DESIGN.md) im Repository (im DESIGN.md-Format, das auch KI-Coding-Agenten direkt als Design-Vorgabe lesen können); ein visueller Katalog mit Farbmustern, Typografie-Skala und Komponenten ist [`frontend/preview.html`](../frontend/preview.html) – lokal im Browser zu öffnen.

## Die Grundidee: ruhig, flach, präzise

Vier Prinzipien tragen das gesamte System:

**Tiefe entsteht über Flächenwechsel, nicht über Schatten.** Es gibt im gesamten Frontend keine Schlagschatten auf Karten. Hierarchie entsteht ausschliesslich durch den Wechsel zwischen vier hellen Flächentönen – vom Seitenhintergrund über den cremefarbenen Karten-Boden bis zur weissen Innenfläche. Karten sind von feinen 1-Pixel-Linien («Hairlines») gerahmt, nie geschattet.

**Genau eine Akzentfarbe.** Das System kennt einen einzigen chromatischen Akzent: ein Rot (`#cd4239`), das zugleich die «kritisch»-Stufe der Ampel ist. Es taucht nur an wenigen, bewusst gesetzten Stellen auf – etwa als roter Satzpunkt in der Headline «Überzeugend ist nicht genug.» Alles andere bleibt – abgesehen von den Ampelfarben und zwei Kategorialfarben, die allein den Erklärgrafiken der Seite «Wie es funktioniert» vorbehalten sind – in einer olivgrau-warmen Ink-Skala.

**Severity wird doppelt kodiert.** Die Ampelfarben (Grün/Gelb/Rot) stehen nie allein: Neben der Farbe steht immer das Wort (OK/WARN/CRIT beziehungsweise das deutsche Urteilswort). Wer Farben nicht oder anders wahrnimmt, verliert keine Information.

**Typografie trägt die Hierarchie, nicht Farbe.** Überschriften, Werte und Fliesstext unterscheiden sich über Grösse und Gewicht, nicht über Farbflächen. Text bleibt in der Ink-Skala.

## Farbwelt

Die Palette ist warm und gedeckt – ein oliv-getöntes Creme statt sterilem Weiss, ein olivgraues Anthrazit statt reinem Schwarz:

| Rolle | Ton | Hex |
|:---|:---|:---|
| Seitenhintergrund | gedecktes Graugrün | `#e4e5dd` |
| Karten-Boden | warm-oliver Cremegrund | `#eeefe9` |
| Innere Karten-Fläche | Weiss | `#ffffff` |
| Haupttext («Ink») | Olive-Charcoal | `#23251d` |
| Hairlines/Rahmen | helles Graugrün | `#c4c6bb` |
| Akzent = «kritisch» | Rot | `#cd4239` |
| Ampel «OK» | Grün | `#2c8c66` |
| Ampel «WARN» | Ocker | `#c8921f` |

Die Ampelfarben existieren jeweils als Paar: eine hellere Punkt-/Flächenfarbe und ein dunklerer Textton, der die Kontrastanforderungen der Barrierefreiheit (WCAG AA) erfüllt. Für bewusst dunkle Momente – den Seitenkopf und zwei Abschnitte der Startseite – gibt es einen invertierten Flächensatz («Ink-Inversion») mit eigenen, kontrastgeprüften Texttönen; Ampelfarben sind dort als Textfarbe tabu, weil ihr Kontrast auf dunklem Grund nicht ausreicht.

## Typografie

Zwei Schriften, klare Arbeitsteilung:

- **IBM Plex Sans** trägt Headlines und Fliesstext.
- **IBM Plex Mono** trägt alles, was nach Messung und Protokoll aussieht: Kicker, Captions, Labels und Datenwerte – in Versalien mit weiter Buchstabenspationierung. Ziffern laufen tabellarisch, damit Werte nicht springen.

Die grossen Score-Zahlen laufen dagegen bewusst in Plex Sans und neutral in der Ink-Farbe: Sie sind Messwert, nicht Urteil – die Wertung trägt das farbige Urteilswort daneben.

Dieses «Mono-Kicker-Prinzip» ist das typografische Erkennungszeichen des Laborjournal-Stils: Über fast jedem Inhaltsblock sitzt ein kleines, technisch anmutendes Mono-Label.

## Harte Regeln

Einige Verbote sind im Projekt als feste Regeln dokumentiert und werden bei jeder Änderung geprüft:

- **Keine Schatten und keine Verläufe auf Karten** – Tiefe nur über Flächenwechsel.
- **Keine zweite Akzentfarbe** – Akzent und «kritisch»-Rot sind derselbe Farbwert.
- **Kein farbiger Akzent-Streifen an der linken Kartenkante** – das verbreitete Karten-Muster mit vertikalem Farbbalken ist in jeder Form ausgeschlossen.
- **Keine Ampelfarben ohne Wort** – Doppelkodierung ist Pflicht.
- **Kein LLM-Fliesstext in der Hauptansicht** – das Frontend übersetzt die Analyse-Daten in visuelle Komponenten; ausführliche Modell-Begründungen erscheinen nur in der aufklappbaren Vertiefung.

## Entstehung

Das Design ist nicht am Reissbrett entstanden, sondern über eine Prototypen-Reihe: Sieben Stilrichtungen wurden als klickbare Entwürfe der zentralen Befund-Karte durchgespielt und gegeneinander abgewogen, bevor die Systemsprache auf die Laborjournal-Komposition mit fester Token-Palette reduziert wurde.

![Vier der sieben erprobten Stil-Varianten der Befund-Karte](assets/design-varianten.png)

Wie es zu dieser Entscheidung kam, beschreibt der [Entwicklungsprozess](entwicklungsprozess.md); die Reflexion dazu steht in der [Lehrprojekt-Dokumentation](lehrprojekt-dokumentation.md).

## Technische Verankerung

Alle Farben, Radien und Flächenwerte leben als CSS-Design-Tokens in einer einzigen Datei ([`frontend/app/assets/css/tokens.css`](../frontend/app/assets/css/tokens.css)) – sie ist die einzige Quelle der Wahrheit. Komponenten und Seiten-Layouts referenzieren die Tokens per Variable, statt eigene Farbwerte zu setzen. Das hält das System konsistent und macht Designänderungen an genau einem Ort möglich.
