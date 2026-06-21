<script setup lang="ts">
// BypassCodeField (primitives.md §10.1 + footer.html) – Demo-Zugangscode im Footer.
// REINES UI + Event: kein Redeem / kein HMAC / kein Request hier (das ist Etappe 6,
// Server-Middleware). Das Feld meldet `submit` mit dem Code; der Parent (AppFooter)
// reicht ihn als `redeemBypass` weiter. Status doppelt kodiert (Farbe UND Wort).
import { computed, useId } from 'vue'
import Button from '~/components/ui/Button.vue'

// Eindeutige IDs → Komponente ist mehrfach-instanziierbar (Playground, künftige Seiten).
const uid = useId()
const codeId = `bypass-code-${uid}`
const hintId = `bypass-hint-${uid}`
const statusId = `bypass-status-${uid}`

const props = withDefaults(
  defineProps<{
    modelValue: string
    state?: 'idle' | 'submitting' | 'success' | 'error'
    errorMessage?: string | null
  }>(),
  { state: 'idle', errorMessage: null },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
}>()

const isSubmitting = computed(() => props.state === 'submitting')
const isSuccess = computed(() => props.state === 'success')
const isError = computed(() => props.state === 'error')

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
function onSubmit() {
  if (isSubmitting.value || !props.modelValue.trim()) return
  emit('submit')
}
</script>

<template>
  <form class="bypass" novalidate @submit.prevent="onSubmit">
    <!-- Nach erfolgreichem Einlösen ist die ganze Eingabe-Gruppe funktionslos →
         sie weicht der ruhigen Bestätigung (primitives.md §10.1). Label/Input/Hint
         verschwinden gemeinsam, damit kein <label for> ohne Ziel-Input bleibt. -->
    <template v-if="!isSuccess">
      <label class="bypass__label" :for="codeId">{{ $t('bypass.label') }}</label>
      <p :id="hintId" class="bypass__hint">{{ $t('bypass.hint') }}</p>
      <div class="bypass__row">
        <input
          :id="codeId"
          class="bypass__input"
          :class="{ 'bypass__input--error': isError }"
          :value="modelValue"
          type="text"
          inputmode="text"
          autocomplete="off"
          spellcheck="false"
          :placeholder="$t('bypass.placeholder')"
          :disabled="isSubmitting"
          :aria-invalid="isError || undefined"
          :aria-describedby="`${hintId} ${statusId}`"
          @input="onInput"
        />
        <Button type="submit" variant="secondary" size="sm" :loading="isSubmitting" class="shrink-0">
          {{ $t('bypass.submit') }}
        </Button>
      </div>
    </template>

    <!-- Status-Zeile: doppelt kodiert (Farbe + Wort), aria-live für Screenreader. -->
    <div :id="statusId" class="bypass__status" role="status" aria-live="polite">
      <span v-if="isSuccess" class="bypass__ok">{{ $t('bypass.success') }}</span>
      <span v-else-if="isError" class="bypass__err">
        {{ errorMessage || $t('bypass.error') }}
      </span>
    </div>
  </form>
</template>

<style scoped>
.bypass__label {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 500;
  font-size: 13px;
  color: var(--ink);
  display: block;
  margin-bottom: 4px;
}
.bypass__hint {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.55;
  margin-bottom: 12px;
}
.bypass__row {
  display: flex;
  gap: 8px;
  max-width: 320px;
}
.bypass__input {
  flex: 1 1 auto;
  min-width: 0;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 13px;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r);
  padding: 9px 11px;
  line-height: 1;
}
.bypass__input::placeholder {
  color: var(--subtle);
}
.bypass__input:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 1px;
  border-color: var(--ink);
}
.bypass__input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
/* Fehlerzustand: dezente crit-Border (zweite Codierung neben dem Wort). */
.bypass__input--error {
  border-color: var(--crit);
}
.bypass__status {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 12px;
  line-height: 1.5;
  margin-top: 10px;
  max-width: 320px;
}
.bypass__ok {
  color: var(--safe-ink);
}
.bypass__err {
  color: var(--crit-ink);
}
@media (max-width: 719px) {
  .bypass__row {
    max-width: none;
  }
}
</style>
