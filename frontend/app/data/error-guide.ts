// Statische Daten für die Seite /error-guide («Typische Bildfehler», umsetzung-1.10).
//
// Alle Marker-Boxen sind REDAKTIONELL gesetzt (Augenmass gegen die manuelle Phase-1-Codierung),
// Format [y_min, x_min, y_max, x_max] normiert 0–1000 (isValidBox-konform, s. ~/lib/overlay-spots).
// Sie markieren einen BEREICH, keine pixelgenaue Kontur. Stand: Erst-Entwurf – am gerenderten Bild
// zu justieren und vom Bearbeiter abzunehmen (entscheidungen.md §5). Bild-IDs verweisen auf die
// Codierung `codierte_Bilder_040526.csv`; keine LLM-/Pipeline-Koordinaten.

export interface SpecimenSpot {
  /** [y_min, x_min, y_max, x_max], ganzzahlig normiert 0–1000. */
  box: [number, number, number, number]
  /** Kurzlabel, erscheint am Pin-Tooltip und als Listen-Titel. */
  title: string
  /** 1–2 Sätze Erklärung, publikumsgerecht (aus der Codierungs-Notiz). */
  text: string
}

export interface ErrorSpecimen {
  id: string
  /** Pfad unter /public. */
  image: string
  /** Echte Pixelbreite/-höhe der WebP-Datei – liefert die aspect-ratio ohne @load
   *  (kein Layout-Sprung im gestapelten Tour-Frame, kein Marker-Flash). */
  width: number
  height: number
  /** Szenenbeschreibung (darf die Fehler nennen – kein Suchspiel). */
  alt: string
  /** Herkunftszeile für die Bildlegende. */
  caption: string
  category: 'anatomy' | 'context' | 'physics'
  /** 1–4 Spots; Nummerierung = Index + 1. */
  spots: SpecimenSpot[]
}

/** Bias-Block (§4): stille Beispiele ohne Marker – nur Bild + Bildlegende. */
export interface BiasExample {
  id: string
  image: string
  alt: string
  /** Sinngemässer Bildauftrag, z. B. «nurse». */
  prompt: string
  /** Was die KI daraus macht (Stereotyp-Beschreibung). */
  caption: string
}

