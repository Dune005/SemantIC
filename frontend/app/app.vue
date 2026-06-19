<script setup lang="ts">
import { LOCALE_COOKIE } from '~/composables/useLanguageSwitch'

// html lang bleibt bis zur EN-Textmigration fix de-CH (Frontend-1.8-Entscheid): EN ist
// waehlbar, der Inhalt bleibt per fallbackLocale aber deutsch – lang="en" waere fuer
// Screenreader falsch. Bei echten EN-Texten auf useLocaleHead() umstellen.
useHead(() => ({ htmlAttrs: { lang: 'de-CH' } }))

// Gespeicherte Sprachwahl beim Client-Start anwenden (Cookie -> setLocale). Hier im
// setup-Kontext ist useI18n erlaubt (im Nuxt-Plugin-Body NICHT); onMounted laeuft erst
// nach der Hydration -> kein SSR/Client-Mismatch. Server rendert immer de (default).
const { setLocale, locale, locales } = useI18n()
const localeCookie = useCookie<string | null>(LOCALE_COOKIE)
onMounted(() => {
  const code = localeCookie.value
  if (code && code !== locale.value && locales.value.some((l) => l.code === code)) {
    setLocale(code as typeof locale.value)
  }
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
