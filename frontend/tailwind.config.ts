import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

// Etappe-0-Gruendgeruest. theme.extend wird in Etappe 1 aus dem Paket
// (design-system/tailwind-snippet.md, Variante C) befuellt – referenziert dann
// die var()-Tokens aus tokens.css, keine Hex-Duplikate.
export default <Partial<Config>>{
  darkMode: 'class',
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/composables/**/*.{js,ts}',
    './app/plugins/**/*.{js,ts}',
    './app/app.vue',
    './app/error.vue',
  ],
  theme: {
    extend: {},
  },
  plugins: [animate],
}
