import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

dotenv.config({ path: fileURLToPath(new URL('../.env.local', import.meta.url)) })

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: {
    port: 3400,
  },
  modules: ['@nuxtjs/tailwindcss'],
  alias: {
    '@pipeline': fileURLToPath(new URL('../src', import.meta.url)),
  },
  nitro: {
    experimental: {
      asyncContext: true,
    },
  },
})
