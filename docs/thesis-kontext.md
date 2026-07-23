# Forschungskontext

SemantIC ist nicht nur ein Werkzeug, sondern der praktische Teil einer Bachelorarbeit. Das Tool operationalisiert eine empirisch entwickelte Forschungsheuristik direkt als Prüflogik: Was in der qualitativen Analyse über KI-generierte Bilder gelernt wurde, wird hier zu einer maschinell anwendbaren Bewertung. Dieses Dokument schlägt die Brücke zwischen der Forschung und dem, was im Code passiert.

Die zugrunde liegende Arbeit ist die Bachelorarbeit *«Visual Bias im KI-generierten Bild – Manifestation und Wahrnehmung visueller Bevorzugung in synthetischen Bildern»* (Bachelor of Science FHGR in Multimedia Production, Fachhochschule Graubünden).

## Der Maskierungseffekt – die These in Klartext

Im Zentrum der Arbeit steht ein Phänomen, das hier **Maskierungseffekt** genannt wird:

> KI-Bildgeneratoren priorisieren visuelle Features (Schärfe, Farbe, Ästhetik) gegenüber semantischer Kohärenz. Dadurch können fehlerhafte oder stereotypisierende Bilder durch visuelle Perfektion «maskiert» werden – Fehler fallen weniger auf, weil das Bild zu überzeugend aussieht.

Kurz gesagt: Je perfekter ein KI-Bild auf den ersten Blick wirkt, desto eher übersieht man, dass es inhaltlich nicht stimmt – sei es eine physikalisch unmögliche Lichtsituation, eine anatomische Ungereimtheit oder eine stereotype Rollenbesetzung. Die ästhetische Oberfläche verdeckt den inhaltlichen Defekt.

Daraus ergibt sich die zentrale Differenzierung von SemantIC: Das Tool ist **kein «Fake vs. Real»-Detektor** (wie Deepfake-Erkennung), sondern ein «Schlechte KI vs. Gute KI»-Bewerter für semantische und ethische Qualität. Es fragt nicht «Ist das echt?», sondern «Hält dieses Bild einer inhaltlichen und ethischen Prüfung stand – auch wenn es schön aussieht?».

## Theoretische Grundlage

Der theoretische Ausgangspunkt des Maskierungseffekts ist die Max-Planck-Studie von Mahner et al. (2025). Sie zeigt, dass die untersuchten tiefen neuronalen Netze (Deep Neural Networks, DNNs) Bilder in ihren internen Repräsentationen stärker über visuelle Eigenschaften ordnen, während Menschen dieselben Bilder primär über semantische Dimensionen wahrnehmen.

Auf dieser Asymmetrie baut die These der Arbeit auf: Wenn bildgenerierende Systeme primär visuelle Merkmale belohnen, der menschliche Blick aber an der Bedeutung hängt, kann eine Lücke entstehen – und in dieser Lücke verstecken sich die unbemerkten Fehler. Wichtig zur Einordnung: Die Studie untersucht Bildverarbeitung, nicht Bildgenerierung, und weist den Maskierungseffekt selbst nicht nach – sie motiviert die Annahme, die die Bachelorarbeit anschliessend empirisch untersucht.

> Quellenangabe: Mahner, F. P., Muttenthaler, L., Güçlü, U., & Hebart, M. N. (2025). Dimensions underlying the representational alignment of deep neural networks with humans. *Nature Machine Intelligence, 7*(6), 848–859. https://doi.org/10.1038/s42256-025-01041-7

## Von der Forschung zur Prüfheuristik

Die Heuristik, die SemantIC anwendet, ist nicht erfunden, sondern aus Daten abgeleitet. In **Phase 1** der Arbeit wurde eine qualitative Inhaltsanalyse von **144 KI-generierten Bildern** durchgeführt. Aus dieser Codierung entstanden die Bausteine, die das Tool heute verwendet:

- **Lesearten** – wie ein Bild seinen Realitätsanspruch inszeniert (z. B. werblich, dokumentarisch, cinematisch)
- **Fehlerprofile** – welche Art von Defekt vorliegt (Physik, Anatomie, Kontext oder gemischt)
- **Visuelle Treiber** – welche gestalterischen Mittel den überzeugenden Eindruck erzeugen
- **Maskierungspotenzial** – die Einschätzung, wie stark ein Bild seine Fehler über die visuelle Oberfläche verdecken kann

Diese vier Ergebnisse bilden zusammen die **Research Layer** des Tools – die thesisbasierte Interpretationsschicht, die über die rein deskriptive Bildanalyse hinausgeht. Bei der Bewertung eines neuen Bildes ordnet die Pipeline es mit genau diesem Vokabular ein: Sie bestimmt die Leseart, benennt die aktiven visuellen Treiber und klassifiziert die gefundenen Fehler – zusätzlich zu den getrennt erhobenen Integritäts- und Ästhetik-Werten. Ein weiterer Baustein der Research Layer ist `normative_masking`: ein qualitatives Verdikt mit benannten Aspekten und Begründung dazu, wie stark ein Bild über seine Inszenierung wirkt – bewusst ohne Einfluss auf Scores oder Flags. Die Kalibrierung der Heuristik ist dabei primär auf fotorealistische Bilder ausgerichtet, da diese den Grossteil des codierten Materials ausmachen.

