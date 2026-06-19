// Cookie-Persistenz der manuellen Sprachwahl (Frontend 1.8).
// In nuxt.config ist detectBrowserLanguage:false (Erstbesuch landet IMMER auf de) –
// dadurch entfaellt die eingebaute Cookie-Persistenz von @nuxtjs/i18n. Wir schreiben
// den Cookie deshalb hier selbst; das Client-Plugin (plugins/i18n-persist.client.ts)
// wendet ihn beim Start an. useI18n/useCookie sind Nuxt-Auto-Imports.
export const LOCALE_COOKIE = 'i18n_locale'

// Locale-Code-Typ aus setLocale ableiten ('de' | 'en') – waechst automatisch mit den
// in nuxt.config konfigurierten Locales mit, kein Hardcoding.
type LocaleCode = Parameters<ReturnType<typeof useI18n>['setLocale']>[0]

export function useLanguageSwitch() {
  const { locale, locales, setLocale } = useI18n()
  const cookie = useCookie<string | null>(LOCALE_COOKIE, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    path: '/',
  })

  async function switchTo(code: LocaleCode) {
    await setLocale(code)
    cookie.value = code
  }

  return { locale, locales, switchTo }
}
