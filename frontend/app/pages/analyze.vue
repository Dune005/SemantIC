<script setup lang="ts">
// /analyze (analyze-input-spec.md + analyze-report-spec.md · microcopy.md · errors.md) –
// Tool-Seite mit clientseitiger Zustandsmaschine. Header/Footer/Skip-Link liefert das
// default-Layout; diese Seite liefert nur den Inhalt (kein eigenes <main>).
//
// ETAPPE 6 (Naht geschlossen): Upload → Canvas-Downscaling (prepareImage) → echter
// $fetch.raw('/api/analyze', {signal}) → buildAnalysisViewModel(raw, submittedUsageForm)
// → DiagnoseCockpit. usage_form bleibt frontend-only (nie im API-Body). Fehler werden über
// mapFetchError(HTTP-Status → ErrorKind) abgebildet; rateLimitHint/bypassActive kommen
// aus den Response-Headern in den geteilten Chrome-State (useState).
import { ref, computed, onBeforeUnmount, onMounted } from 'vue'
import Button from '~/components/ui/Button.vue'
import TileSelect from '~/components/ui/TileSelect.vue'
import WaitState from '~/components/analyze/WaitState.vue'
import ErrorCard from '~/components/analyze/ErrorCard.vue'
import DiagnoseCockpit from '~/components/analyze/DiagnoseCockpit.vue'
import ReportPrintView from '~/components/analyze/ReportPrintView.vue'
import type { AnalysisViewModel, UsageForm } from '~/types/analysis'
import { buildAnalysisViewModel } from '~/composables/useAnalysisView'
import type { SemanticAnalysisResult } from '@pipeline/analyze'
import type { QuotaResponse } from '~~/server/api/quota.get'

// i18n (Seitentext-Migration): Tool-Shell aus pages.analyze.*. Der Analyse-Report
// (DiagnoseCockpit/ReportPrintView) bleibt einem separaten Plan vorbehalten.
const { t } = useI18n()
useHead({ title: () => t('seo.analyze.title') })

type StageState =
  | 'empty'
  | 'validating'
  | 'collecting'
  | 'analyzing'
  | 'result'
  | 'upload_error'
  | 'analysis_error'

type ErrorKind =
  | 'too_large'
  | 'unsupported_type'
  | 'downscale_failed'
  | 'rate_limited'
  | 'timeout'
  | 'provider_error'
  | 'unknown'

// TileSelect-Optionen (Reihenfolge bindend). value/Reihenfolge literal, Text aus i18n
// (pages.analyze.intent/usage.options.*) -> computed, folgt dem Sprachwechsel.
const INTENT_VALUES = ['unspecified', 'affirmative', 'critical', 'illustrative'] as const
const USAGE_VALUES = ['header', 'mood', 'symbol', 'illustration', 'social', 'advertising', 'editorial'] as const
const INTENT_OPTIONS = computed(() =>
  INTENT_VALUES.map((value) => ({
    value,
    label: t(`pages.analyze.intent.options.${value}.label`),
    hint: t(`pages.analyze.intent.options.${value}.hint`),
  })),
)
const USAGE_OPTIONS = computed(() =>
  USAGE_VALUES.map((value) => ({
    value,
    label: t(`pages.analyze.usage.options.${value}.label`),
    hint: t(`pages.analyze.usage.options.${value}.hint`),
  })),
)

// Fehler-Presets. severity: warn (Limit/Timeout/Upload) bzw. crit (Provider/Unknown).
// Aktionen als Event-Strings (ErrorCard emit `action`). Titel/Message/Action-Labels aus
// i18n (pages.analyze.errors/actions.*) -> computed. Die 429-rateLimit-Daten liegen in
// einem eigenen Ref (rateLimitInfo), damit die Mutation in mapFetchError reaktiv bleibt.
type ErrorPreset = {
  title: string
  message: string
  severity: 'warn' | 'crit'
  primaryAction?: { label: string; event: string }
  secondaryAction?: { label: string; event: string }
  rateLimit?: { remaining: number; resetsAt: string }
}
const rateLimitInfo = ref<{ remaining: number; resetsAt: string }>({
  remaining: 0,
  resetsAt: '31.05.2026, 09:14 Uhr',
})
const ERROR_PRESETS = computed<Record<ErrorKind, ErrorPreset>>(() => {
  const chooseOther = { label: t('pages.analyze.actions.chooseOther'), event: 'reset' }
  const retry = { label: t('pages.analyze.actions.retry'), event: 'retry' }
  const newImage = { label: t('pages.analyze.actions.newImage'), event: 'reset' }
  const err = (kind: ErrorKind) => ({
    title: t(`pages.analyze.errors.${kind}.title`),
    message: t(`pages.analyze.errors.${kind}.message`),
  })
  return {
    unsupported_type: { ...err('unsupported_type'), severity: 'warn', primaryAction: chooseOther },
    too_large: { ...err('too_large'), severity: 'warn', primaryAction: chooseOther },
    downscale_failed: { ...err('downscale_failed'), severity: 'warn', primaryAction: chooseOther },
    rate_limited: {
      ...err('rate_limited'),
      severity: 'warn',
      primaryAction: { label: t('pages.analyze.actions.enterCode'), event: 'focusBypass' },
      secondaryAction: { label: t('pages.analyze.actions.understood'), event: 'dismiss' },
      rateLimit: rateLimitInfo.value,
    },
    timeout: { ...err('timeout'), severity: 'warn', primaryAction: retry, secondaryAction: newImage },
    provider_error: { ...err('provider_error'), severity: 'crit', primaryAction: retry, secondaryAction: newImage },
    unknown: { ...err('unknown'), severity: 'crit', primaryAction: retry, secondaryAction: newImage },
  }
})

