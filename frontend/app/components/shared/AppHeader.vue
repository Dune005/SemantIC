<script setup lang="ts">
// AppHeader (primitives.md §9 + header.html) – globale Kopfzeile (Shared Chrome).
// Brand + Hauptnav (aria-current, Unterstrich – keine Severity-Farbe) + Status-
// Bereich (Demo-Badge bei aktivem Bypass, optionaler Rate-Limit-Hinweis) + CTA.
// Nav als NuxtLink (Nuxt-Routing statt navigate-Emit – idiomatischer Port).
// Mobile: Hamburger-Disclosure (aria-expanded, Label wechselt). Kein v-html.
import { ref, computed } from 'vue'
import { Menu, X } from 'lucide-vue-next'
import Button from '~/components/ui/Button.vue'
import Badge from '~/components/ui/Badge.vue'

const props = withDefaults(
  defineProps<{
    active?: 'home' | 'analyze' | 'how-it-works'
    bypassActive?: boolean
    rateLimitHint?: string | null
  }>(),
  { active: undefined, bypassActive: false, rateLimitHint: null },
)

// Auf /analyze entfällt der CTA „Bild prüfen →" (header.html proto-note).
const showCta = computed(() => props.active !== 'analyze')

const menuOpen = ref(false)
function toggleMenu() {
  menuOpen.value = !menuOpen.value
}
function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <header class="app-header no-print">
    <div class="app-header__inner">
      <NuxtLink to="/" class="brand" aria-label="SemantIC – zur Startseite">
        <span class="brand__mark">SemantIC</span>
        <span class="brand__kicker">AI Visual Integrity Validator</span>
      </NuxtLink>

      <nav class="nav" aria-label="Hauptnavigation">
        <NuxtLink to="/analyze" :aria-current="active === 'analyze' ? 'page' : undefined">Tool</NuxtLink>
        <NuxtLink to="/how-it-works" :aria-current="active === 'how-it-works' ? 'page' : undefined">Funktionsweise</NuxtLink>
      </nav>

      <div class="header-actions">
        <span v-if="rateLimitHint" class="rate-hint">{{ rateLimitHint }}</span>
        <Badge v-if="bypassActive" mode="neutral" label="Demo-Zugang aktiv" />
        <Button v-if="showCta" as="a" href="/analyze" variant="secondary" size="md" class="whitespace-nowrap">
          Bild prüfen →
        </Button>
      </div>

      <button
        class="nav-toggle"
        type="button"
        :aria-label="menuOpen ? 'Menü schliessen' : 'Menü öffnen'"
        :aria-expanded="menuOpen"
        aria-controls="mobile-nav"
        @click="toggleMenu"
      >
        <X v-if="menuOpen" :size="20" aria-hidden="true" />
        <Menu v-else :size="20" aria-hidden="true" />
      </button>
    </div>

    <div id="mobile-nav" class="mobile-nav" :hidden="!menuOpen">
      <div class="mobile-nav__inner">
        <NuxtLink to="/analyze" class="mobile-nav__link" :aria-current="active === 'analyze' ? 'page' : undefined" @click="closeMenu">
          Tool
        </NuxtLink>
        <NuxtLink
          to="/how-it-works"
          class="mobile-nav__link"
          :aria-current="active === 'how-it-works' ? 'page' : undefined"
          @click="closeMenu"
        >
          Funktionsweise
        </NuxtLink>
        <Button v-if="showCta" as="a" href="/analyze" variant="secondary" size="md" class="mt-[14px] w-full" @click="closeMenu">
          Bild prüfen →
        </Button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--surface);
  border-bottom: 1px solid var(--line);
}
.app-header__inner {
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: var(--gutter);
  height: var(--header-h);
  display: flex;
  align-items: center;
  gap: 28px;
}

/* Brand: Wortmarke + Mono-Kicker (neutraler Inline-Divider, keine Karte). */
.brand {
  display: flex;
  align-items: baseline;
  gap: 12px;
  text-decoration: none;
  flex: 0 0 auto;
}
.brand__mark {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: 21px;
  letter-spacing: -0.02em;
  color: var(--ink);
  line-height: 1;
}
.brand__kicker {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 500;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--subtle);
  white-space: nowrap;
  padding-left: 12px;
  border-left: 1px solid var(--line);
}

/* Primärnavigation: aktiver Zustand = Unterstrich, KEINE Severity-Farbe. */
.nav {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-left: 8px;
}
/* :deep(), weil NuxtLink die <a> rendert (Konsistenz mit AppFooter). */
.nav :deep(a) {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: var(--muted);
  text-decoration: none;
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
  transition: color 0.12s ease, border-color 0.12s ease;
}
.nav :deep(a:hover) {
  color: var(--ink);
}
.nav :deep(a[aria-current='page']) {
  color: var(--ink);
  border-bottom-color: var(--ink);
}

/* Rechte Gruppe: Rate-Hinweis + Demo-Badge + CTA. */
.header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 14px;
}
.rate-hint {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--subtle);
  white-space: nowrap;
}

/* Hamburger – nur Mobile. */
.nav-toggle {
  display: none;
  margin-left: auto;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  background: var(--canvas);
  border: 1.5px solid var(--ink);
  border-radius: var(--r);
  cursor: pointer;
  color: var(--ink);
}

/* Mobile-Disclosure-Panel. */
.mobile-nav {
  display: none;
  border-bottom: 1px solid var(--line);
  background: var(--surface);
}
.mobile-nav__inner {
  max-width: var(--container);
  margin-inline: auto;
  padding: 8px var(--gutter) 16px;
  display: flex;
  flex-direction: column;
}
/* Nur die Nav-Links (Klasse), NICHT der CTA-Button im Panel. */
.mobile-nav :deep(.mobile-nav__link) {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 500;
  font-size: 16px;
  color: var(--ink);
  text-decoration: none;
  min-height: 44px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--line-soft);
}
/* Mobile-Aktivzustand bewusst nur font-weight (header.html Z.132) – kein Unterstrich. */
.mobile-nav :deep(.mobile-nav__link[aria-current='page']) {
  font-weight: 600;
}

@media (max-width: 719px) {
  .app-header__inner {
    height: 56px;
  }
  .brand__kicker {
    display: none;
  }
  .nav,
  .header-actions {
    display: none;
  }
  .nav-toggle {
    display: flex;
  }
  .mobile-nav:not([hidden]) {
    display: block;
  }
}
</style>
