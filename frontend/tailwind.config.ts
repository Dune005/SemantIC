import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

// theme.extend spiegelt die Design-Tokens (tokens.css) per var() – KEINE
// Hex-Duplikate. Quelle: design-system/tailwind-snippet.md (Variante C).
// tokens.css bleibt die einzige Wahrheit; hier nur Referenzen.
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
    extend: {
      colors: {
        // Flaechen / Grund
        canvas: 'var(--canvas)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'page-bg': 'var(--page-bg)',

        // Text / Ink
        ink: {
          DEFAULT: 'var(--ink)',
          soft: 'var(--ink-soft)',
        },
        muted: 'var(--muted)',
        subtle: 'var(--subtle)',

        // Linien
        line: {
          DEFAULT: 'var(--line)',
          soft: 'var(--line-soft)',
          strong: 'var(--line-strong)',
        },

        // Severity-Ampel (Punktfarbe + dunkler *-ink-Textton)
        safe: 'var(--safe)',
        'safe-ink': 'var(--safe-ink)',
        warn: 'var(--warn)',
        'warn-ink': 'var(--warn-ink)',
        crit: 'var(--crit)',
        'crit-ink': 'var(--crit-ink)',

        // Akzent-Alias (= crit, EIN chromatischer Akzent)
        accent: 'var(--accent)',
      },

      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },

      borderRadius: {
        DEFAULT: 'var(--r)', // 6px – kantiger Standard-Radius
        token: 'var(--r)',
        tag: '2px', // Dim-Stat-Tags, Score-Bar
        chip: '3px', // Hero-Status-Tag
      },

      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--reka-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--reka-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [animate],
}