// --- Zustand ---------------------------------------------------------------
const state = ref<StageState>('empty')
const errorKind = ref<ErrorKind>('timeout')

// Eingaben
const declaredIntent = ref<string | null>(null)
const usageForm = ref<string | null>(null)
const contextText = ref('')
const promptText = ref('')
const triedSubmit = ref(false)

// Bild
const imageUrl = ref<string | null>(null)
const fileName = ref('')
const fileMeta = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const dragDepth = ref(0)
const isDragover = computed(() => dragDepth.value > 0)

// usage_form-Freeze (frontend-only, nie im API-Body) + Ergebnis-ViewModel
const submittedUsageForm = ref<UsageForm | null>(null)
const resultVm = ref<AnalysisViewModel | null>(null)

// Eingefrorener Submit-State fuer die Druckansicht (report-print.md §2/§5):
// Kontext/Prompt sind frontend-only (nicht im Pipeline-JSON) und werden der
// ReportPrintView separat gereicht; generatedAt = Client-Datum des Befunds.
const submittedContext = ref<string | null>(null)
const submittedPrompt = ref<string | null>(null)
const generatedAt = ref<string | null>(null)

// Fuer den API-Call vorbereitete Bilddaten: reines Base64 (ohne data:-Prefix) +
// Magic-Byte-tauglicher mediaType. Getrennt von imageUrl (DataURL-Vorschau).
const apiImageBase64 = ref<string | null>(null)
const apiMediaType = ref<string | null>(null)

// Chrome-State (Header/Footer im Layout) ueber die Layout<->Page-Grenze teilen.
const rateLimitHint = useState<string | null>('chrome:rateLimitHint', () => null)
const bypassActive = useState<boolean>('chrome:bypassActive', () => false)

// Tageslimit-Stand schon beim Oeffnen der Seite zeigen. Client-only: der Stand
// haengt an der IP und darf nicht ins SSR-Caching geraten. Fehler bleiben still –
// die Anzeige ist eine Zusatzinfo, kein Teil des Analyse-Flows.
onMounted(async () => {
  try {
    const quota = await $fetch<QuotaResponse>('/api/quota')
    if (quota.state === 'bypass') {
      bypassActive.value = true
      return
    }
    if (quota.state === 'ok' && quota.remaining != null && quota.limit != null) {
      rateLimitHint.value = t('pages.analyze.quota.remaining', { n: quota.remaining, total: quota.limit })
    }
  } catch {
    // Anzeige bleibt leer – exakt der Zustand vor diesem Feature.
  }
})

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
// Client-Downscale (error-taxonomy.md §0). Base64-Ziel bewusst < Server-Limit (4.5 MB).
const MAX_UPLOAD_BYTES = 3_500_000
const DOWNSCALE_MAX_EDGE = 2000
const CLIENT_BASE64_BUDGET = 4_000_000
const QUALITY_STEPS = [0.85, 0.7, 0.55, 0.4]

// --- Abgeleitet ------------------------------------------------------------
const canSubmit = computed(() => !!declaredIntent.value && !!usageForm.value)
const submitHint = computed(() => {
  if (canSubmit.value) return t('pages.analyze.submit.hintReady')
  if (!declaredIntent.value && !usageForm.value) return t('pages.analyze.submit.hintBoth')
  if (!declaredIntent.value) return t('pages.analyze.intent.error')
  return t('pages.analyze.usage.error')
})
const intentInvalid = computed(() => triedSubmit.value && !declaredIntent.value)
const usageInvalid = computed(() => triedSubmit.value && !usageForm.value)
const errorPreset = computed(() => ERROR_PRESETS.value[errorKind.value])

// Schritt-Indikator (Mono-Strip): upload · angaben · analyse · befund
const activeStep = computed<'upload' | 'angaben' | 'analyse' | 'befund'>(() => {
  if (state.value === 'collecting') return 'angaben'
  if (state.value === 'analyzing' || state.value === 'analysis_error') return 'analyse'
  if (state.value === 'result') return 'befund'
  return 'upload'
})

// --- Upload ----------------------------------------------------------------
function triggerPick() {
  fileInputRef.value?.click()
}
function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) void handleFile(file)
}
// Drag-Tiefenzähler: dragenter/dragleave feuern auch beim Wechsel über Kind-Elemente
// der Dropzone – der Zähler verhindert das Flackern (is-dragover bleibt, solange Tiefe > 0).
function onDragEnter() {
  dragDepth.value++
}
function onDragLeave() {
  if (dragDepth.value > 0) dragDepth.value--
}
function onDrop(event: DragEvent) {
  dragDepth.value = 0
  const file = event.dataTransfer?.files?.[0]
  if (file) void handleFile(file)
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('downscale_failed'))
    reader.readAsDataURL(file)
  })
}
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('downscale_failed'))
    img.src = src
  })
}

