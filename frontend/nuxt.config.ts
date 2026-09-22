import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

// Lokaler Komfort: ENV aus ../.env.local (Repo-Root). Auf Vercel zaehlen die
// Dashboard-ENV-Vars (s. IMPLEMENTATION-PLAN Paket §6.5).
dotenv.config({ path: fileURLToPath(new URL('../.env.local', import.meta.url)) })

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: {
    // Eigener Port, damit frontend/ nicht mit web/ (3400) kollidiert.
    port: 3500,
  },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/i18n'],
  // Mehrsprachigkeit DE/EN (Frontend 1.8; Seitentext-Migration 2026-07-20 abgeschlossen).
  // Default DE, keine URL-Praefixe. Automatische Browser-Erkennung beim Erstbesuch AN,
  // seit die EN-Texte existieren (vorher aus, weil ein EN-Browser nur den de-Fallback gesehen haette).
  i18n: {
    defaultLocale: 'de',
    strategy: 'no_prefix',
    vueI18n: 'i18n.config.ts',
    // Erstbesuch ohne Cookie: Locale aus Accept-Language (en->EN, sonst/unbekannt->DE).
    // useCookie + derselbe cookieKey wie die manuelle Wahl ('i18n_locale') => EINE Quelle der
    // Wahrheit: setLocale() schreibt diesen Cookie selbst (v10: setLocaleSuspend -> setCookieLocale),
    // die SSR-Erkennung liest ihn beim Init (Server + Client identisch). Kein zweiter,
    // konkurrierender Cookie, keine app.vue-Reapply-Logik mehr noetig. Die manuelle Wahl gewinnt,
    // weil der Cookie VOR Accept-Language ausgewertet wird; alwaysRedirect:false verhindert
    // zusaetzlich, dass spaetere Navigationen erneut aus Accept-Language erkennen.
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      // 'all' statt 'root' (2026-09-15): Browsersprache auch beim Direktaufruf einer Unterseite
      // erkennen (z. B. /studie aus der Ergebnis-Mail). Ein gesetzter Sprach-Cookie gewinnt weiterhin.
      redirectOn: 'all',
      fallbackLocale: 'de',
      alwaysRedirect: false,
    },
    locales: [
      { code: 'de', name: 'Deutsch', language: 'de-CH', file: 'de.json' },
      { code: 'en', name: 'English', language: 'en-US', file: 'en.json' },
    ],
  },
  // Reihenfolge wichtig: tailwind.css (Preflight) zuerst, dann das
  // Variante-C-Design-System (tokens -> base), damit base.css den Preflight
  // ueberschreibt. tokens.css ist die einzige Token-Quelle.
  css: [
    '~/assets/css/tailwind.css',
    '~/assets/css/tokens.css',
    '~/assets/css/base.css',
  ],
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: '~~/tailwind.config.ts',
  },
  app: {
    head: {
      link: [
        // Favicon: roter Kreis (--crit) + weisses S. Das S ist im SVG als Pfad
        // eingebacken, nicht als <text> - Browser laden im Favicon-Kontext keine
        // Webfonts und wuerden sonst auf die Systemschrift zurueckfallen.
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'alternate icon', type: 'image/x-icon', href: '/favicon.ico', sizes: '16x16 32x32 48x48' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
  components: [
    { path: '~/components', pathPrefix: false, ignore: ['ui/**'] },
  ],
  alias: {
    // Geteilte Analyse-Pipeline (Repo-Root /src). Bundelt mit, wenn die
    // Pipeline-Runtime-Deps in package.json gespiegelt sind (Deploy-Spike PR #3).
    '@pipeline': fileURLToPath(new URL('../src', import.meta.url)),
  },
  // Die geteilte Pipeline (@pipeline -> ../src) wird von app/ (Typ-Importe in
  // composables/types) UND server/ (Wert-Import in analyze.post) referenziert und
  // dadurch in beiden Layern voll typgeprueft. src/ wird unter seiner EIGENEN
  // Root-tsconfig OHNE noUncheckedIndexedAccess entwickelt + kalibriert; wir
  // gleichen den frontend/-TypeCheck dieser bewussten Config-Wahl an, statt
  // kalibrierungs-relevanten Pipeline-Code (Box-Validierung, dominant_error_type)
  // einer strengeren Index-Regel zu unterwerfen. frontend/-eigener Code ist davon
  // unberuehrt (war unter der Regel bereits konform).
  typescript: {
    tsConfig: {
      compilerOptions: {
        noUncheckedIndexedAccess: false,
      },
    },
  },
  nitro: {
    experimental: {
      asyncContext: true,
    },
    // maxDuration der Vercel-Serverless-Funktion (LLM-Calls; Server-AbortController
    // ~280s in analyze.post.ts). NICHT ueber vercel.json `functions` setzen – dessen
    // Pattern matcht den Nitro-Output nicht (Build-Fehler). Nitro merged
    // `vercel.functions` in die Vercel-Function-Config (.vc-config.json).
    vercel: {
      functions: {
        maxDuration: 300,
      },
    },
    // Nitro generiert tsconfig.server.json separat und ignoriert den globalen
    // typescript.tsConfig oben – daher hier derselbe Override fuer den Server-Layer
    // (der @pipeline/analyze als Wert importiert). Grund s. typescript-Block oben.
    typescript: {
      tsConfig: {
        compilerOptions: {
          noUncheckedIndexedAccess: false,
        },
      },
    },
  },
})
