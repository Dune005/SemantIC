// useReportT – Übersetzungen in der EINGEFRORENEN Report-Sprache (i18n Analyse-Report).
//
// Der Analyse-Report wird zu Analysebeginn in einer Sprache erzeugt (vm.reportLang)
// und darf durch einen späteren UI-Sprachwechsel NICHT gemischt werden. analyze.vue
// provided die fixierte Report-Sprache; rt() übersetzt report.*-Keys immer in dieser
// Locale (statt reaktiv in der UI-Locale). Ohne Provider (z. B. Komponenten-Preview)
// fällt reportLang auf die aktuelle UI-Locale zurück.
import { inject, computed, type ComputedRef, type InjectionKey } from 'vue'
import { useI18n } from 'vue-i18n'

export const REPORT_LANG_KEY: InjectionKey<ComputedRef<'de' | 'en'>> = Symbol('semantic-report-lang')

export function useReportT() {
  const { t, locale } = useI18n()
  const injected = inject(REPORT_LANG_KEY, null)
  const reportLang = computed<'de' | 'en'>(() =>
    injected?.value ?? (locale.value === 'en' ? 'en' : 'de'),
  )
  // Feste Locale via TranslateOptions – vue-i18n Composer-Signatur t(key, named, options).
  const rt = (key: string, params?: Record<string, unknown>) =>
    t(key, params ?? {}, { locale: reportLang.value })
  // Plural-Variante («{n} Befund | {n} Befunde»): options.plural wählt die Form.
  const rtp = (key: string, count: number, params?: Record<string, unknown>) =>
    t(key, { n: count, ...params }, { locale: reportLang.value, plural: count })
  return { rt, rtp, reportLang }
}
