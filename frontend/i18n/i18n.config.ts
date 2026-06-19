// vue-i18n-Optionen (Frontend 1.8). fallbackLocale = de: solange en.json leer ist,
// faellt jede EN-Ansicht auf die deutschen Texte zurueck (Mechanik-Vorbereitung).
export default defineI18nConfig(() => ({
  legacy: false,
  fallbackLocale: 'de',
  // en.json ist in der Mechanik-Phase bewusst leer -> JEDER en-Key faellt auf de zurueck.
  // Ohne diese Flags spammt vue-i18n im Dev pro EN-Ansicht Dutzende Fallback-Warnings.
  // Bei echten EN-Texten missingWarn wieder aktivieren, um Luecken zu finden.
  missingWarn: false,
  fallbackWarn: false,
}))
