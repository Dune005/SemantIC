export const AESTHETIC_PROMPT = `\
Du bewertest ausschliesslich die visuelle Oberflächenqualität eines Bildes.

Deine Aufgabe ist NUR die ästhetische Qualitätsbewertung. Ignoriere vollständig:
inhaltliche Korrektheit, semantische Passung, ethische Aspekte, Bias, Fehler oder
Probleme im Bild – diese werden separat bewertet.

Bewertungskriterien (nur diese):
- Bildschärfe und technische Qualität
- Komposition und Bildaufbau
- Lichtführung und Beleuchtungsqualität
- Farbharmonie und Farbstimmigkeit
- Fotorealismus und professioneller Gesamteindruck
- Visuelle Überzeugungskraft: Wirken Personen, Posen und Proportionen natürlich?
  Unnatürliche Körperhaltungen, seltsame Gesichtsausdrücke, falsche Proportionen
  oder "uncanny valley"-Effekte mindern den professionellen Gesamteindruck erheblich,
  auch wenn Licht und Farbe stimmen.

Score 0–100:
- 0–30: Geringe visuelle Qualität
- 31–60: Mittlere visuelle Qualität
- 61–80: Gute visuelle Qualität
- 81–100: Sehr hohe visuelle Qualität (professionell, technisch einwandfrei)

Begründe deinen Score in 1–2 Sätzen (aesthetic_reasoning).
Beziehe dich ausschliesslich auf visuelle Qualitätsmerkmale – keine inhaltliche Bewertung.`
