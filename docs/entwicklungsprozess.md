# Entwicklungsprozess & Verworfenes

Ein fertiges Tool zeigt nicht, wie es entstanden ist. Diese Seite dokumentiert den Weg: die Ansätze, die erprobt und wieder verworfen wurden, die Grenzen, die sich als unüberwindbar herausstellten, und die Entscheidungen, die SemantIC seine heutige Form gegeben haben. Sie ist bewusst sachlich gehalten – die persönliche Reflexion steht in der [Lehrprojekt-Dokumentation](lehrprojekt-dokumentation.md).

Grundlage der meisten Entscheidungen waren systematische Testreihen: kleine Bildsets, Mehrfachläufe pro Bild (weil Sprachmodell-Antworten streuen) und der Abgleich mit der manuellen Codierung von 144 KI-generierten Bildern aus dem Forschungsteil der Bachelorarbeit. Grössere Eingriffe in die Analyse-Logik wurden zusätzlich extern gegengeprüft, bevor sie umgesetzt wurden. Die ausführlichen Testprotokolle sind interne Arbeitsdokumente und nicht Teil dieses Repositories; die wichtigsten Befunde sind hier zusammengefasst.

## Verworfen: der Prompt-Refiner

**Erwogen** (Mai 2026): ein dritter Analyse-Schritt, der aus den Befunden automatisch verbesserte Prompt-Varianten generiert – eine forschungsbasierte und eine gegenläufig formulierte Variante, jeweils mit Begründung.

**Verworfen, weil** ein automatischer Prompt-Verbesserer die kritische Reflexion an die nächste Black-Box delegiert hätte – das Gegenteil des Lehrziels. Er hätte ausserdem implizit suggeriert, Bias sei «mit dem richtigen Prompt lösbar», und damit genau die These untergraben, die das Tool veranschaulichen soll: dass visuelle Perfektion inhaltliche Schwächen verdeckt.

**Stattdessen** konzentriert sich SemantIC auf Diagnose und Sichtbarmachung. Die Schlussfolgerung bleibt bei den Nutzer:innen.

## Verworfen: der numerische Maskierungs-Score

Die längste Irrfahrt des Projekts. Die Ausgangsidee lag nahe: Wenn Maskierung bedeutet, dass ein Bild besser aussieht, als es inhaltlich ist, dann müsste sich das als Zahl fassen lassen – etwa als Differenz zwischen Ästhetik- und Integritätswert.

**Erster Anlauf:** ein Maskierungswert mit festem Ästhetik-Sockel. Im Abgleich mit der manuellen Codierung produzierte der Sockel Fehlklassifikationen – er übersteuerte die eigentliche Evidenz und wurde durch eine evidenzbasierte Bremse ersetzt.

**Zweiter Anlauf** (Juni 2026): ein grundlegendes Redesign, das die Maskierung aus konkreten Bild-Belegen statt aus Score-Differenzen ableitet. Strukturell eine Verbesserung – aber die Validierung gegen die manuelle Codierung blieb zu dünn, um den Wert als Messung auszugeben.

**Endgültig verworfen** (Juni 2026): Der Abgleich mit der Referenz-Codierung zeigte einen grundsätzlichen Konstrukt-Unterschied – die menschliche Codierung misst, ob subtile Fehler bei hohem Realismus *verdeckt* werden; die Score-Differenz misst etwas anderes. Kein Umbau der Verrechnung hätte das behoben. Der numerische Maskierungs-Score wurde vollständig aus dem Code entfernt.

**Stattdessen** wird Maskierung heute qualitativ ausgewiesen: als markierte Bildstellen mit Konfidenzangabe, als begründete Einschätzung und als beschreibender Hinweis. Ästhetik und Integrität bleiben getrennte Werte; ihre Gegenüberstellung im Report ist eine Darstellung, kein behaupteter Messwert. Diese Verwerfung ist inhaltlich die wichtigste des Projekts – sie zog die Sprachregelung durch das gesamte Tool und diese Dokumentation.

