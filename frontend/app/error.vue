<script setup lang="ts">
// error.vue (404 aus pages/_shared/404.html) – generische Fehlerseite. Liegt
// AUSSERHALB des default-Layouts → eigener Skip-Link + <main id="main"> + Header
// + schmale Bottom-Bar (404-Prototyp-Priorität; kein voller Footer/Bypass hier).
// Navigation via clearError({ redirect }) setzt den Fehler-State sauber zurück.
import { computed } from 'vue'
import type { NuxtError } from '#app'
import Button from '~/components/ui/Button.vue'

const props = defineProps<{ error: NuxtError }>()

const isNotFound = computed(() => props.error?.statusCode === 404)
const codeLine = computed(() =>
  isNotFound.value ? '// 404 · seite nicht gefunden' : `// ${props.error?.statusCode ?? 500} · fehler`,
)
const headline = computed(() => (isNotFound.value ? 'Diese Seite gibt es nicht.' : 'Etwas ist schiefgelaufen.'))
const body = computed(() =>
  isNotFound.value
    ? 'Die aufgerufene Adresse führt ins Leere – vielleicht ein veralteter Link oder ein Tippfehler. Du kommst von hier aus direkt zurück zur Startseite oder startest gleich eine Bildprüfung.'
    : 'Hier ist unerwartet etwas schiefgelaufen. Du kommst von hier aus zurück zur Startseite oder startest direkt eine Bildprüfung.',
)

function goHome() {
  clearError({ redirect: '/' })
}
function goTool() {
  clearError({ redirect: '/analyze' })
}
</script>

<template>
  <div class="error-page">
    <a class="skip-link" href="#main">Zum Inhalt springen</a>

    <AppHeader />

    <main id="main" class="error-page__main">
      <section class="notfound">
        <p class="notfound__kicker">Fehler</p>
        <p class="notfound__code">{{ codeLine }}</p>
        <h1>{{ headline }}</h1>
        <p>{{ body }}</p>
        <div class="notfound__actions">
          <Button as="a" href="/" variant="primary" @click.prevent="goHome">Zur Startseite</Button>
          <Button as="a" href="/analyze" variant="secondary" @click.prevent="goTool">Zum Tool</Button>
        </div>
      </section>
    </main>

    <footer class="error-footer no-print" role="contentinfo">
      <div class="inner">
        <span>© 2026 Claudio Riz · FH Graubünden · Lehrprojekt · Version 1.0</span>
        <NuxtLink to="/privacy">Datenschutz</NuxtLink>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.error-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.error-page__main {
  flex: 1 0 auto;
  display: flex;
  align-items: center;
}

.skip-link {
  position: absolute;
  left: 8px;
  top: -48px;
  z-index: 100;
  background: var(--ink);
  color: var(--surface);
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 12px;
  letter-spacing: 0.08em;
  padding: 8px 14px;
  border-radius: var(--r);
  transition: top 0.12s ease;
}
.skip-link:focus {
  top: 8px;
}

.notfound {
  max-width: var(--container-text);
  margin-inline: auto;
  padding: 96px var(--gutter);
  width: 100%;
}
.notfound__kicker {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--subtle);
}
.notfound__code {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 500;
  font-size: 13px;
  letter-spacing: 0.04em;
  color: var(--muted);
  margin-top: 6px;
}
.notfound h1 {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(34px, 6vw, 52px);
  line-height: 1.02;
  letter-spacing: -0.03em;
  color: var(--ink);
  margin-top: 18px;
}
.notfound p {
  color: var(--muted);
  font-size: 16px;
  line-height: 1.6;
  max-width: 54ch;
  margin-top: 16px;
}
.notfound__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 32px;
}

/* Schmale Bottom-Bar (404.html – nicht der volle Footer mit Bypass). */
.error-footer {
  flex: 0 0 auto;
  background: var(--canvas);
  border-top: 1px solid var(--line);
}
.error-footer .inner {
  max-width: var(--container);
  margin-inline: auto;
  padding: 18px var(--gutter);
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  align-items: center;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--subtle);
}
.error-footer :deep(a) {
  color: var(--ink-soft);
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