// Bild fuer den API-Call vorbereiten (Etappe 6): ggf. per Canvas verkleinern, bis
// das Base64 unter dem Budget liegt. Wirft Error('too_large' | 'downscale_failed').
// Liefert reines Base64 (ohne data:-Prefix) + mediaType + DataURL-Vorschau + Masse.
async function prepareImage(file: File): Promise<{
  base64: string; mediaType: string; previewUrl: string; width: number; height: number
}> {
  const originalUrl = await fileToDataUrl(file)
  const img = await loadImage(originalUrl)
  const w = img.naturalWidth
  const h = img.naturalHeight

  // Original passt direkt (klein genug + Kante im Limit): kein Re-Encode.
  if (file.size <= MAX_UPLOAD_BYTES && Math.max(w, h) <= DOWNSCALE_MAX_EDGE) {
    return {
      base64: originalUrl.slice(originalUrl.indexOf(',') + 1),
      mediaType: file.type,
      previewUrl: originalUrl,
      width: w,
      height: h,
    }
  }

  // Verkleinern: lange Kante auf DOWNSCALE_MAX_EDGE, dann Qualitaet schrittweise senken.
  const scale = Math.min(1, DOWNSCALE_MAX_EDGE / Math.max(w, h))
  const cw = Math.max(1, Math.round(w * scale))
  const ch = Math.max(1, Math.round(h * scale))
  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('downscale_failed')
  ctx.drawImage(img, 0, 0, cw, ch)

  for (const quality of QUALITY_STEPS) {
    let encoded: string
    try {
      encoded = canvas.toDataURL('image/jpeg', quality)
    } catch {
      throw new Error('downscale_failed')
    }
    const base64 = encoded.slice(encoded.indexOf(',') + 1)
    if (base64.length <= CLIENT_BASE64_BUDGET) {
      return { base64, mediaType: 'image/jpeg', previewUrl: encoded, width: w, height: h }
    }
  }
  throw new Error('too_large')
}

async function handleFile(file: File) {
  if (!ACCEPTED.includes(file.type)) {
    errorKind.value = 'unsupported_type'
    state.value = 'upload_error'
    return
  }
  state.value = 'validating'
  try {
    const prepared = await prepareImage(file)
    apiImageBase64.value = prepared.base64
    apiMediaType.value = prepared.mediaType
    imageUrl.value = prepared.previewUrl
    fileName.value = file.name
    const sizeMb = (file.size / 1024 / 1024).toFixed(1)
    const typeLabel = (file.type.split('/')[1] || '').toUpperCase()
    fileMeta.value = `${prepared.width} × ${prepared.height} px · ${sizeMb} MB · ${typeLabel}`
    state.value = 'collecting'
  } catch (e) {
    const msg = e instanceof Error ? e.message : ''
    errorKind.value = msg === 'too_large' ? 'too_large' : 'downscale_failed'
    state.value = 'upload_error'
  }
}

// --- Analyse (echter Pipeline-Call: $fetch /api/analyze) ------------------
let timeoutId: ReturnType<typeof setTimeout> | null = null
let abortController: AbortController | null = null

function onSubmit() {
  if (!canSubmit.value) {
    triedSubmit.value = true
    return
  }
  // usage_form einfrieren (frontend-only, nie im API-Body). Wird als 2. Arg an
  // buildAnalysisViewModel gereicht. Cast begründet: usageForm enthält ausschliesslich
  // gültige UsageForm-Werte (USAGE_OPTIONS).
  submittedUsageForm.value = usageForm.value as UsageForm
  void runAnalysis()
}

// Echter Pipeline-Call: Bild-Base64 → /api/analyze → buildAnalysisViewModel → DiagnoseCockpit.
// usage_form geht NICHT in den Body (nur als 2. Arg an den Composable).
async function runAnalysis() {
  if (!apiImageBase64.value) {
    errorKind.value = 'unknown'
    state.value = 'analysis_error'
    return
  }
  state.value = 'analyzing'
  abortController?.abort()
  abortController = new AbortController()
  const signal = abortController.signal
  // UI-Timeout 45 s (error-taxonomy §2.5): bricht den Call ab → timeout-Fehler.
  let timedOut = false
  timeoutId = setTimeout(() => {
    timedOut = true
    abortController?.abort()
  }, 45_000)

  try {
    const res = await $fetch.raw<SemanticAnalysisResult>('/api/analyze', {
      method: 'POST',
      body: {
        imageBase64: apiImageBase64.value,
        mediaType: apiMediaType.value ?? undefined,
        prompt: promptText.value || undefined,
        context: contextText.value || undefined,
        declaredIntent: declaredIntent.value ?? undefined,
      },
      signal,
    })
    if (signal.aborted) return
    // rateLimitHint + bypassActive aus den Response-Headern (Spec §6.6).
    // Das Tageslimit kommt aus dem Header, nicht als Literal – sonst laeuft die
    // Anzeige beim naechsten Limit-Wechsel wieder aus dem Server-Wert heraus.
    const remaining = res.headers.get('x-ratelimit-remaining')
    if (remaining != null) {
      const n = Number(remaining)
      const total = Number(res.headers.get('x-ratelimit-limit'))
      rateLimitHint.value = Number.isFinite(n)
        ? Number.isFinite(total)
          ? t('pages.analyze.quota.remaining', { n, total })
          : t('pages.analyze.quota.remainingNoTotal', { n })
        : null
    }
    if (res.headers.get('x-ratelimit-bypass') === '1') bypassActive.value = true

    const raw = res._data
    if (!raw) {
      errorKind.value = 'provider_error'
      state.value = 'analysis_error'
      return
    }
    resultVm.value = buildAnalysisViewModel(raw, submittedUsageForm.value ?? undefined)
    // Submit-State fuer die Druckansicht festhalten (was tatsaechlich gesendet wurde).
    submittedContext.value = contextText.value || null
    submittedPrompt.value = promptText.value || null
    generatedAt.value = new Date().toLocaleString('de-CH')
    state.value = 'result'
  } catch (err) {
    // User-Abbruch (kein Timeout) → stiller Rücksprung (error-taxonomy §2.7, kein Fehler).
    if (signal.aborted && !timedOut) return
    errorKind.value = mapFetchError(err, timedOut)
    state.value = 'analysis_error'
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }
}

