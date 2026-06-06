<script setup lang="ts">
// ErrorCard (primitives.md §8 + error-taxonomy.md) – Fehlerkarte für upload_error-
// und analysis_error-Familien. `kind: ErrorKind` (echte 8er-Taxonomie) bestimmt
// Familie: inline (role=status, am Upload) vs Block (role=alert, ersetzt Report).
// Severity doppelt kodiert (Wort im Kopf). 429 → Verweis aufs Footer-Bypass-Feld.
// KEIN roher Stacktrace/LLM-Text – nur kuratierte `details`.
import { computed, onMounted, nextTick, ref } from 'vue'
import Button from '~/components/ui/Button.vue'
import { cn } from '~/lib/utils'

type ErrorKind =
  | 'too_large'
  | 'unsupported_type'
  | 'downscale_failed'
  | 'rate_limited'
  | 'timeout'
  | 'provider_error'
  | 'aborted'
  | 'unknown'

const props = defineProps<{
  kind: ErrorKind
  title: string
  message: string
  primaryAction?: { label: string; event: string }
  secondaryAction?: { label: string; event: string }
  severity?: 'warn' | 'crit'
  details?: string
  rateLimit?: { remaining: number; resetsAt: string }
}>()

const emit = defineEmits<{ action: [event: string] }>()

// upload_error-Familie → inline; alles andere → Block.
const INLINE_KINDS = ['too_large', 'unsupported_type', 'downscale_failed']
const isInline = computed(() => INLINE_KINDS.includes(props.kind))

const DEFAULT_SEV: Record<ErrorKind, 'warn' | 'crit'> = {
  too_large: 'warn',
  unsupported_type: 'warn',
  downscale_failed: 'warn',
  rate_limited: 'warn',
  timeout: 'warn',
  provider_error: 'crit',
  aborted: 'warn',
  unknown: 'crit',
}
const sev = computed(() => props.severity ?? DEFAULT_SEV[props.kind])
const sevWord = computed(() => (sev.value === 'crit' ? 'CRIT' : 'WARN'))

// A11y (primitives.md §8): Die Block-Variante (analysis_error, role=alert) erhält
// beim Auftreten den Fokus, damit Tastatur-Nutzer:innen direkt am Fehler stehen.
// Inline (role=status, am Upload) bleibt ohne Fokus-Sprung.
const cardRef = ref<HTMLElement | null>(null)
onMounted(() => {
  if (!isInline.value) nextTick(() => cardRef.value?.focus())
})
</script>

<template>
  <!-- aborted = stiller Rücksprung (error-taxonomy.md §2.7): keine ErrorCard rendern. -->
  <div
    v-if="kind !== 'aborted'"
    ref="cardRef"
    :tabindex="isInline ? undefined : -1"
    :class="
      cn(
        'rounded border-[1.5px] bg-surface outline-none',
        sev === 'crit' ? 'border-crit' : 'border-warn',
        isInline ? 'mt-4 px-[18px] py-4' : 'p-6',
      )
    "
    :role="isInline ? 'status' : 'alert'"
  >
    <div class="mb-[10px] flex items-center gap-[10px]">
      <span
        class="rounded-tag border border-ink px-[7px] py-[3px] font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.14em]"
        :class="sev === 'crit' ? 'bg-crit text-surface' : 'bg-warn text-ink'"
      >
        {{ sevWord }}
      </span>
      <span class="font-bold text-ink" :class="isInline ? 'text-[15px]' : 'text-[18px] tracking-[-0.01em]'">{{ title }}</span>
    </div>
    <p class="leading-relaxed text-ink-soft" :class="isInline ? 'text-[13px]' : 'max-w-[560px] text-[14px]'">{{ message }}</p>

    <!-- 429: Verweis aufs Bypass-Feld im Footer (kein Code-Feld in der Karte) -->
    <div v-if="kind === 'rate_limited'" class="mt-4 rounded border border-line bg-surface-2 px-4 py-[14px]">
      <h3 class="mb-[6px] font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">Zugangscode</h3>
      <p class="text-[13px] leading-relaxed text-ink-soft">
        Gutachter:innen / Demo: Zugangscode im Footer-Feld eingeben – hebt das Tageslimit für 30 Tage auf.
        <template v-if="rateLimit"><br />Zurückgesetzt: {{ rateLimit.resetsAt }}</template>
      </p>
    </div>

    <!-- Kuratierte technische Angaben (kein roher Stacktrace/LLM-Text) -->
    <details v-if="details" class="err-detail mt-3">
      <summary>Technische Angaben</summary>
      <p class="mt-2 font-mono text-[11px] leading-relaxed text-muted">{{ details }}</p>
    </details>

    <div v-if="primaryAction || secondaryAction" class="mt-[18px] flex flex-wrap gap-[10px]">
      <Button v-if="primaryAction" variant="primary" size="sm" @click="emit('action', primaryAction.event)">
        {{ primaryAction.label }}
      </Button>
      <Button v-if="secondaryAction" variant="secondary" size="sm" @click="emit('action', secondaryAction.event)">
        {{ secondaryAction.label }}
      </Button>
    </div>
  </div>
</template>

<style scoped>
.err-detail > summary {
  list-style: none;
  cursor: pointer;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--muted);
}
.err-detail > summary::-webkit-details-marker {
  display: none;
}
.err-detail > summary:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
  border-radius: 2px;
}
</style>
