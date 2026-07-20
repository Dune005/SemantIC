<script setup lang="ts">
// WaitState (primitives.md §7) – Wartezustand während des Pipeline-Calls.
// dimension-reveal: drei Dim-Kacheln mit gestaffeltem, ruhigem Sheen-Skeleton auf
// FESTER Timeline (als „visualisiert die Prüfdimensionen" gerahmt). EHRLICHE Copy:
// KEIN Fake-Fortschrittsbalken, KEINE Backend-Phasen. reduced-motion → statisch.
// (calm-skeleton-Variante + zeitbasierte Props bewusst noch nicht – v2.)
// Dim-Namen aus i18n (common.dimensions), computed -> folgt dem Sprachwechsel ohne Reload.
const { t } = useI18n()
const dims = computed(() => [
  t('common.dimensions.physics'),
  t('common.dimensions.semantics'),
  t('common.dimensions.bias'),
])
</script>

<template>
  <div class="wait" role="status" aria-live="polite" aria-busy="true">
    <h2 class="text-[19px] font-bold tracking-[-0.01em]">{{ $t('components.waitState.title') }}</h2>
    <p class="mx-auto mt-2 max-w-[480px] text-[13px] leading-relaxed text-muted">
      {{ $t('components.waitState.lead') }}
    </p>
    <div class="wait__dims mt-7 grid grid-cols-3 gap-3">
      <div v-for="d in dims" :key="d" class="wait__dim">
        <span class="name">{{ d }}</span>
        <span class="wait__skel" aria-hidden="true" />
      </div>
    </div>
    <p class="mt-[22px] font-mono text-[11px] tracking-[0.06em] text-subtle">
      {{ $t('components.waitState.note') }}
    </p>
  </div>
</template>

<style scoped>
.wait {
  text-align: center;
  padding: 30px 16px 36px;
}
.wait__dim {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 22px 12px;
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--canvas);
}
.wait__dim .name {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
}
.wait__skel {
  position: relative;
  width: 100%;
  height: 8px;
  border-radius: 2px;
  background: var(--surface-2);
  overflow: hidden;
}
/* zeitbasiertes ruhiges Aufdecken (fester Loop, KEINE Fortschrittssuggestion) */
.wait__skel::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, var(--line-strong), transparent);
  animation: sheen 1.8s ease-in-out infinite;
}
.wait__dim:nth-child(2) .wait__skel::after {
  animation-delay: 0.3s;
}
.wait__dim:nth-child(3) .wait__skel::after {
  animation-delay: 0.6s;
}
@keyframes sheen {
  to {
    transform: translateX(100%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .wait__skel::after {
    animation: none;
    display: none;
  }
}
</style>
