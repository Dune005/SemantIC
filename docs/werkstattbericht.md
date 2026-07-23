# Werkstattbericht

Dieser Bericht ist eine persönliche Erzählung darüber, wie die Arbeit an SemantIC verlief – nicht die benotete Projektdokumentation. Er soll nachvollziehbar machen, wie aus einer qualitativen Bildanalyse ein lauffähiges Prüf-Tool wurde, an welchen Stellen das Werkzeug überzeugt, wo es an Grenzen stösst und welche Wege bewusst wieder verlassen wurden. Es geht hier um den Prozess und das Nachdenken darüber, nicht um eine vollständige Methodendarstellung oder eine technische Spezifikation. Wo eine eigene Wertung des Autors hingehört, steht ein `[Platzhalter: ...]`.

SemantIC ist ein Werkzeug, das KI-generierte Bilder vor der Veröffentlichung auf drei Dimensionen prüft: physikalische Kohärenz (Licht, Schatten, Anatomie, Proportionen), semantische Konsistenz (passt das Bild inhaltlich zum Nutzungskontext?) und Bias beziehungsweise Stereotypisierung. Es ist kein «Fake-oder-Echt»-Detektor, sondern ein Werkzeug, das die Qualität eines Bildes inhaltlich und ethisch einordnet.

## Von der Forschung zum Werkzeug

Am Anfang stand nicht Code, sondern eine empirische Heuristik. In der qualitativen Vorarbeit der Bachelorarbeit wurde ein grösserer Satz KI-generierter Bilder von Hand analysiert und codiert. Daraus entstanden wiederkehrende Muster: typische Fehlerprofile, «Lesearten» (etwa eine werbliche, eine dokumentarische oder eine cinematische Bildsprache), visuelle Treiber wie cinematisches Licht oder warme Farbabstimmung – und eine zentrale Beobachtung: Visuelle Perfektion kann inhaltliche Fehler überdecken. Ein Bild sieht so überzeugend aus, dass man die Fehler darunter nicht mehr bemerkt. Diese Überdeckung – im Projekt der «Maskierungseffekt» – ist das Herzstück der Arbeit.

Die Idee von SemantIC war, genau diese Forschungsheuristik in eine Prüf-Logik zu übersetzen. Bevor auch nur eine Zeile Produktionscode entstand, wurde ein technischer Machbarkeitstest gebaut. Die Leitfrage war einfach: Lässt sich der Weg vom Bild über eine KI-Analyse zu einem strukturierten, maschinenlesbaren Ergebnis überhaupt zuverlässig gehen? Diese Entscheidung – erst Machbarkeit beweisen, dann sauber planen – hat sich durchgezogen. Sie verhinderte, dass aufwändiges Frontend auf einer ungetesteten Analyse-Grundlage entstand.

Die Architektur, die sich dabei herausschälte, trennt bewusst zwei Blickwinkel: Eine Integritäts-Analyse bewertet Physik, Semantik und Bias und ordnet das Bild über die Forschungsschicht ein (Leseart, visuelle Treiber, Fehlertyp); eine davon unabhängige Ästhetik-Bewertung beurteilt allein die visuelle Oberfläche. Beide Befunde laufen erst bei der Aufbereitung im Frontend wieder zusammen.

Der entscheidende methodische Kniff liegt genau in dieser Trennung: Die ästhetische Bewertung läuft getrennt von der Integritätsprüfung. Würden beide im selben Schritt entstehen, könnte der gute optische Eindruck die inhaltliche Bewertung beschönigen – genau der Mechanismus, den die Arbeit eigentlich sichtbar machen will. Indem die zwei Bewertungen unabhängig voneinander entstehen, bleibt die Überdeckung als Spannung zwischen «sieht gut aus» und «ist inhaltlich tragfähig» überhaupt erst sichtbar.

Eine frühe, folgenreiche Entscheidung war der Wechsel des primären KI-Modells. Ursprünglich war ein anderes Vision-Modell vorgesehen; im Lauf der ersten Tage fiel die Wahl auf das Modell, das die Bildprüfung künftig tragen sollte. Weil die Analyse-Schicht bewusst modellunabhängig aufgebaut wurde, liessen sich auch alternative Modelle anbinden – nützlich für den späteren Modellvergleich.

[Platzhalter: Eigene Einordnung – warum gerade dieser Forschungsgegenstand, was den Reiz ausmachte, die Heuristik in Software zu giessen.]

## Was gut funktioniert hat

Ein klarer Erfolg war die strikte Trennung von Forschung und Implementierung über feste Datenverträge. Das KI-Modell liefert seine Befunde nicht als Fliesstext, sondern in einem festgelegten, validierten Format. Damit wird aus einer unzuverlässigen Texterzeugung etwas, das das Frontend verlässlich in Ampelfarben, Kennzahlen und Labels übersetzen kann. Die Regel «kein KI-generierter Fliesstext in der Hauptansicht» hat sich als robust erwiesen: Das Werkzeug zeigt strukturierte Befunde, keine schwer prüfbare Prosa.