## Verworfen: ein zweites Modell als Richter

**Erwogen** (Mai 2026): die Befunde der Analyse einem zweiten, stärkeren Sprachmodell als finalem «Richter» vorzulegen, damit die Bewertung nicht an einem einzelnen Modell hängt.

**Verworfen, weil** zwei Sprachmodelle keine unabhängigen Instanzen sind – sie teilen Trainingsdaten-Verzerrungen, ihre Fehler korrelieren. Die beobachtete Instabilität der Befunde war ausserdem ein Schwellenwert-Problem, kein Konsens-Problem; ein Richter-Modell hätte Kosten verdoppelt, ohne die Ursache zu treffen.

**Stattdessen** wurde die Analyse-Anweisung gezielt und eng nachgeschärft – pro identifiziertem Fehlerbild eine Regel, jeweils gegen Testbilder validiert.

## Verworfen: Emotionalisierung als Prüfsignal

Auslöser war ein politisches Motiv (Wohnungsnot), das die Pipeline als idealisierende «Lifestyle»-Bildwirkung fehleinordnete. Drei Ansätze, Emotionalisierung sauber zu erfassen, scheiterten nacheinander:

1. Eine zusätzliche Prompt-Regel für den «Präsentationsmodus» – jeder erklärende Zusatztext verschob die Bewertung systematisch in die Gegenrichtung und leckte in andere Analysephasen (ein Physik-Wert kippte in Tests von 92 auf 74).
2. Ein beschreibendes Feld für emotionale Ansprache – das Konstrukt erwies sich als zu mehrdeutig, um es einem Sprachmodell stabil abzuverlangen.
3. Ein regelbasierter Hinweis auf emotionales Framing – es fehlte ein valides Triggersignal, auf das die Regel hätte reagieren können.

**Stattdessen** hat SemantIC bewusst kein Emotionalisierungs-Feld. Die Grenze ist dokumentiert: Affektive Bildwirkung ist mit den Mitteln dieser Pipeline nicht belastbar messbar.

## Von der falschen Messlatte zur Verwendungsform

Ein systematischer Befund aus den Testreihen: Bei hochglänzenden Bildern legte die Pipeline automatisch eine *werbliche* Messlatte an – sie schloss vom Bildstil auf den Verwendungszweck. In einer Auswertung über 366 Analyseläufe passierte diese Fehl-Inferenz in 225 Fällen (61,5 %). Ein Wording-Schnellfix und eine LLM-basierte Tonalitätserkennung wurden geprüft und verworfen – zu oberflächlich beziehungsweise eine neue Abhängigkeit von genau der Black-Box, die das Problem verursachte.

**Stattdessen** wurde die **Verwendungsform** als Pflichteingabe eingeführt: Nutzer:innen geben an, ob das Bild als Headerbild, Symbolbild, Werbebild usw. dienen soll – die Empfehlung im Report richtet sich dann nach diesem erklärten Zweck statt nach einer geratenen Annahme. Im Wiederholungslauf verschwand die Fehl-Inferenz vollständig (225 → 0). Die Design-Lehre daraus: **Bildstil ist nicht Verwendungszweck.**

## Grenzen, die bleiben – und transparent gemacht werden

**Anatomie und Körper-Topologie.** Ein Batch-Test (42 Analyseläufe) zeigte eine hartnäckige Blindstelle der eingesetzten Bildmodelle: Lokale Artefakte an Händen und Fingern werden zuverlässig gefunden, grob falsche Körper-Topologie dagegen nicht – ein um 180 Grad gedrehter Kopf blieb in drei von drei Läufen unsichtbar (bei hohem Score), ein dritter Arm wurde nie erkannt. Von sechs strukturellen K.-o.-Fehlern fand die Pipeline zwei. Vier Gegenmassnahmen wurden geprüft und verworfen: eine pauschale Verschärfung der Schweregrade (disqualifizierte sich durch Fehlalarme auf fehlerfreien Bildern), eine selektive Bewertungsrubrik (mit den vorhandenen Daten nicht validierbar), ein Routing auf ein zweites Modell (kein trennscharfes Kriterium) und ein Modell-Ensemble (hebt die Trefferquote rechnerisch nicht). **Stattdessen** kommuniziert das Tool die Grenze offen: Ein Anatomie-Befund ist ein Prüfauftrag an den Menschen, kein abschliessendes Urteil – und ein unauffälliges Ergebnis ist keine Garantie.