// HTTP-Status → ErrorKind (error-taxonomy.md §1).
function mapFetchError(err: unknown, timedOut: boolean): ErrorKind {
  if (timedOut) return 'timeout'
  const e = err as {
    statusCode?: number
    status?: number
    data?: { data?: { resetsAt?: number; remaining?: number } }
  }
  const status = e?.statusCode ?? e?.status
  if (status === 429) {
    // ofetch legt den ganzen Response-Body auf error.data; createError schachtelt
    // die Nutzdaten unter body.data → also error.data.data (Codex-Review B).
    const rl = e?.data?.data
    if (rl?.resetsAt) {
      rateLimitInfo.value = {
        remaining: rl.remaining ?? 0,
        resetsAt: new Date(rl.resetsAt).toLocaleString('de-CH'),
      }
    }
    return 'rate_limited'
  }
  if (status === 413) return 'too_large'
  if (status === 415) return 'unsupported_type'
  if (status === 504) return 'timeout'
  if (status != null && status >= 400) return 'provider_error'
  return 'unknown'
}
function abortAnalysis() {
  // Stiller Rücksprung (TASKS D2): kein Error, kein hängender Call.
  abortController?.abort()
  abortController = null
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
}
onBeforeUnmount(abortAnalysis)

// --- Aktionen --------------------------------------------------------------
function removeImage() {
  fullReset()
}
function fullReset() {
  abortAnalysis()
  state.value = 'empty'
  declaredIntent.value = null
  usageForm.value = null
  contextText.value = ''
  promptText.value = ''
  triedSubmit.value = false
  imageUrl.value = null
  fileName.value = ''
  fileMeta.value = ''
  apiImageBase64.value = null
  apiMediaType.value = null
  submittedUsageForm.value = null
  submittedContext.value = null
  submittedPrompt.value = null
  generatedAt.value = null
  resultVm.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}
function cancelAnalysis() {
  // „Bild entfernen während analyzing" → stiller Rücksprung nach empty (TASKS D2).
  fullReset()
}
function onErrorAction(event: string) {
  if (event === 'reset') fullReset()
  else if (event === 'retry') void runAnalysis()
  else if (event === 'dismiss') state.value = 'collecting'
  else if (event === 'focusBypass') {
    // error-taxonomy §3: ErrorCard schliesst → zurück zu collecting (Eingaben bleiben),
    // dann Footer-Bypass-Feld fokussieren.
    state.value = 'collecting'
    focusFooterBypass()
  }
}
function focusFooterBypass() {
  // Footer-Bypass liegt im Layout (AppFooter); die Redeem-Logik hängt dort. Hier nur
  // scrollen + fokussieren (ID dynamisch via useId → Attribut-Selektor).
  const field = document.querySelector<HTMLInputElement>('.app-footer input[id^="bypass-code"]')
  if (field) {
    // reduced-motion respektieren: smooth ist JS-Motion, vom CSS-Guard nicht erfasst (Etappe 7).
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    field.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    field.focus({ preventScroll: true })
  }
}

// „Als PDF exportieren" → Browser-Druckdialog (report-print.md: window.print(),
// kein jsPDF/html2canvas). Die ReportPrintView ist nur im @media print sichtbar.
// document.title wird temporär gesetzt, damit das gespeicherte PDF einen
// sprechenden Dateinamen erhält; afterprint stellt den Tab-Titel zurück
// (feuert auch bei abgebrochenem Druckdialog). Restore ist idempotent und
// läuft bei einem print()-Fehler sofort.
let printTitleActive = false
function exportPdf() {
  if (printTitleActive) {
    window.print()
    return
  }
  const previousTitle = document.title
  const restoreTitle = () => {
    document.title = previousTitle
    printTitleActive = false
  }
  const now = new Date()
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')
  printTitleActive = true
  document.title = `SemantIC-Pruefbefund_${stamp}`
  window.addEventListener('afterprint', restoreTitle, { once: true })
  try {
    window.print()
  } catch {
    window.removeEventListener('afterprint', restoreTitle)
    restoreTitle()
  }
}
</script>

