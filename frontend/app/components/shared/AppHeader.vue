<script setup lang="ts">
// AppHeader (primitives.md §9 + header.html) – globale Kopfzeile (Shared Chrome).
// Brand + Hauptnav (aria-current, Unterstrich – keine Severity-Farbe) + Status-
// Bereich (Demo-Badge bei aktivem Bypass) + CTA. Der Tageslimit-Hinweis lebt
// seit der Verlegung auf der analyze-Seite (Stage-Karte), nicht mehr hier.
// Nav als NuxtLink (Nuxt-Routing statt navigate-Emit – idiomatischer Port).
// Mobile: Hamburger-Disclosure (aria-expanded, Label wechselt). Kein v-html.
// 1.5b: dunkle Kopfzeile (Ink-Inversion, --ink-*-Tokens) als Kontrast zur hellen
// Hero – Severity-Wörter/Kleintext sind hier tabu (tokens.css-Regel); Badge/Hint
// sind neutral. Fokus-Ring lokal auf --ink-text umgestellt (base.css-Ink wäre
// auf dunkler Fläche unsichtbar).
import { ref } from 'vue'
import { Menu, X } from 'lucide-vue-next'
import Button from '~/components/ui/Button.vue'
import Badge from '~/components/ui/Badge.vue'

const props = withDefaults(
  defineProps<{
    active?: 'home' | 'analyze' | 'how-it-works' | 'error-guide'
    bypassActive?: boolean
  }>(),
  { active: undefined, bypassActive: false },
)

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
      <NuxtLink to="/" class="brand" :aria-label="$t('header.brandAria')">
        <span class="brand__mark">SemantIC</span>
        <span class="brand__divider" aria-hidden="true" />
        <!-- Brand-Claim «AI Visual Integrity Check» (F4-Entscheid: «Validator» abgeschwächt).
             Bewusst NICHT identisch mit dem Hero-Kicker der Landing – der nennt die drei
             Prüfdimensionen, um die Dopplung Header/Hero zu vermeiden. -->
        <span class="brand__kicker">{{ $t('header.brandKicker') }}</span>
      </NuxtLink>

      <nav class="nav" :aria-label="$t('header.navAria')">
        <!-- „Tool"-Link entfernt: /analyze ist über den „Bild prüfen“-CTA erreichbar,
             ein zweiter Link aufs selbe Ziel wirkte redundant. -->
        <NuxtLink to="/how-it-works" :aria-current="active === 'how-it-works' ? 'page' : undefined">{{ $t('header.nav.howItWorks') }}</NuxtLink>
        <NuxtLink to="/error-guide" :aria-current="active === 'error-guide' ? 'page' : undefined">{{ $t('header.nav.errorGuide') }}</NuxtLink>
      </nav>

      <div class="header-actions">
        <Badge v-if="bypassActive" mode="neutral" :label="$t('header.badgeDemo')" class="badge-on-dark" />
        <!-- CTA wie v16-g: Mess-Punkt + Text statt weisser Kachel (kein Pfeil).
             Bewusst auch auf /analyze sichtbar, sonst springt die Kopfzeile beim
             Seitenwechsel (rechte Gruppe rückt zusammen). -->
        <NuxtLink to="/analyze" class="header-cta">
          <span class="header-cta__dot" aria-hidden="true" />{{ $t('header.cta') }}
        </NuxtLink>
        <LangSwitcher />
      </div>

      <button
        class="nav-toggle"
        type="button"
        :aria-label="menuOpen ? $t('header.menuClose') : $t('header.menuOpen')"
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
        <NuxtLink
          to="/how-it-works"
          class="mobile-nav__link"
          :aria-current="active === 'how-it-works' ? 'page' : undefined"
          @click="closeMenu"
        >
          {{ $t('header.nav.howItWorks') }}
        </NuxtLink>
        <NuxtLink
          to="/error-guide"
          class="mobile-nav__link"
          :aria-current="active === 'error-guide' ? 'page' : undefined"
          @click="closeMenu"
        >
          {{ $t('header.nav.errorGuide') }}
        </NuxtLink>
        <!-- Auf /analyze weggelassen: der Anchor lädt die Seite voll neu und würde
             Upload/Eingaben verwerfen; im Overlay-Panel entsteht dadurch kein
             Layout-Springen (anders als beim Desktop-CTA). -->
        <Button v-if="active !== 'analyze'" as="a" href="/analyze" variant="inverse" size="md" class="mt-[14px] w-full" @click="closeMenu">
          {{ $t('header.cta') }} →
        </Button>
        <div class="mobile-nav__lang">
          <LangSwitcher />
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--ink-surface);
  border-bottom: 1px solid var(--ink-line);
}
/* base.css setzt den Fokus-Ring in Ink – auf der dunklen Fläche unsichtbar. */
.app-header :deep(:focus-visible) {
  outline-color: var(--ink-text);
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
/* Brand-Zone wie v16-g: Wortmarke · vertikale Hairline · Claim, vertikal zentriert. */
.brand {
  display: flex;
  align-items: center;
  gap: 16px;
  text-decoration: none;
  flex: 0 0 auto;
}
.brand__divider {
  width: 1px;
  height: 18px;
  background: var(--ink-line);
  flex: 0 0 auto;
}
.brand__mark {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: 21px;
  letter-spacing: -0.02em;
  color: var(--ink-text);
  line-height: 1;
}
.brand__kicker {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 500;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-text-muted);
  white-space: nowrap;
}

