<script setup lang="ts">
// TileSelect (primitives.md §3) – Radiogroup als Kachel-Auswahl. Pflicht-Anzeige
// als WORT „Pflicht" (nicht Asterisk). Selected = 1.5px --ink-Border (KEIN
// Links-Streifen). Invalid = --crit-outline um die Gruppe + role=alert-Text.
// API/A11y verbatim aus §3: Prop `label` (als <legend>), Events update:modelValue
// + change, role=radiogroup + aria-labelledby/-required/-describedby, disabled.
import { computed } from 'vue'

interface TileOption {
  value: string
  label: string
  hint?: string
}

const props = withDefaults(
  defineProps<{
    name: string
    label: string
    fieldHelp?: string
    options: TileOption[]
    modelValue?: string | null
    required?: boolean
    columns?: 2 | 4
    invalid?: boolean
    disabled?: boolean
    errorMessage?: string
  }>(),
  { required: true, columns: 4, modelValue: null, invalid: false, disabled: false },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

// Responsive wie Prototyp: 4-spaltig → ab 720px; 2-spaltig ab 561px; mobil 1-spaltig.
const gridClass = computed(() =>
  props.columns === 2
    ? 'grid-cols-1 min-[561px]:grid-cols-2'
    : 'grid-cols-1 min-[561px]:grid-cols-2 min-[720px]:grid-cols-4',
)

const legendId = computed(() => `${props.name}-legend`)
const helpId = computed(() => `${props.name}-help`)
const errorId = computed(() => `${props.name}-error`)
const describedBy = computed(
  () =>
    [props.fieldHelp ? helpId.value : null, props.invalid ? errorId.value : null]
      .filter(Boolean)
      .join(' ') || undefined,
)

function select(value: string) {
  if (props.disabled) return
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<template>
  <fieldset class="border-0 disabled:opacity-50" :disabled="disabled">
    <legend :id="legendId" class="flex items-baseline gap-2 text-[15px] font-semibold text-ink">
      {{ label }}
      <span v-if="required" class="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">{{ $t('components.tileSelect.required') }}</span>
    </legend>
    <p v-if="fieldHelp" :id="helpId" class="mb-3 mt-1 text-[13px] leading-relaxed text-muted">{{ fieldHelp }}</p>

    <div
      class="grid gap-[10px]"
      :class="[gridClass, invalid && 'rounded outline outline-[1.5px] outline-offset-[6px] outline-crit']"
      role="radiogroup"
      :aria-labelledby="legendId"
      :aria-required="required || undefined"
      :aria-describedby="describedBy"
      :aria-invalid="invalid || undefined"
    >
      <div v-for="opt in options" :key="opt.value" class="relative">
        <input
          :id="`${name}-${opt.value}`"
          type="radio"
          class="peer sr-only"
          :name="name"
          :value="opt.value"
          :checked="modelValue === opt.value"
          :disabled="disabled"
          @change="select(opt.value)"
        />
        <label
          :for="`${name}-${opt.value}`"
          class="flex min-h-[64px] cursor-pointer flex-col justify-center gap-[3px] rounded border-[1.5px] border-line bg-surface px-[14px] py-3 transition-[border-color,background-color] duration-[120ms] hover:border-line-strong peer-checked:border-ink peer-checked:bg-canvas peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink peer-disabled:cursor-not-allowed"
        >
          <span class="text-sm font-semibold text-ink">{{ opt.label }}</span>
          <span v-if="opt.hint" class="text-[12px] leading-snug text-muted">{{ opt.hint }}</span>
        </label>
      </div>
    </div>

    <p v-if="invalid" :id="errorId" role="alert" class="mt-[10px] text-[12.5px] text-crit-ink">
      {{ errorMessage ?? 'Bitte triff eine Auswahl.' }}
    </p>
  </fieldset>
</template>