Gut funktioniert hat auch das Arbeiten in kleinen, überprüfbaren Schritten mit externem Gegenlesen. Praktisch jede grössere Änderung – an der Analyse-Logik wie am Frontend – ging durch ein unabhängiges Code-Review (im Projekt übernahm das ein zweites KI-Werkzeug als Reviewer). Dieses Vier-Augen-Prinzip hat wiederholt Fehler früh aufgedeckt: zu grosszügige Schwellenwerte, eine versteckte gegenseitige Beeinflussung von Analyse-Schritten, überzogene Schlussfolgerungen in Testauswertungen. Mehrfach mussten Aussagen nach einem Review abgeschwächt oder Zahlen korrigiert werden – das hat die Belastbarkeit der Befunde sichtbar erhöht.

Auf der Gestaltungsseite entstand das Befund-Layout aus einer breiten Variantenexploration. Aus mehreren visuellen Stilen wurde ein Favorit herausgearbeitet und anschliessend in die ruhigere, an ein Laborjournal angelehnte Gestaltungssprache des Projekts überführt. Wichtig war dabei die Trennung von Komposition (welche Information steht wo, welche Lesehierarchie) und Sprache (Schrift, Farben, Tokens) – so liess sich der starke Aufbau behalten, ohne den eigenwilligen ersten Look beizubehalten.

Die Bedienlogik folgt einem gestuften Offenlegungsprinzip: Sofort sichtbar sind Ampelfarben pro Dimension und ein Leseart-Label; auf Wunsch lassen sich Einzelbefunde, visuelle Treiber und schliesslich ausführliche Erklärungen aufklappen. Das hält die Hauptansicht ruhig, ohne Tiefe zu verschenken.

[Platzhalter: Eigene Einschätzung – welcher dieser Punkte für den Autor persönlich am meisten Wirkung hatte und warum.]

## Wo das Tool an Grenzen stösst

So ehrlich der Anspruch, so ehrlich die Grenzen. Zwei wurden systematisch untersucht und sind belegt.

**Anatomie-Erkennung.** Ein gezielter Test mit von Hand gelabelten Bildern – grobe Fehlerbilder, saubere Kontrollbilder und Graubereichsfälle – zeigte: Das Werkzeug erkennt strukturelle Körper-Fehler nur unzuverlässig. Klare Fälle wie ein um 180 Grad verdrehter Kopf, ein dritter Arm oder verdrehte Beine wurden wiederholt übersehen. Geprüft wurden zwei verschiedene KI-Modelle; beide scheiterten an denselben grundlegenden Topologie-Fehlern, nur mit unterschiedlichem Fehlerprofil: das eine eher detailverliebt bei Händen (mit Neigung zu Fehlalarmen), das andere eher auf grosse Proportionen schauend. Selbst eine rechnerisch durchgespielte Kombination beider Modelle hob die Trefferquote nicht entscheidend an. Hinzu kommt, dass die ausgewiesene Schwere eines Fehlers tendenziell zu mild ausfällt – grobe Fehler erscheinen weniger dramatisch, als sie sind. Die Konsequenz war eine bewusste Entscheidung gegen technische Kunstgriffe (kein Modell-Wechsel je nach Fall, keine Modellkombination) und für Transparenz: Ein Anatomie-Hinweis ist als Aufforderung zur manuellen Prüfung zu verstehen, nicht als verlässliches Schwere-Urteil. Wichtig für die Einordnung: Die Stichproben waren klein, alle Schlüsse sind explorativ, nicht statistisch abgesichert.

**Maskierung als schwer fassbares Konstrukt.** Die zentrale These – visuelle Perfektion verdeckt inhaltliche Fehler – liess sich nicht sauber in eine einzelne Kennzahl giessen. Anfangs gab es einen numerischen Maskierungs-Wert, gebildet als Differenz zwischen Ästhetik und Integrität. Wiederholte Validierung gegen die von Hand codierte Referenz zeigte aber: Was das Werkzeug misst, deckt sich nicht mit dem, was die Forschung unter Maskierung versteht. Die handcodierte Referenz erfasst die Verdeckung *subtiler* Fehler bei sehr hohem Realismus; das Werkzeug bildete dagegen eher die Schwere von Fehlern und das Mass an Idealisierung ab – also etwas anderes. Kein Nachjustieren der Formel half, weil das Problem nicht in der Formel lag, sondern darin, dass zwei unterschiedliche Dinge gemessen wurden. Daraus folgte ein Rückbau: Der numerische Maskierungs-Wert wurde entfernt und durch einen beschreibenden Hinweis ersetzt, der nur dann erscheint, wenn das Modell mindestens eine konkrete mögliche Überdeckungsstelle markiert hat. Aus einer scheinbar präzisen Zahl wurde eine bewusst zurückhaltende, nachprüfbare Aussage.

Eine dritte Grenze betrifft die Bauweise selbst: Weil mehrere Analyse-Schritte im selben Aufruf entstehen, können sie sich gegenseitig beeinflussen. Eine zusätzliche Anweisung an einer Stelle des Prompts färbt messbar auf andere Befunde ab. Diese Kopplung lässt sich dämpfen, aber nicht vollständig ausschalten – ein grundsätzliches Risiko bei der phasenweisen Analyse innerhalb eines Modellaufrufs.

