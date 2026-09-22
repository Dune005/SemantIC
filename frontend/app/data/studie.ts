// Statische Daten für die Seite /studie (Ergebnisseite der Rezeptionsstudie für die
// Teilnehmenden). Quelle: Vault «Ergebnis-Kommunikation Teilnehmende», Notizen 02–05.
//
// Dieses Modul hält NUR Struktur und Zahlen: Chart-Werte (aus Notiz 03, keine eigenen
// Berechnungen), Bildpfade + Masse, Kreis-Marker des Bildbeispiels, Reveal-Struktur
// (Teil-1-Bilder, Wahl-Sets mit Optionsrollen). Alle Texte liegen in i18n:
//   pages.studie.*            Seitentext, Bildbeispiel, Reveal
//   components.studieCharts.* Grafik-Titel, Labels, Anmerkungen, Alt-Texte
//
// Bild-IDs = Studien-IDs des Erhebungstools (visual-bias-study). Optionsrollen aus dessen
// scenarios.ts (scenarioImageRoles); genau eine control-Option je Set.

/** G1 – mittlerer Anteil der als KI-generiert eingestuften Bilder (55 Personen, je 6 Bilder). */
export const g1 = { recognisedPct: 48, imageCount: 6 } as const

/** G2 – Glaubwürdigkeit (Skala 1–7, Mittelwerte über 55 Personen). Anzeige mit einer Dezimale. */
export const g2 = {
  scaleMin: 1,
  scaleMax: 7,
  scaleMid: 4,
  coherent: { value: 5.15, label: '5.2', images: 2 },
  incoherent: { value: 4.33, label: '4.3', images: 4 },
} as const

/** G3 – Fehler in den freiwilligen Begründungen benannt (nur Begründende). */
export const g3 = {
  coffeeshop: { named: 25, total: 33 },
  ceo: { named: 4, total: 22 },
} as const

/** G4 – Anteil der Wahlen auf die inhaltlich korrekte Option (385 Wahlen, 55 × 7). */
export const g4 = { correctPct: 39, otherPct: 61, chancePct: 25 } as const

/** G5 – Begründungen zu gewählten verzerrten Optionen mit Stereotyp-/Normbezug. */
export const g5 = { withStereotype: 8, total: 212, columns: 20 } as const

/** Bildbeispiel fl-ceo-02: Kreis-Marker auf der Armbanduhr, Koordinaten im Bildmass (1200×900). */
export const ceoFigure = {
  id: 'fl-ceo-02',
  image: '/studie/fl-ceo-02.webp',
  width: 1200,
  height: 900,
  mark: { cx: 753, cy: 784, r: 52 },
} as const

export type OptionRole = 'control' | 'biased_social' | 'biased_other' | 'counter_stereotype'

export interface StudyImage {
  id: string
  /** Echte Pixelmasse der Thumbnail-WebP (aspect-ratio ohne @load). */
  width: number
  height: number
}

export interface Part1Image extends StudyImage {
  /** true = kohärentes Kontrollbild («fehlerfrei» im Sinn der untersuchten Fehler). */
  coherent: boolean
}

export interface ChoiceSet {
  id: string
  images: (StudyImage & { role: OptionRole })[]
}

/** Thumbnail-Pfad aus der Bild-ID. */
export const thumb = (id: string) => `/studie/thumbs/${id}.webp`

// Nano-Banana-Bilder (nb-*) sind 640×478, FLUX/Seedream (fl-*, sd-*) 640×480.
const dims = (id: string) => ({ width: 640, height: id.startsWith('nb-') ? 478 : 480 })

const p1 = (id: string, coherent: boolean): Part1Image => ({ id, coherent, ...dims(id) })
const opt = (id: string, role: OptionRole) => ({ id, role, ...dims(id) })

/** Teil 1 – die sechs bewerteten Bilder (4 inkohärent, 2 kohärent). */
export const part1Images: Part1Image[] = [
  p1('fl-ceo-02', false),
  p1('nb-coffeeshop-engineered-02', false),
  p1('fl-elderly-caregiver-engineered-01', false),
  p1('fl-busy-office-reality-04', false),
  p1('nb-elderly-caregiver-engineered-02', true),
  p1('nb-female-worker-counter-04', true),
]

/** Teil 2 – sieben Wahl-Sets à vier Optionen in Studien-Reihenfolge. */
export const choiceSets: ChoiceSet[] = [
  {
    id: 'set-01-ceo',
    images: [
      opt('fl-ceo-04', 'biased_social'),
      opt('nb-ceo-01', 'biased_other'),
      opt('nb-ceo-04', 'control'),
      opt('sd-ceo-04', 'biased_social'),
    ],
  },
  {
    id: 'set-02-nurse',
    images: [
      opt('fl-nurse-04', 'biased_social'),
      opt('nb-nurse-01', 'biased_social'),
      opt('nb-nurse-04', 'control'),
      opt('nb-nurse-02', 'biased_social'),
    ],
  },
  {
    id: 'set-03-emergency-room',
    images: [
      opt('fl-emergencyroom-01', 'control'),
      opt('nb-emergencyroom-01', 'biased_social'),
      opt('nb-emergencyroom-03', 'biased_social'),
      opt('sd-emergencyroom-03', 'biased_social'),
    ],
  },
  {
    id: 'set-04-construction-worker',
    images: [
      opt('fl-female-worker-counter-02', 'counter_stereotype'),
      opt('nb-female-worker-counter-01', 'control'),
      opt('nb-female-worker-counter-02', 'counter_stereotype'),
      opt('sd-female-worker-counter-04', 'counter_stereotype'),
    ],
  },
  {
    id: 'set-05-coffeeshop',
    images: [
      opt('fl-coffeeshop-01', 'biased_other'),
      opt('nb-coffeeshop-01', 'control'),
      opt('nb-coffeeshop-04', 'biased_other'),
      opt('sd-coffeeshop-04', 'biased_other'),
    ],
  },
  {
    id: 'set-06-glass',
    images: [
      opt('fl-glass-03', 'control'),
      opt('nb-glass-02', 'biased_other'),
      opt('nb-glass-03', 'biased_other'),
      opt('sd-glass-03', 'biased_other'),
    ],
  },
  {
    id: 'set-07-surgeon',
    images: [
      opt('fl-surgeon-engineered-01', 'biased_other'),
      opt('fl-surgeon-engineered-04', 'biased_other'),
      opt('nb-surgeon-engineered-03', 'control'),
      opt('sd-surgeon-engineered-02', 'biased_other'),
    ],
  },
]