**Nachtrag Juli 2026: Die Grenze hängt am Modell, nicht an der Technologie.** Ein Nachtest mit einem neu erschienenen, deutlich grösseren Sprachmodell (Claude Opus 5) verschob genau den Fall, der bis dahin als härtester Beleg galt: Den um 180 Grad gedrehten Kopf, den die beiden zuvor geprüften Modelle in je drei von drei Läufen übersahen, erkannte es in vier von vier Läufen – als schweren Befund, mit einer Begründung, die den Fehler korrekt beschreibt (Rumpf von hinten gezeigt, Gesicht zugleich frontal sichtbar). Über das gesamte Testset war es aber *nicht* treffsicherer (vier von sechs Bildern mit Anatomie-Befund gegenüber fünf von sechs beim bisherigen Modell), dazu rund viermal langsamer und teurer; ein Wechsel drängte sich daraus nicht auf. Die Erkenntnis ist trotzdem wichtig genug, um sie hier festzuhalten – und sie schränkt die Aussage dieser Arbeit präziser ein, statt sie zu schwächen: Dokumentiert ist die Grenze der eingesetzten Modelle, nicht eine grundsätzliche Grenze maschinellen Bildverstehens. Dass ein Fehler von einem Modell zuverlässig gefunden und von einem anderen ebenso zuverlässig übersehen wird, ist zudem ein eigenständiger Befund: Wie viel eine automatische Prüfung sieht, hängt spürbar davon ab, welches Modell hinter ihr steht – ein Argument mehr dafür, ihr Ergebnis als Prüfauftrag zu behandeln und nicht als Urteil.

**Wasserzeichen-Hypothese.** Die Vermutung, sichtbare Wasserzeichen und Logos würden reproduzierbare Fehlalarme in der Anatomie-Prüfung auslösen, wurde durch eine kontrollierte Ablation (dasselbe Bild mit und ohne Overlay) widerlegt. Statt eines Korrektur-Eingriffs entstand daraus ein rein beschreibendes Transparenz-Feature: Das Tool kann sichtbare Wasserzeichen, Logos und Signaturen als neutrale Markierungen ausweisen – ausdrücklich ohne Echtheits- oder Herkunftsurteil.

## Kleinere Verwerfungen, kurz

- **Separates Entwicklungs-Frontend** – verworfen zugunsten eines schlankeren Wegs: ein designtes Produkt-Frontend, daneben der Kommandozeilen-Testweg für die Pipeline-Entwicklung und aufklappbare Pipeline-Metadaten direkt im Report.
- **Sechs Design-Varianten der Befundkarte** – auf eine Systemsprache («Laborjournal»-Komposition mit fester Token-Palette) reduziert; Komposition und visuelle Sprache wurden dabei bewusst getrennt entschieden.
- **Holdout-Design für die Validierung** – methodisch entworfen, aber bewusst nicht umgesetzt: Der Aufwand hätte den Rahmen der Bachelorarbeit gesprengt; die Reflexion darüber ist Teil der Arbeit.
- **Evidence-first-Umbau des Scorings** – als methodisch sauberste Variante erkannt, aber wegen des Regressionsrisikos spät im Projekt zurückgestellt und als Limitation dokumentiert.
- **Klassische Bilderkennung als Vorstufe** (Personen-Detektion, Pose-Schätzung) – exploriert, aber nur beobachtend mitgeführt statt in die Bewertung eingreifend: Die Kategorie «Person» eines Objektdetektors ist nicht dasselbe wie ein lebender Mensch im Bildkontext.

