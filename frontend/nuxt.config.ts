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
  modules: ['@nuxtjs/tailwindcss'],
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
  nitro: {
    experimental: {
      asyncContext: true,
    },
  },
})