/* Primärnavigation: aktiver Zustand = Unterstrich, KEINE Severity-Farbe. */
/* Nav rechtsbündig (v16-g): margin-left:auto schiebt Nav + Aktionen als eine
   Gruppe nach rechts; der Brand bleibt links. */
.nav {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-left: auto;
}
/* :deep(), weil NuxtLink die <a> rendert (Konsistenz mit AppFooter). */
.nav :deep(a) {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1;
  color: var(--ink-text-soft);
  text-decoration: none;
  /* Unterstrich-Reserve unten (4px + 2px Border) oben spiegeln, damit der Text
     vertikal mittig sitzt und mit dem CTA «Bild prüfen» auf einer Linie liegt. */
  padding-top: 6px;
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
  transition: color 0.12s ease, border-color 0.12s ease;
}
.nav :deep(a:hover) {
  color: var(--ink-text);
}
.nav :deep(a[aria-current='page']) {
  color: var(--ink-text);
  border-bottom-color: var(--ink-text);
}

/* Rechte Gruppe: Demo-Badge + CTA. Sitzt direkt nach der Nav
   (margin-left:auto liegt jetzt auf .nav → Nav + Aktionen bilden den rechten Block). */
.header-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}
/* CTA wie v16-g: Mess-Punkt + Text, Underline on hover, kein Button-Kasten. */
.header-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 600;
  font-size: 14px;
  line-height: 1;
  color: var(--ink-text);
  text-decoration: none;
  white-space: nowrap;
}
.header-cta:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-color: var(--ink-text);
}
.header-cta__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--crit);
  flex: 0 0 auto;
}
/* Badge-Neutral (helle Tokens) auf die dunkle Fläche umgelegt – nur hier im
   Header, die Badge-Komponente selbst bleibt unverändert. */
.header-actions :deep(.badge-on-dark) {
  background: var(--ink-surface-2);
  color: var(--ink-text-soft);
  border-color: var(--ink-line);
}

/* Hamburger – nur Mobile. 44px = Touch-Target-Minimum (Codex-Review 1.5b). */
.nav-toggle {
  display: none;
  margin-left: auto;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  background: var(--ink-surface-2);
  border: 1.5px solid var(--ink-text);
  border-radius: var(--r);
  cursor: pointer;
  color: var(--ink-text);
}

/* Mobile-Disclosure-Panel. */
.mobile-nav {
  display: none;
  border-bottom: 1px solid var(--ink-line);
  background: var(--ink-surface-2);
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
  color: var(--ink-text);
  text-decoration: none;
  min-height: 44px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--ink-line);
}
/* Mobile-Aktivzustand bewusst nur font-weight (header.html Z.132) – kein Unterstrich. */
.mobile-nav :deep(.mobile-nav__link[aria-current='page']) {
  font-weight: 600;
}
/* Sprachumschalter im Mobile-Panel: dezent abgesetzt (Trenner OBEN, nicht links). */
.mobile-nav__lang {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--ink-line);
}
/* Touch-Target 44px im Mobile-Panel (Codex-A11y); der Desktop-Trigger bleibt kompakt. */
.mobile-nav__lang :deep(.lang-trigger) {
  min-height: 44px;
}

/* Nav-Umschaltung ab 939px (vorher 859px): mit dem längeren CTA «Bild prüfen lassen»
   bricht «Typische Bildfehler» bei 860–940px zweizeilig um (Codex-Befund, verifiziert).
   Mobile-Menü greift deshalb früher; --header-h zieht in base.css auf denselben
   Breakpoint nach. */
@media (max-width: 939px) {
  .app-header__inner {
    height: 56px;
  }
  .brand__kicker,
  .brand__divider {
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