<template>
  <!-- Kein sichtbarer Seitenkopf mehr: Kicker/H1/Lead doppelten Stage-Strip und
       Dropzone-Titel (Nutzer-Feedback). Die h1 bleibt für A11y/Struktur unsichtbar. -->
  <h1 v-if="state !== 'result'" class="sr-only">{{ $t('pages.analyze.h1') }}</h1>

  <!-- TOOL-STAGE (schmale Eingabe-Karte; Result rendert ausserhalb als volles Cockpit) -->
  <section v-if="state !== 'result'" class="stage" :data-state="state" :aria-label="$t('pages.analyze.stageAria')">
    <div class="stage__strip" aria-hidden="true">
      <span>SEMANTIC · INPUT</span>
      <span>
        <span class="step" :class="{ 'is-active': activeStep === 'upload' }">{{ $t('pages.analyze.steps.upload') }}</span>
        ·
        <span class="step" :class="{ 'is-active': activeStep === 'angaben' }">{{ $t('pages.analyze.steps.input') }}</span>
        ·
        <span class="step" :class="{ 'is-active': activeStep === 'analyse' }">{{ $t('pages.analyze.steps.analysis') }}</span>
        ·
        <span class="step" :class="{ 'is-active': activeStep === 'befund' }">{{ $t('pages.analyze.steps.finding') }}</span>
      </span>
    </div>

    <div class="stage__body">
      <!-- EMPTY + UPLOAD_ERROR teilen die Dropzone -->
      <div v-if="state === 'empty' || state === 'upload_error'">
        <div class="dz-head">
          <h2>{{ $t('pages.analyze.upload.heading') }}</h2>
          <p class="help">{{ $t('pages.analyze.upload.help') }}</p>
        </div>

        <div
          class="dropzone"
          :class="{ 'is-dragover': isDragover }"
          tabindex="0"
          role="button"
          :aria-label="$t('pages.analyze.upload.dropzoneAria')"
          @click="triggerPick"
          @keydown.enter.prevent="triggerPick"
          @keydown.space.prevent="triggerPick"
          @dragenter.prevent="onDragEnter"
          @dragover.prevent
          @dragleave.prevent="onDragLeave"
          @drop.prevent="onDrop"
        >
          <div class="dz-default">
            <svg class="dropzone__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M12 16V4m0 0L7 9m5-5 5 5" />
              <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
            <span class="dropzone__primary">{{ $t('pages.analyze.upload.dropPrimary') }}</span>
            <span class="dropzone__or">{{ $t('pages.analyze.upload.or') }}</span>
            <Button variant="secondary" size="sm" class="self-center" @click.stop="triggerPick">{{ $t('pages.analyze.upload.pick') }}</Button>
            <p class="dropzone__formats">{{ $t('pages.analyze.upload.formats') }}</p>
          </div>
          <div class="dz-dragmsg" aria-hidden="true">{{ $t('pages.analyze.upload.dragMsg') }}</div>
        </div>
        <input ref="fileInputRef" type="file" accept="image/jpeg,image/png,image/webp" hidden @change="onFileChange" />

        <!-- Inline-Fehler (role=status) an die Dropzone gebunden -->
        <ErrorCard
          v-if="state === 'upload_error'"
          class="mt-4"
          :kind="errorKind"
          :title="errorPreset.title"
          :message="errorPreset.message"
          :severity="errorPreset.severity"
          :primary-action="errorPreset.primaryAction"
          @action="onErrorAction"
        />
      </div>

      <!-- VALIDATING -->
      <div v-else-if="state === 'validating'" class="validating" role="status" aria-live="polite">
        <div class="spinner" aria-hidden="true" />
        <h2>{{ $t('pages.analyze.validating.heading') }}</h2>
        <p class="help">{{ $t('pages.analyze.validating.help') }}</p>
      </div>

      <!-- COLLECTING -->
      <div v-else-if="state === 'collecting'">
        <div class="preview">
          <div class="preview__imgwrap">
            <img v-if="imageUrl" :src="imageUrl" :alt="$t('pages.analyze.preview.alt')" class="preview__img" />
            <div v-else class="ph-hatch" :aria-label="$t('pages.analyze.preview.placeholderAria')"><span>{{ $t('pages.analyze.preview.placeholderLabel') }}</span></div>
          </div>
          <div class="preview__meta">
            <span class="preview__label">{{ $t('pages.analyze.preview.label') }}</span>
            <span class="preview__name">{{ fileName }}</span>
            <span class="preview__dims">{{ fileMeta }}</span>
            <div class="preview__actions">
              <Button variant="secondary" size="sm" @click="removeImage">{{ $t('pages.analyze.preview.remove') }}</Button>
            </div>
          </div>
        </div>

        <form class="collect-block" novalidate @submit.prevent="onSubmit">
          <div class="collect-block__head">
            <p class="section-kicker">{{ $t('pages.analyze.collect.kicker') }}</p>
            <h2>{{ $t('pages.analyze.collect.heading') }}</h2>
            <p class="help lead">{{ $t('pages.analyze.collect.lead') }}</p>
          </div>

          <TileSelect
            v-model="declaredIntent"
            name="intent"
            :label="$t('pages.analyze.intent.label')"
            :field-help="$t('pages.analyze.intent.help')"
            :options="INTENT_OPTIONS"
            :columns="2"
            :invalid="intentInvalid"
            :error-message="$t('pages.analyze.intent.error')"
            class="mt-6"
          />

          <TileSelect
            v-model="usageForm"
            name="usageForm"
            :label="$t('pages.analyze.usage.label')"
            :field-help="$t('pages.analyze.usage.help')"
            :options="USAGE_OPTIONS"
            :columns="4"
            :invalid="usageInvalid"
            :error-message="$t('pages.analyze.usage.error')"
            class="mt-6"
          />

          <div class="optionals">
            <details class="opt" open>
              <summary>
                <svg class="opt__chev" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 4l4 4-4 4" /></svg>
                {{ $t('pages.analyze.contextField.summary') }}
                <span class="mono-note ml-auto">{{ $t('pages.analyze.contextField.optional') }}</span>
              </summary>
              <div class="opt__body">
                <label class="opt__field-lab" for="ctxField">{{ $t('pages.analyze.contextField.label') }}</label>
                <p class="opt__field-help">{{ $t('pages.analyze.contextField.help') }}</p>
                <textarea
                  id="ctxField"
                  v-model="contextText"
                  class="field"
                  maxlength="2000"
                  :placeholder="$t('pages.analyze.contextField.placeholder')"
                />
                <span class="charcount">{{ contextText.length }} / 2000</span>
                <p v-if="!contextText" class="opt__emptyhint">{{ $t('pages.analyze.contextField.emptyHint') }}</p>
              </div>
            </details>

            <details class="opt">
              <summary>
                <svg class="opt__chev" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 4l4 4-4 4" /></svg>
                {{ $t('pages.analyze.promptField.summary') }}
                <span class="mono-note ml-auto">{{ $t('pages.analyze.contextField.optional') }}</span>
              </summary>
              <div class="opt__body">
                <label class="opt__field-lab" for="promptField">{{ $t('pages.analyze.promptField.label') }}</label>
                <p class="opt__field-help">{{ $t('pages.analyze.promptField.help') }}</p>
                <textarea
                  id="promptField"
                  v-model="promptText"
                  class="field"
                  maxlength="2000"
                  :placeholder="$t('pages.analyze.promptField.placeholder')"
                />
                <span class="charcount">{{ promptText.length }} / 2000</span>
              </div>
            </details>
          </div>

          <div class="submit-bar">
            <div class="submit-bar__row">
              <Button type="submit" variant="primary" :disabled="!canSubmit">{{ $t('pages.analyze.submit.start') }}</Button>
              <p class="submit-hint" :class="{ 'submit-hint--blocked': !canSubmit }">{{ submitHint }}</p>
            </div>
          </div>
        </form>
      </div>

      <!-- ANALYZING -->
      <div v-else-if="state === 'analyzing'">
        <WaitState />
        <div class="cancel-row">
          <Button variant="ghost" size="sm" @click="cancelAnalysis">{{ $t('pages.analyze.analyzing.cancel') }}</Button>
        </div>
      </div>

      <!-- ANALYSIS_ERROR (Block, role=alert) -->
      <ErrorCard
        v-else-if="state === 'analysis_error'"
        :kind="errorKind"
        :title="errorPreset.title"
        :message="errorPreset.message"
        :severity="errorPreset.severity"
        :primary-action="errorPreset.primaryAction"
        :secondary-action="errorPreset.secondaryAction"
        :rate-limit="errorPreset.rateLimit"
        @action="onErrorAction"
      />

    </div>
  </section>

  <!-- Einordnungs-Hinweise: was die Prüfung leistet – und was nicht. Bewusst vor
       dem Absenden sichtbar (nur Input-Zustände, im Result übernimmt das Cockpit). -->
  <aside v-if="state !== 'result'" class="caveats" aria-labelledby="caveats-title">
    <p id="caveats-title" class="caveats__kicker">{{ $t('pages.analyze.caveats.kicker') }}</p>
    <div class="caveats__grid">
      <div class="caveats__item">
        <h2>{{ $t('pages.analyze.caveats.items.0.title') }}</h2>
        <p>{{ $t('pages.analyze.caveats.items.0.body') }}</p>
      </div>
      <div class="caveats__item">
        <h2>{{ $t('pages.analyze.caveats.items.1.title') }}</h2>
        <p>{{ $t('pages.analyze.caveats.items.1.body') }}</p>
      </div>
      <div class="caveats__item">
        <h2>{{ $t('pages.analyze.caveats.items.2.title') }}</h2>
        <p>{{ $t('pages.analyze.caveats.items.2.body') }}</p>
      </div>
      <div class="caveats__item">
        <h2>{{ $t('pages.analyze.caveats.items.3.title') }}</h2>
        <p>{{ $t('pages.analyze.caveats.items.3.body') }}</p>
      </div>
    </div>
  </aside>

  <!-- RESULT: Diagnose-Cockpit voll breit, AUSSERHALB der schmalen .stage-Karte (E5-Swap).
       BefundKarte.vue bleibt als Fallback-Datei im Repo – Rückkehr = diesen Zweig wieder mit
       <BefundKarte :vm="resultVm" :image-url="imageUrl" :submitted-usage-form="submittedUsageForm"
       sample-id="SEMANTIC" image-aspect="4:5" /> rendern (Import zurückholen). -->
  <div v-if="state === 'result' && resultVm" class="result-stage">
    <DiagnoseCockpit
      :vm="resultVm"
      :image-url="imageUrl"
      :submitted-usage-form="submittedUsageForm"
      :submitted-context="submittedContext"
      :submitted-prompt="submittedPrompt"
      :timestamp="generatedAt ?? undefined"
      sample-id="SEMANTIC"
    />
    <div class="result-actions result-actions--cockpit">
      <Button variant="secondary" @click="fullReset">{{ $t('pages.analyze.result.newImage') }}</Button>
      <Button variant="secondary" @click="exportPdf">{{ $t('pages.analyze.result.exportPdf') }}</Button>
    </div>
    <!-- Browser-Kopf-/Fusszeilen (URL, Datum) sind per CSS nicht zuverlässig
         unterdrückbar → statischer Hinweis statt Toast (der wäre vor dem
         blockierenden window.print() unsichtbar, Codex-Review). -->
    <p class="result-print-tip">{{ $t('pages.analyze.result.printTip') }}</p>
  </div>

  <!-- Druckansicht (report-print.md): im Screen verborgen, im @media print sichtbar.
       Bewusst AUSSERHALB der .stage, damit die interaktive Stage im Druck ausgeblendet
       werden kann. usage_form/Kontext/Prompt = eingefrorener Submit-State (frontend-only). -->
  <ReportPrintView
    v-if="state === 'result' && resultVm && generatedAt"
    :view-model="resultVm"
    :hero-score="resultVm.integrityScore"
    :generated-at="generatedAt"
    :image-url="imageUrl"
    :submitted-usage-form="submittedUsageForm"
    :submitted-context="submittedContext"
    :submitted-prompt="submittedPrompt"
  />
