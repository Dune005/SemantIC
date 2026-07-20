<script setup lang="ts">
const { locale, locales } = useI18n()

// html lang folgt der aktiven Locale (Seitentext-Migration EN abgeschlossen): bei EN en-US,
// sonst de-CH. Vorher fix de-CH, weil der Inhalt per fallbackLocale deutsch blieb – mit echten
// EN-Texten waere lang="de-CH" fuer Screenreader falsch. Sprache je Locale aus der nuxt.config
// (locales[].language), kein Hardcoding.
// Die Locale selbst setzt die eingebaute Browser-Erkennung (detectBrowserLanguage in nuxt.config)
// aus dem Cookie 'i18n_locale' – auf Server und Client identisch. Darum hier KEIN onMounted-Reapply
// mehr: der wuerde nur das post-Hydration-Umschalten (Flash) zurueckbringen, das die SSR-Erkennung
// gerade ueberfluessig macht.
const htmlLang = computed(
  () => locales.value.find((l) => l.code === locale.value)?.language ?? 'de-CH',
)
useHead(() => ({ htmlAttrs: { lang: htmlLang.value } }))
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
