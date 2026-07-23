<script setup lang="ts">
// default-Layout (IMPLEMENTATION-PLAN §5) – globale Hülle: Skip-Link + AppHeader +
// <main id="main"> + AppFooter. Hält den Chrome-Status (Bypass / Rate-Limit) lokal;
// in Etappe 3 statisch, Etappe 6 hängt hier den echten Cookie-/Rate-Limit-State ein.
import { ref, computed } from 'vue'

const route = useRoute()
const { t } = useI18n()
const activeNav = computed<'home' | 'analyze' | 'how-it-works' | 'error-guide' | undefined>(() => {
  if (route.path === '/') return 'home'
  if (route.path.startsWith('/analyze')) return 'analyze'
  if (route.path.startsWith('/how-it-works')) return 'how-it-works'
  if (route.path.startsWith('/error-guide')) return 'error-guide'
  return undefined
})

// Chrome-State (Etappe 6 verkabelt): bypassActive + rateLimitHint sind via useState
// mit der analyze-Seite geteilt (sie schreibt die Werte aus den Response-Headern);
// bypassState/bypassError leben nur lokal im Layout (Status des Bypass-Felds).
// rateLimitHint wird seit der Verlegung nur noch auf der analyze-Seite angezeigt –
// das Layout hält den State weiterhin, um ihn beim Bypass-Einlösen zu nullen.
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
    // Fehlertext i18n-fähig (Codex 1.8): sonst überschreibt der hartkodierte Layout-Text
    // den $t-Fallback in BypassCodeField. Einzige Fehler-Quelle = bypass.error.
    bypassState.value = 'error'
    bypassError.value = t('bypass.error')
  }
}
</script>

<template>
  <div class="layout">
    <a class="skip-link" href="#main">{{ $t('common.skipToContent') }}</a>

    <AppHeader :active="activeNav" :bypass-active="bypassActive" />

    <main id="main" class="layout__main">
      <slot />
    </main>

    <AppFooter
      :bypass-active="bypassActive"
      :bypass-state="bypassState"
      :bypass-error="bypassError"
      @redeem-bypass="onRedeemBypass"
    />

    <!-- Custom-Cursor «Dual-State» (1.5/L3). Abschalten/Austauschen = diese Zeile. -->
    <VerdictCursor />
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