</template>

<style scoped>

/* Tool-Stage */
.stage {
  max-width: 760px;
  margin: 44px auto 56px;
  background: var(--surface);
  border: 1.5px solid var(--ink);
  border-radius: var(--r);
  overflow: hidden;
}

/* Einordnungs-Hinweise unter der Eingabe-Karte: bewusst leiser als die Stage
   (Hairline statt Ink-Rahmen), damit sie informieren, ohne zu konkurrieren. */
.caveats {
  max-width: 760px;
  margin: -24px auto 64px;
  padding: 20px 24px 22px;
  border: 1px solid var(--line);
  border-radius: var(--r);
}
.caveats__kicker {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 500;
  font-size: 10.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--subtle);
  margin-bottom: 14px;
}
.caveats__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 28px;
}
.caveats__item h2 {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 600;
  font-size: 13.5px;
  color: var(--ink);
  margin-bottom: 3px;
}
.caveats__item p {
  font-size: 13px;
  line-height: 1.5;
  color: var(--ink-soft);
  margin: 0;
}
@media (max-width: 639px) {
  .caveats__grid {
    grid-template-columns: 1fr;
  }
}
.stage__strip {
  background: var(--ink);
  color: var(--surface);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 18px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 500;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.stage__strip .step {
  color: rgba(255, 255, 255, 0.55);
}
.stage__strip .step.is-active {
  color: var(--surface);
}
.stage__strip .step.is-active::before {
  content: '› ';
}
.stage__body {
  padding: 28px;
}
@media (max-width: 719px) {
  .stage__body {
    padding: 20px;
  }
}

/* Helfer */
.help {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.55;
}
.mono-note {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--subtle);
}
.section-kicker {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

/* Dropzone */
.dz-head {
  margin-bottom: 16px;
}
.dz-head h2 {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: 19px;
  letter-spacing: -0.01em;
  color: var(--ink);
}
.dz-head p {
  margin-top: 6px;
}
.dropzone {
  position: relative;
  border: 1.5px dashed var(--line-strong);
  border-radius: var(--r);
  background: var(--canvas);
  padding: 44px 24px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.12s ease, background 0.12s ease;
}
.dropzone:hover {
  border-color: var(--ink);
}
.dropzone:focus-within,
.dropzone:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
}
.dropzone.is-dragover {
  border-color: var(--ink);
  border-style: solid;
  background: var(--surface-2);
}
.dz-default {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.dropzone__icon {
  width: 34px;
  height: 34px;
  margin: 0 auto 14px;
  color: var(--muted);
}
.dropzone__primary {
  font-weight: 600;
  font-size: 16px;
  color: var(--ink);
}
.dropzone__or {
  display: block;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--subtle);
  margin: 12px 0;
}
.dropzone__formats {
  margin-top: 16px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--subtle);
}
/* Drag-Hinweis als Overlay: blendet OHNE Layout-Shift ueber dem ruhenden Inhalt
   ein. Feld bleibt konstant gross; nur Opacity + Rahmen/Flaeche signalisieren den
   Drag. Doppelkodierung (Farbe + Wort), wie im uebrigen UI. */