export const errorSpecimens: ErrorSpecimen[] = [
  // ---------------------------------------------------------------- ANATOMIE
  {
    id: 'anatomie-notaufnahme',
    image: '/error-guide/anatomie-notaufnahme-finger.webp',
    width: 1600,
    height: 1200,
    alt: 'Überfüllter Krankenhaus-Wartebereich; im Vordergrund rechts eine Pflegerin am Empfangstisch, links wartende Patienten auf Stühlen.',
    caption: 'KI-generiert · Studienkorpus, Bild SD_emergencyroom_03',
    category: 'anatomy',
    spots: [
      {
        box: [380, 235, 630, 365],
        title: 'Verschmelzende Gliedmassen',
        text: 'Bei der wartenden Frau und dem Kind auf ihrem Schoss gehen Arme und Beine ineinander über – die KI verliert an den Überlappungen die Grenze zwischen zwei Körpern.',
      },
      {
        box: [430, 330, 590, 445],
        title: 'Zu viele Finger',
        text: 'An der Hand des daneben wartenden Mannes lassen sich mehr Finger zählen, als anatomisch möglich sind.',
      },
    ],
  },
  {
    id: 'anatomie-barista',
    image: '/error-guide/anatomie-barista-haende.webp',
    width: 1600,
    height: 1200,
    alt: 'Café-Innenraum; eine Barista mit Schürze hinter dem Tresen hält ein Tablett, im Vordergrund Gäste an Laptops.',
    caption: 'KI-generiert · Studienkorpus, Bild FL_coffeeshop_02',
    category: 'anatomy',
    spots: [
      {
        box: [410, 140, 575, 270],
        title: 'Zu viele Hände',
        text: 'Die Barista scheint das Tablett gleichzeitig von oben und von unten zu halten – es sind mehr Hände im Bild, als die Haltung zulässt.',
      },
    ],
  },
  // ---------------------------------------------------------------- KONTEXT
  {
    id: 'kontext-coffeeshop-laptop',
    image: '/error-guide/kontext-coffeeshop-laptop.webp',
    width: 1600,
    height: 1200,
    alt: 'Café mit Gebäckvitrine; mehrere Gäste sitzen an kleinen Tischen an Laptops, am Fenster Blick auf die Strasse.',
    caption: 'KI-generiert · Studienkorpus, Bild FL_coffeeshop_01',
    category: 'context',
    spots: [
      {
        box: [640, 20, 815, 170],
        title: 'Laptop ohne Bildschirm',
        text: 'Der Gast im Vordergrund tippt auf einem Laptop, dessen Display fehlt – das Gerät ergibt so keinen Sinn.',
      },
      {
        box: [570, 245, 705, 325],
        title: 'Pflanze aus der Tasse',
        text: 'Aus einem Gefäss, in dem Kaffee stehen sollte, wächst eine Zimmerpflanze.',
      },
    ],
  },
  {
    id: 'kontext-dinner-weinglas',
    image: '/error-guide/kontext-dinner-weinglas.webp',
    width: 1200,
    height: 896,
    alt: 'Mehrgenerationen-Familie an einem festlich gedeckten Esstisch, ausgelassene Stimmung, Braten und Rotwein in der Mitte.',
    caption: 'KI-generiert · Studienkorpus, Bild NB_dinner_04',
    category: 'context',
    spots: [
      {
        box: [600, 620, 785, 715],
        title: 'Weinglas am Kinderplatz',
        text: 'Am Platz des kleinen Jungen steht ein gefülltes Rotweinglas – inhaltlich absurd, aber technisch tadellos gerendert.',
      },
    ],
  },
  // ---------------------------------------------------------------- PHYSIK
  {
    id: 'physik-coffeeshop-spiegelung',
    image: '/error-guide/physik-coffeeshop-spiegelung.webp',
    width: 1600,
    height: 1200,
    alt: 'Café mit grosser verchromter Espressomaschine hinter dem Tresen; eine Barista bereitet Kaffee zu, am Fenster ein Gast am Laptop.',
    caption: 'KI-generiert · Studienkorpus, Bild FL_coffeeshop_04',
    category: 'physics',
    spots: [
      {
        box: [375, 510, 575, 705],
        title: 'Falsche Spiegelung',
        text: 'Die verchromte Espressomaschine spiegelt eine Umgebung, die nicht zur Szene davor passt.',
      },
      {
        box: [525, 225, 645, 345],
        title: 'Bildschirm zur falschen Seite',
        text: 'Der Laptop am Fenster zeigt seinen Bildschirm zur falschen Seite – nicht von der davorsitzenden Person weg.',
      },
    ],
  },
  {
    id: 'physik-notaufnahme-spiegelung',
    image: '/error-guide/physik-notaufnahme-spiegelung.webp',
    width: 1600,
    height: 1195,
    alt: 'Urgent-Care-Wartebereich mit Empfangstresen und Glastrennwand; wartende Personen, rechts eine telefonierende Pflegerin.',
    caption: 'KI-generiert · Studienkorpus, Bild NB_emergencyroom_01',
    category: 'physics',
    spots: [
      {
        box: [175, 615, 490, 800],
        title: 'Spiegelung stimmt nicht',
        text: 'In der Glastrennwand spiegeln sich die Deckenlampen und das Schild falsch – ein Bruch, der kaum auffällt, weil das Bild sonst überzeugend wirkt. Genau das ist der Maskierungseffekt.',
      },
    ],
  },
]

export const biasExamples: BiasExample[] = [
  {
    id: 'bias-nurse',
    image: '/error-guide/bias-nurse.webp',
    alt: 'Junge, lächelnde Pflegerin in weisser Uniform mit Haube und Stethoskop in einem Krankenhausflur.',
    prompt: 'nurse',
    caption: 'Auf «nurse» liefert die KI zuverlässig eine junge, attraktive Frau – Rolle und Körperbild sind stereotyp besetzt.',
  },
  {
    id: 'bias-ceo',
    image: '/error-guide/bias-ceo.webp',
    alt: 'Mann mittleren Alters im dunklen Anzug mit Krawatte in einem modernen Eckbüro mit Skyline und Kurschart im Hintergrund.',
    prompt: 'CEO',
    caption: 'Auf «CEO» liefert sie einen Mann in Führungspose im Chefbüro – das komplementäre Rollen-Stereotyp.',
  },
]

/** Alle Beispiele einer Fehlerkategorie (Reihenfolge = Datei-Reihenfolge). */
export function specimensByCategory(category: ErrorSpecimen['category']): ErrorSpecimen[] {
  return errorSpecimens.filter((s) => s.category === category)
}
