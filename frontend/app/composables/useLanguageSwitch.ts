// Manuelle Sprachwahl (Frontend 1.8). Die Cookie-Persistenz uebernimmt jetzt die eingebaute
// Browser-Erkennung (detectBrowserLanguage in nuxt.config, cookieKey 'i18n_locale'): setLocale()
// schreibt diesen Cookie selbst (v10: setLocaleSuspend -> setCookieLocale), die SSR-Erkennung
// liest ihn beim naechsten Init. Daher hier KEIN eigener Cookie-Write mehr – eine Quelle der
// Wahrheit statt zweier konkurrierender. useI18n ist ein Nuxt-Auto-Import.

// Locale-Code-Typ aus setLocale ableiten ('de' | 'en') – waechst automatisch mit den
// in nuxt.config konfigurierten Locales mit, kein Hardcoding.
type LocaleCode = Parameters<ReturnType<typeof useI18n>['setLocale']>[0]

export function useLanguageSwitch() {
  const { locale, locales, setLocale } = useI18n()

  async function switchTo(code: LocaleCode) {
    await setLocale(code)
  }

  return { locale, locales, switchTo }
}
