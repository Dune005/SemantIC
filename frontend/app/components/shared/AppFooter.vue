<script setup lang="ts">
// AppFooter (primitives.md §10 + footer.html) – globaler Fuss (Shared Chrome).
// 3 Spalten: Selbstbeschreibung · Demo-Zugang (BypassCodeField) · Projekt-Links.
// Copy-Quelle priorisiert: footer.html (finales Markup). Der Bypass-Redeem läuft
// erst in Etappe 6 (Server) – hier nur das Event `redeemBypass(code)` nach oben.
// `.no-print` blendet den Footer im Druck aus (base.css @media print).
import { ref, computed } from 'vue'
import BypassCodeField from '~/components/shared/BypassCodeField.vue'

const props = withDefaults(
  defineProps<{
    bypassActive?: boolean
    bypassState?: 'idle' | 'submitting' | 'success' | 'error'
    bypassError?: string | null
  }>(),
  {
    bypassActive: false,
    bypassState: 'idle',
    bypassError: null,
  },
)

const emit = defineEmits<{ redeemBypass: [code: string] }>()

// Aktiver Bypass (Cookie gesetzt, Etappe 6) ⇒ Feld zeigt direkt die Bestätigung.
// Eine Quelle für Header-Badge UND Footer-Feld – keine Divergenz.
const effectiveState = computed(() => (props.bypassActive ? 'success' : props.bypassState))

// Code lokal gehalten (controlled BypassCodeField); beim Einlösen nach oben melden.
const code = ref('')
function onRedeem() {
  emit('redeemBypass', code.value.trim())
}
</script>

<template>
  <footer class="app-footer no-print" role="contentinfo">
    <div class="app-footer__inner">
      <!-- Spalte 1: Selbstbeschreibung. Inline-Link via <i18n-t> (Component-Interpolation),
           damit der Satz EIN i18n-Key bleibt und der Link an {link} sitzt. -->
      <div class="foot-col foot-brand">
        <span class="mark">SemantIC</span>
        <i18n-t keypath="footer.aboutText" tag="p" scope="global">
          <template #link>
            <NuxtLink to="/how-it-works">{{ $t('footer.aboutLink') }}</NuxtLink>
          </template>
        </i18n-t>
      </div>

      <!-- Spalte 2: Demo-Zugangscode -->
      <div class="foot-col foot-bypass">
        <h3>{{ $t('footer.bypassHeading') }}</h3>
        <BypassCodeField v-model="code" :state="effectiveState" :error-message="bypassError" @submit="onRedeem" />
      </div>

      <!-- Spalte 3: Projekt -->
      <div class="foot-col foot-project">
        <h3>{{ $t('footer.projectHeading') }}</h3>
        <p>{{ $t('footer.projectText') }}</p>
        <nav class="foot-links" :aria-label="$t('footer.linksAria')">
          <NuxtLink to="/how-it-works">{{ $t('footer.linkHowItWorks') }}</NuxtLink>
          <NuxtLink to="/privacy">{{ $t('footer.linkPrivacy') }}</NuxtLink>
        </nav>
      </div>
    </div>

    <div class="app-footer__bottom">
      <div class="inner">{{ $t('footer.copyright') }}</div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: var(--canvas);
  border-top: 1px solid var(--line);
}
.app-footer__inner {
  max-width: var(--container);
  margin-inline: auto;
  padding: 48px var(--gutter) 28px;
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  gap: 44px;
}
.foot-col h3 {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--subtle);
  margin-bottom: 12px;
}
.foot-col p {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.6;
}
.foot-col :deep(a) {
  color: var(--ink-soft);
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-color: var(--line-strong);
}
.foot-col :deep(a:hover) {
  text-decoration-color: var(--ink);
}

.foot-brand .mark {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: var(--ink);
  display: block;
  margin-bottom: 10px;
  letter-spacing: -0.01em;
}

.foot-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
}
.foot-links :deep(a) {
  font-size: 13px;
}

.app-footer__bottom {
  border-top: 1px solid var(--line-soft);
}
.app-footer__bottom .inner {
  max-width: var(--container);
  margin-inline: auto;
  padding: 16px var(--gutter);
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--subtle);
}

@media (max-width: 959px) {
  .app-footer__inner {
    grid-template-columns: 1fr 1fr;
    gap: 36px 32px;
  }
  .foot-brand {
    grid-column: 1 / -1;
  }
}
@media (max-width: 719px) {
  .app-footer__inner {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
</style>