.dz-dragmsg {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--r);
  background: rgba(232, 233, 226, 0.96);
  font-weight: 600;
  font-size: 16px;
  color: var(--ink);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.12s ease;
}
/* Waehrend des Drags keine Pointer-Events auf dem ruhenden Inhalt -> nur die
   Dropzone selbst feuert dragenter/leave (Ergaenzung zum dragDepth-Zaehler). */
.dropzone.is-dragover .dz-default {
  pointer-events: none;
}
.dropzone.is-dragover .dz-dragmsg {
  opacity: 1;
}
@media (prefers-reduced-motion: reduce) {
  .dropzone,
  .dz-dragmsg {
    transition: none;
  }
}

/* Validating */
.validating {
  text-align: center;
  padding: 36px 16px;
}
.spinner {
  width: 30px;
  height: 30px;
  margin: 0 auto 18px;
  border: 2.5px solid var(--line);
  border-top-color: var(--ink);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
  }
}
.validating h2 {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: 17px;
  color: var(--ink);
}
.validating p {
  margin-top: 8px;
  max-width: 440px;
  margin-inline: auto;
}

/* Vorschau (collecting) */
.preview {
  display: grid;
  grid-template-columns: 132px 1fr;
  gap: 18px;
  align-items: start;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--line);
}
.preview__imgwrap {
  position: relative;
  border: 1px solid var(--line);
  border-radius: var(--r);
  overflow: hidden;
  background: var(--surface-2);
}
.preview__img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
}
.ph-hatch {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 4 / 5;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--subtle);
  background-image: repeating-linear-gradient(
    45deg,
    var(--line-soft) 0,
    var(--line-soft) 1px,
    transparent 1px,
    transparent 7px
  );
}
.preview__meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.preview__label {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--subtle);
}
.preview__name {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 13px;
  color: var(--ink);
  word-break: break-all;
}
.preview__dims {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  color: var(--muted);
}
.preview__actions {
  display: flex;
  gap: 8px;
  margin-top: 6px;
  flex-wrap: wrap;
}