[Platzhalter: Eigene Reflexion – wie sich das Eingestehen dieser Grenzen anfühlte und was es für die Aussagekraft des Werkzeugs bedeutet.]

## Verworfene Wege

Mehrere ernsthaft verfolgte Ansätze wurden bewusst wieder verlassen. Sie sind hier festgehalten, weil das Verwerfen selbst Teil der Arbeit war. (Eine sachliche, vollständigere Übersicht aller erprobten und verworfenen Wege steht in [Entwicklungsprozess & Verworfenes](entwicklungsprozess.md) – hier geht es um die Erzählung dahinter.)

**Automatischer Prompt-Verbesserer.** *Erwogen:* ein zusätzlicher Schritt, der nach der Analyse automatisch verbesserte Bild-Prompts vorschlägt, um erkannte Probleme zu beheben. *Verworfen, weil:* Er hätte die kritische Reflexion an die nächste KI-Black-Box delegiert – das widerspricht dem Lernziel eines Prüf-Werkzeugs. Zudem hätte er implizit suggeriert, Bias liesse sich «mit dem richtigen Prompt» einfach weglösen, was der These zum Maskierungseffekt zuwiderläuft. *Stattdessen:* Der Fokus blieb auf der Diagnose. Das Werkzeug zeigt, was auffällt, und überlässt die Bewertung den Nutzenden. Die Idee bleibt als mögliche spätere Ausbaustufe dokumentiert, wird aber im aktuellen Rahmen nicht gebaut.

**Aufwändiges Holdout-Validierungsdesign.** *Erwogen:* eine streng abgesicherte Validierung mit eingefrorenem Testset, um die Maskierungs-Logik als generalisierbar nachzuweisen. *Verworfen, weil:* Bei den realistisch verfügbaren, sehr kleinen Stichproben war eine belastbare statistische Aussage nicht erreichbar; ein Review deckte ausserdem mehrere Verzerrungen im Validierungs-Aufbau auf. Der Aufwand stand in keinem Verhältnis zur erreichbaren Sicherheit und drohte, mehr Sicherheit vorzutäuschen, als die Daten hergaben. *Stattdessen:* explorative, transparent als nicht-signifikant gekennzeichnete Tests – und die ehrliche Diagnose, dass das Konstrukt selbst, nicht die Validierung, das eigentliche Problem war.

**Eigenes Signal für Emotionalisierung.** *Erwogen:* das Werkzeug sollte erkennen, wenn ein Bild stark emotional rahmt (etwa ein politisches Leidbild). Mehrere Varianten wurden getestet: zusätzliche Prompt-Regeln, ein beschreibender Emotions-Aspekt und ein regelbasierter Hinweis. *Verworfen, weil:* Jeder Zusatztext im Prompt verschob stabil andere Befunde (Kopplungseffekt); ein eigener Emotions-Aspekt hätte das Konstrukt verwässert, da nahezu jedes Kampagnenbild emotional rahmt; und das vorhandene Risiko-Signal misst nachweislich etwas anderes als emotionale Bildwirkung. *Stattdessen:* Emotionalisierung wurde als legitime persuasive Bildsprache eingeordnet, nicht als Fehler oder Bias – und die fehlende Greifbarkeit als Grenze des Werkzeugs akzeptiert, statt sie künstlich zu erzwingen.

Daneben gab es kleinere bewusste Verzichte: kein zweites, separat gepflegtes Frontend (stattdessen der Kommandozeilen-Testweg und aufklappbare Pipeline-Metadaten im Report), keine weitere Aufspaltung der Analyse in zusätzliche interpretierende KI-Aufrufe, und der Verzicht auf Modell-Routing oder Modellkombinationen, weil sie keinen belegbaren Mehrwert brachten.

[Platzhalter: Eigene Reflexion – welche dieser Verwerfungen am schwersten fiel und was sie über die eigene Arbeitsweise verrät.]

## Was ich gelernt habe

[Platzhalter: Persönliche Reflexion des Autors. Mögliche Anknüpfungspunkte aus dem Prozess, frei zu füllen oder zu ersetzen:]

- [Platzhalter: Was es bedeutet, eine qualitative Forschungsheuristik in deterministische Software zu übersetzen – und wo diese Übersetzung an ihre natürlichen Grenzen kam.]
- [Platzhalter: Der Wert des Verwerfens – warum das Streichen von Funktionen (Prompt-Verbesserer, numerischer Maskierungs-Wert, Emotions-Signal) das Projekt geschärft hat.]
- [Platzhalter: Was der Unterschied zwischen «etwas messen» und «das Richtige messen» für die eigene wissenschaftliche Haltung bedeutet – am Beispiel des Maskierungs-Konstrukts.]
- [Platzhalter: Wie sich das Eingestehen technischer Grenzen (Anatomie) zur Stärke statt zur Schwäche der Arbeit wandelte.]
- [Platzhalter: Persönliches Fazit – was vom Projekt bleibt, fachlich und über das Fach hinaus.]
