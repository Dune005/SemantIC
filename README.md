# SemantIC

**AI Visual Integrity Validator** – ein Workflow-Tool, das KI-generierte Bilder vor der Publikation prüft.

## Worum geht's

SemantIC bewertet KI-generierte Bilder auf drei Dimensionen:

1. **Physikalische Kohärenz** – stimmen Licht, Schatten, Anatomie, Proportionen?
2. **Semantische Konsistenz** – passt das Bild zum Nutzungskontext?
3. **Bias / Stereotypisierung** – welche sozialen Verzerrungen sind erkennbar?

Anders als klassische Deepfake-Detektoren ("Fake vs. Real") fragt SemantIC: **"Gute KI vs. schlechte KI"** – also nach semantischer und ethischer Qualität.

## Maskierungseffekt

Der Kern: KI-Bildgeneratoren priorisieren visuelle Oberfläche (Schärfe, Ästhetik, Farbe) gegenüber semantischer Stimmigkeit. Fehler und Stereotype können hinter visueller Perfektion verborgen werden. SemantIC macht diesen "Maskierungseffekt" sichtbar, indem es Ästhetik- und Integritätsbewertung getrennt erhebt und gegenüberstellt.

## Kontext

SemantIC ist der praktische Teil der Bachelorarbeit *"Visual Bias im KI-generierten Bild"* (Multimedia Production, Schweiz). Die Prüflogik operationalisiert eine empirisch entwickelte Heuristik aus 144 qualitativ codierten KI-Bildern.

## Status

Pipeline-Spike (CLI). Frontend (Nuxt) folgt.