/* Angaben-Block */
.collect-block {
  padding-top: 24px;
}
.collect-block__head h2 {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: 18px;
  letter-spacing: -0.01em;
  color: var(--ink);
  margin-top: 6px;
}
.collect-block__head .lead {
  margin-top: 6px;
}
/* Optionale Felder */
.optionals {
  margin-top: 26px;
  border-top: 1px solid var(--line);
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
details.opt {
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--surface);
}
details.opt > summary {
  list-style: none;
  cursor: pointer;
  padding: 13px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 14px;
  color: var(--ink);
}
details.opt > summary::-webkit-details-marker {
  display: none;
}
details.opt > summary:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: -2px;
  border-radius: var(--r);
}
.opt__chev {
  width: 16px;
  height: 16px;
  color: var(--muted);
  transition: transform 0.14s ease;
  flex: 0 0 auto;
}
details.opt[open] .opt__chev {
  transform: rotate(90deg);
}
@media (prefers-reduced-motion: reduce) {
  .opt__chev {
    transition: none;
  }
}
.opt__body {
  padding: 0 15px 15px;
}
.opt__field-lab {
  display: block;
  font-weight: 600;
  font-size: 13px;
  color: var(--ink);
  margin-bottom: 4px;
}
.opt__field-help {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 10px;
  line-height: 1.5;
}
textarea.field {
  width: 100%;
  min-height: 90px;
  resize: vertical;
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-size: 14px;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r);
  padding: 10px 12px;
  line-height: 1.5;
}
textarea.field:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 1px;
  border-color: var(--ink);
}
textarea.field::placeholder {
  color: var(--subtle);
}
.charcount {
  display: block;
  text-align: right;
  margin-top: 6px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  color: var(--subtle);
}
.opt__emptyhint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--muted);
}

/* Submit-Leiste */
.submit-bar {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.submit-bar__row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.submit-hint {
  font-size: 13px;
  color: var(--muted);
}
.submit-hint--blocked {
  color: var(--crit-ink);
}

/* Abbrechen-Zeile (analyzing) + Abschlussaktionen (result) */
.cancel-row {
  display: flex;
  justify-content: center;
  margin-top: 18px;
}
.result-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

/* Result-Stage (E5): voll-breiter Wrapper ausserhalb der schmalen .stage-Karte; das
   Cockpit zentriert sich selbst auf min(1380px, 100%). */
.result-stage {
  margin-bottom: 56px;
}
/* Aktionen bündig unter dem Cockpit-Inhalt (gleiche Breite + Innen-Gutter wie das Cockpit). */
.result-actions--cockpit {
  width: min(1380px, 100%);
  margin: 0 auto;
  padding: 0 clamp(20px, 4vw, 48px);
}
.result-print-tip {
  width: min(1380px, 100%);
  margin: 8px auto 0;
  padding: 0 clamp(20px, 4vw, 48px);
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  color: var(--muted);
}

/* Druck (report-print.md §3): interaktive Stage + Seitenkopf + Cockpit-Result ausblenden –
   sichtbar bleibt nur die ReportPrintView (ausserhalb der .stage). AppHeader/
   AppFooter blenden sich global via .no-print aus. */
@media print {
  .stage,
  .caveats,
  .result-stage {
    display: none !important;
  }
}
</style>
