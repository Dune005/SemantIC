// Sprachneutraler Label-Katalog für Lesearten und visuelle Treiber.
// EINZIGE Quelle dieser Labels (Beschluss feature/output-language, 2026-07-20):
// Frontend, CLI-Formatter und Prompts leiten Label + Maskierungslogik-Text
// deterministisch aus den neutralen Codes ab – das LLM liefert nur noch die
// Codes (reading_mode, visual_drivers), keine Label-Strings mehr.
//
// Wording-Leitplanke: Die Maskierungslogik ist eine Arbeitsthese, kein
// bewiesener Mechanismus – Modalverben («Kann … maskieren» / «Can mask …»),
// nie Wirkungs-Indikativ. Gilt für DE und EN gleichermassen.

export type OutputLang = 'de' | 'en'

export const READING_MODE_CODES = ['WA', 'DA', 'CI', 'AA', 'MI'] as const
export type ReadingModeCode = (typeof READING_MODE_CODES)[number]

export const VISUAL_DRIVER_CODES = ['CL', 'BK', 'WCG', 'HDT', 'MO', 'GF', 'DS', 'NL', 'MH'] as const
export type VisualDriverCode = (typeof VISUAL_DRIVER_CODES)[number]

interface ReadingModeEntry {
  label: Record<OutputLang, string>
  // Kanonische Maskierungslogik je Leseart (Quelle: Analyse-Prompt Phase 3 /
  // Phase-1-Korpus der Thesis).
  maskingLogic: Record<OutputLang, string>
}

export const READING_MODES: Record<ReadingModeCode, ReadingModeEntry> = {
  WA: {
    label: { de: 'Werbe-Ästhetik', en: 'Advertising Aesthetic' },
    maskingLogic: {
      de: 'Kann über Normativität und Idealwelt-Ästhetik maskieren',
      en: 'Can mask through normativity and ideal-world aesthetics',
    },
  },
  DA: {
    label: { de: 'Dokumentarisch-Authentisch', en: 'Documentary-Authentic' },
    maskingLogic: {
      de: 'Kann über scheinbare Objektivität und Authentizitätssignale maskieren',
      en: 'Can mask through apparent objectivity and authenticity signals',
    },
  },
  CI: {
    label: { de: 'Cinematisch', en: 'Cinematic' },
    maskingLogic: {
      de: 'Kann affektiv über Filmstimmung und emotionale Unmittelbarkeit maskieren',
      en: 'Can mask affectively through film mood and emotional immediacy',
    },
  },
  AA: {
    label: { de: 'Amateur-Authentisch', en: 'Amateur-Authentic' },
    maskingLogic: {
      de: 'Kann über Vertrautheit und Spontanitäts-Simulation maskieren',
      en: 'Can mask through familiarity and simulated spontaneity',
    },
  },
  MI: {
    label: { de: 'Magazin/Inszeniert', en: 'Magazine/Staged' },
    maskingLogic: {
      de: 'Kann über Professionalität und Statussignale maskieren',
      en: 'Can mask through professionalism and status signals',
    },
  },
}

export const VISUAL_DRIVERS: Record<VisualDriverCode, { label: Record<OutputLang, string> }> = {
  CL: { label: { de: 'Cinematic Lighting', en: 'Cinematic Lighting' } },
  BK: { label: { de: 'Bokeh / Unschärfeverlauf', en: 'Bokeh / Shallow Depth of Field' } },
  WCG: { label: { de: 'Warmes Color Grading', en: 'Warm Color Grading' } },
  HDT: { label: { de: 'Hyper-Detail Textur', en: 'Hyper-Detail Texture' } },
  MO: { label: { de: 'Makellose Oberflächen', en: 'Flawless Surfaces' } },
  GF: { label: { de: 'Gesättigte Farben', en: 'Saturated Colors' } },
  DS: { label: { de: 'Dynamische Spiegelungen', en: 'Dynamic Reflections' } },
  NL: { label: { de: 'Natürliches Licht', en: 'Natural Light' } },
  MH: { label: { de: 'Maximale Helligkeit', en: 'Maximum Brightness' } },
}

export function readingModeLabel(code: ReadingModeCode, lang: OutputLang): string {
  return READING_MODES[code].label[lang]
}

export function readingModeMaskingLogic(code: ReadingModeCode, lang: OutputLang): string {
  return READING_MODES[code].maskingLogic[lang]
}

export function visualDriverLabel(code: VisualDriverCode, lang: OutputLang): string {
  return VISUAL_DRIVERS[code].label[lang]
}
