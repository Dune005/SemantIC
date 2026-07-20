// Statische Daten für die Seite /error-guide («Typische Bildfehler», umsetzung-1.10).
//
// Alle Marker-Boxen sind REDAKTIONELL gesetzt (Augenmass gegen die manuelle Phase-1-Codierung),
// Format [y_min, x_min, y_max, x_max] normiert 0–1000 (isValidBox-konform, s. ~/lib/overlay-spots).
// Sie markieren einen BEREICH, keine pixelgenaue Kontur. Stand: Erst-Entwurf – am gerenderten Bild
// zu justieren und vom Bearbeiter abzunehmen (entscheidungen.md §5). Bild-IDs verweisen auf die
// Codierung `codierte_Bilder_040526.csv`; keine LLM-/Pipeline-Koordinaten.
//
// i18n (Seitentext-Migration): Dieses Modul hält NUR Struktur (id, Bildpfad, Masse, Boxen,
// Kategorie, Spot-Anzahl). Alle Texte (alt, caption, Spot-Titel/-Text, Bias-Caption) liegen in
// i18n und werden über die id + Spot-Index abgeleitet:
//   pages.errorGuide.specimens.<id>.{alt,caption,spots.<i>.{title,text}}
//   pages.errorGuide.bias.<id>.{alt,caption}
// prompt bleibt als literaler Bildauftrag («nurse»/«CEO») im Datenmodul.

export interface SpecimenSpot {
  /** [y_min, x_min, y_max, x_max], ganzzahlig normiert 0–1000. */
  box: [number, number, number, number]
}

export interface ErrorSpecimen {
  id: string
  /** Pfad unter /public. */
  image: string
  /** Echte Pixelbreite/-höhe der WebP-Datei – liefert die aspect-ratio ohne @load
   *  (kein Layout-Sprung im gestapelten Tour-Frame, kein Marker-Flash). */
  width: number
  height: number
  category: 'anatomy' | 'context' | 'physics'
  /** 1–4 Spots; Nummerierung = Index + 1. Text via i18n (siehe Kopf). */
  spots: SpecimenSpot[]
}

/** Bias-Block (§4): stille Beispiele ohne Marker – nur Bild + Bildlegende. */
export interface BiasExample {
  id: string
  image: string
  /** Sinngemässer Bildauftrag, z. B. «nurse» (literal, nicht übersetzt). */
  prompt: string
}

export const errorSpecimens: ErrorSpecimen[] = [
  // ---------------------------------------------------------------- ANATOMIE
  {
    id: 'anatomie-notaufnahme',
    image: '/error-guide/anatomie-notaufnahme-finger.webp',
    width: 1600,
    height: 1200,
    category: 'anatomy',
    spots: [{ box: [426, 283, 479, 343] }, { box: [361, 336, 424, 411] }],
  },
  {
    id: 'anatomie-barista',
    image: '/error-guide/anatomie-barista-haende.webp',
    width: 1600,
    height: 1200,
    category: 'anatomy',
    spots: [{ box: [407, 142, 504, 243] }],
  },
  // ---------------------------------------------------------------- KONTEXT
  {
    id: 'kontext-coffeeshop-laptop',
    image: '/error-guide/kontext-coffeeshop-laptop.webp',
    width: 1600,
    height: 1200,
    category: 'context',
    spots: [{ box: [573, 70, 668, 143] }, { box: [567, 142, 670, 174] }],
  },
  {
    id: 'kontext-dinner-weinglas',
    image: '/error-guide/kontext-dinner-weinglas.webp',
    width: 1200,
    height: 896,
    category: 'context',
    spots: [{ box: [577, 556, 762, 651] }],
  },
  // ---------------------------------------------------------------- PHYSIK
  {
    id: 'physik-coffeeshop-spiegelung',
    image: '/error-guide/physik-coffeeshop-spiegelung.webp',
    width: 1600,
    height: 1200,
    category: 'physics',
    spots: [{ box: [482, 616, 608, 720] }, { box: [546, 0, 691, 129] }],
  },
  {
    id: 'physik-notaufnahme-spiegelung',
    image: '/error-guide/physik-notaufnahme-spiegelung.webp',
    width: 1600,
    height: 1195,
    category: 'physics',
    spots: [{ box: [175, 615, 335, 823] }],
  },
]

export const biasExamples: BiasExample[] = [
  { id: 'bias-nurse', image: '/error-guide/bias-nurse.webp', prompt: 'nurse' },
  { id: 'bias-ceo', image: '/error-guide/bias-ceo.webp', prompt: 'CEO' },
]

/** Alle Beispiele einer Fehlerkategorie (Reihenfolge = Datei-Reihenfolge). */
export function specimensByCategory(category: ErrorSpecimen['category']): ErrorSpecimen[] {
  return errorSpecimens.filter((s) => s.category === category)
}
