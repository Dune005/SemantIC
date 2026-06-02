<script setup lang="ts">
// default-Layout (IMPLEMENTATION-PLAN §5) – globale Hülle: Skip-Link + AppHeader +
// <main id="main"> + AppFooter. Hält den Chrome-Status (Bypass / Rate-Limit) lokal;
// in Etappe 3 statisch, Etappe 6 hängt hier den echten Cookie-/Rate-Limit-State ein.
import { ref, computed } from 'vue'

const route = useRoute()
const activeNav = computed<'home' | 'analyze' | 'how-it-works' | undefined>(() => {
  if (route.path === '/') return 'home'
  if (route.path.startsWith('/analyze')) return 'analyze'
  if (route.path.startsWith('/how-it-works')) return 'how-it-works'
  return undefined
})

// Chrome-State (Etappe 6 verkabelt): bypassActive + rateLimitHint sind via useState
// mit der analyze-Seite geteilt (sie schreibt die Werte aus den Response-Headern);
// bypassState/bypassError leben nur lokal im Layout (Status des Bypass-Felds).
const bypassActive = useState<boolean>('chrome:bypassActive', () => false)
const rateLimitHint = useState<string | null>('chrome:rateLimitHint', () => null)
const bypassState = ref<'idle' | 'submitting' | 'success' | 'error'>('idle')
const bypassError = ref<string | null>(null)

async function onRedeemBypass(code: string) {
  bypassState.value = 'submitting'
  bypassError.value = null
  try {
    // HttpOnly-Cookie wird serverseitig gesetzt; {ok:true} → Badge reaktiv (kein Reload).
    await $fetch('/api/bypass/redeem', { method: 'POST', body: { code } })
    bypassState.value = 'success'
    bypassActive.value = true
    // Bypass hebt das Limit auf → alter Rate-Limit-Hint ist hinfaellig (Fixture-konform).
    rateLimitHint.value = null
  } catch {
    // Verbatim aus content/microcopy.md (Bypass-Code-Feld, Fehler).
    bypassState.value = 'error'
    bypassError.value = 'Dieser Code stimmt nicht. Bitte prüf die Schreibweise.'
  }
}
</script>

<template>
  <div class="layout">
    <a class="skip-link" href="#main">Zum Inhalt springen</a>

    <AppHeader :active="activeNav" :bypass-active="bypassActive" :rate-limit-hint="rateLimitHint" />

    <main id="main" class="layout__main">
      <slot />
    </main>

    <AppFooter
      :bypass-active="bypassActive"
      :bypass-state="bypassState"
      :bypass-error="bypassError"
      @redeem-bypass="onRedeemBypass"
    />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.layout__main {
  flex: 1 0 auto;
}

/* Skip-Link – erstes fokussierbares Element, springt zu #main (header.html). */
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
</style>
