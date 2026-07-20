// vue-i18n-Optionen (Frontend 1.8, i18n-Seitentexte-Migration ab 2026-07-20).
// fallbackLocale = de: fehlt ein en-Key, faellt die EN-Ansicht auf den deutschen Text zurueck.
export default defineI18nConfig(() => ({
  legacy: false,
  fallbackLocale: 'de',
  // Waehrend/nach der Seitentext-Migration AN: jede echte Luecke (de-Key ohne en-Pendant)
  // wird im Dev als Warnung sichtbar. Der Analyse-Report rendert hartcodiertes Deutsch
  // (laeuft nicht ueber $t) und erzeugt daher KEINE Warnungen – Warnungen markieren also
  // ausschliesslich echte Luecken in den migrierten Seiten-/Chrome-Namespaces.
  missingWarn: true,
  fallbackWarn: true,
}))