## Modell- und Architektur-Entscheidungen

**Warum Gemini für die Analyse?** Zwei direkte Vergleiche mit Claude-Modellen zeigten keinen Netto-Vorteil eines Wechsels. Der erste (Juni 2026, Claude Sonnet 4.6) fiel klar zugunsten von Gemini aus: Das Claude-Modell fand auf demselben Testset weniger Auffälligkeiten (drei von sechs Bildern gegenüber fünf von sechs), war technisch fragiler (62,5 % Fehlversuche im ersten Anlauf), rund 3,5-mal langsamer und teurer. Der zweite (Juli 2026, Claude Opus 5) fiel differenzierter aus: technisch deutlich stabiler als der Vorgänger und in einem Fall klar überlegen – dem um 180 Grad gedrehten Kopf, den beide anderen Modelle nie fanden –, über das Testset hinweg aber ebenfalls nicht treffsicherer und weiterhin rund viermal langsamer als Gemini. Gemini blieb Default – auch damit das live deployte Tool dem in der Thesis dokumentierten Verhalten entspricht. Die Architektur hält den Modellwechsel trotzdem offen (Claude direkt oder beliebige Modelle via OpenRouter).

**Warum ein englischer Analyse-Prompt?** Testreihen zeigten stabilere Befunde bei englischer Prompt-Formulierung; die Report-Texte bleiben davon unabhängig auf Deutsch oder Englisch steuerbar. Ein Nebenbefund aus diesen Reihen: Eine hartnäckige Halluzination (nicht vorhandene Handschuhe) überlebte sämtliche Prompt-Iterationen – ein anschauliches Beispiel dafür, dass Prompt-Engineering strukturelle Modell-Verzerrungen nicht beseitigt.

**Warum zwei getrennte Bewertungs-Aufrufe?** Ästhetik und Integrität werden in separaten, parallelen Aufrufen erhoben – eine methodische Firewall: Die Schönheitsbewertung darf die Integritätsbefunde nicht einfärben. Für die Ästhetik wurde im Juni 2026 zusätzlich ein A/B-Test zwischen zwei Claude-Versionen gefahren (15 Bilder × 3 Läufe): Die neuere Version differenzierte feiner und korrelierte besser mit einem etablierten Referenzmodell – sie wurde Default. Als zweite, modellunabhängige Ästhetik-Stimme läuft ein LAION-Referenzwert auf einem externen GPU-Endpoint mit; fällt er aus, rechnet das Tool ohne ihn weiter, statt die Analyse scheitern zu lassen. Nach demselben Kapselungsmuster wurde später der CLIP-Bild-Text-Abgleich ergänzt – als Kontrast-Diagnostik, bewusst nicht als unabhängige Messlatte.

## Meilensteine

| Zeitpunkt | Meilenstein |
|:---|:---|
| Mai 2026 | Pipeline-Spike: Analyse-Architektur steht, erste Testreihen gegen die Phase-1-Codierung |
| Anfang Juni 2026 | Produkt-Frontend live auf Vercel, per Funktionstest verifiziert |
| Juni 2026 | Normative Bildwirkung als qualitatives Feld; CLIP-Abgleich als vierter Analyse-Zweig |
| Juni 2026 | Numerischer Maskierungs-Score entfernt; Anatomie-Grenze validiert und als Transparenz-Weg festgelegt |
| Ende Juni 2026 | Ästhetik-Modell nach A/B-Test gewechselt |
| Juli 2026 | Mehrsprachigkeit (Oberfläche und Report Deutsch/Englisch), PDF-Export |
| Juli 2026 | Nachtest mit einem neu erschienenen Modell (Claude Opus 5): Anatomie-Grenze als modellabhängig belegt, Default bewusst unverändert |