## Research Layer im Tool

Die Research Layer übersetzt die Forschungsergebnisse in ein festes Vokabular, das die Analyse-Pipeline pro Bild befüllt. Drei Tabellen fassen das Kernvokabular zusammen.

### Lesearten

Die Leseart beschreibt, über welche Inszenierungsstrategie ein Bild Glaubwürdigkeit aufbaut – und damit auch, wie es seine Fehler maskiert.

| Kürzel | Name | Maskierungslogik |
|:---|:---|:---|
| WA | Werbe-Ästhetik | Maskiert über Normativität / Idealwelt |
| DA | Dokumentarisch-Authentisch | Maskiert über scheinbare Objektivität |
| CI | Cinematisch | Maskiert affektiv über Filmstimmung |
| AA | Amateur-Authentisch | Maskiert über Vertrautheit / Spontaneität |
| MI | Magazin/Inszeniert | Maskiert über Professionalität / Status |

### Visuelle Treiber

Visuelle Treiber sind die gestalterischen Mittel, die den überzeugenden Eindruck erzeugen – also genau die Features, die laut These gegenüber der semantischen Kohärenz priorisiert werden.

| Kürzel | Bedeutung |
|:---|:---|
| CL | Cinematic Lighting |
| BK | Bokeh / Unschärfeverlauf |
| WCG | Warmes Color Grading |
| HDT | Hyper-Detail Textur |
| MO | Makellose Oberflächen |
| GF | Gesättigte Farben |
| DS | Dynamische Spiegelungen |
| NL | Natürliches Licht |
| MH | Maximale Helligkeit |

### Zentrale Codebook-Variablen

Diese Variablen stammen direkt aus dem Codebook der Phase-1-Analyse und werden in der Pipeline pro Bild gesetzt (Definition in `src/schemas/analysis.ts`):

| Variable | Beschreibung |
|:---|:---|
| `visual_realism_level` | Wie fotorealistisch das Bild wirkt (`low` / `medium` / `high`) |
| `masking_potential` | Historische Codebook-Variable aus Phase 1 (`low` / `medium` / `high`); wird intern mitgeführt, aber nicht als Maskierungs-Stufe kommuniziert |
| `has_physics_issue` | Physikalische Inkonsistenz vorhanden (mit Evidenz-Einträgen belegt) |
| `has_anatomy_issue` | Anatomische Inkonsistenz vorhanden (mit Evidenz-Einträgen belegt) |
| `has_context_issue` | Kontextbruch vorhanden (mit Evidenz-Einträgen belegt) |
| `hallucination_present` | Halluzinierte Bildinhalte vorhanden |
| `resistance_to_prompt` | Widerstand des Modells gegen die Prompt-Vorgabe |
| `has_gender_bias` | Geschlechtsbezogene Verzerrung |
| `has_role_stereotype` | Rollenstereotyp |
| `has_body_stereotype` | Körperstereotyp |
| `stereotype_intensity` | Intensität der Stereotypisierung (`none` / `low` / `medium` / `high`) |

> **Wichtiger Hinweis zur Bias-Logik:** Das Phase-1-Codebook erhebt wahrgenommenes Geschlecht und wahrgenommene Hautfarbe **rein deskriptiv** – sie sind **kein Bias-Flag**. Dass eine Person als männlich oder weiblich, hell- oder dunkelhäutig wahrgenommen wird, ist für sich genommen keine Verzerrung. Bias-Befunde laufen ausschliesslich über die Stereotyp-Flags (`has_gender_bias`, `has_role_stereotype`, `has_body_stereotype`) sowie über Rollenbesetzung, Machtdynamik und Kontextbrüche. Diese Trennung ist methodisch wichtig, damit das Tool nicht blosse Diversität fälschlich als Problem markiert.

## Was im Repo ist – und was nicht

Dieses Repository enthält die **technische Rohquelle** des Lehrprojekts:

- **Im Repo enthalten:** der Code der Analyse-Pipeline, das Frontend sowie die Schema- und Prompt-Definitionen.
- **Nicht im Repo enthalten:** die Roh-Forschungsdaten und die Phase-1-Codiertabellen der Bachelorarbeit. Diese sind Teil der wissenschaftlichen Studie und werden separat – im Rahmen der Arbeit selbst – verwaltet, nicht in diesem öffentlichen Code-Repository.

Das hat zwei Gründe: Erstens sind die codierten Bilddaten Forschungsmaterial der Arbeit und gehören in deren wissenschaftlichen Kontext, nicht in ein Software-Repo. Zweitens bleibt so eine saubere Trennung zwischen dem **Werkzeug** (öffentlich, reproduzierbar) und dem **Forschungsfundament** (Teil der Thesis). Die Research Layer im Code ist die *Anwendung* der Forschungsergebnisse – die Ergebnisse selbst werden in der Bachelorarbeit dokumentiert und belegt.
