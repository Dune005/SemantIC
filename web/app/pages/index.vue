<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  CircleAlert,
  CircleDashed,
  Info,
  XCircle,
} from 'lucide-vue-next'
import type { SemanticAnalysisResult } from '@pipeline/analyze'
import type { ContextReviewHint } from '@pipeline/context-hints'
import {
  buildAnalysisViewModel,
  type DimensionStatus,
  type MaskingVerdict,
  type RiskLevel,
} from '~/composables/useAnalysisView'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '~/components/ui/accordion'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '~/components/ui/tooltip'
import { Separator } from '~/components/ui/separator'

interface Sample {
  src: string
  label: string
  prompt: string
  context: string
}

const samples: Sample[] = [
  {
    src: '/samples/eweek-vibe-coding.jpg',
    label: 'eWeek – Vibe Coding (Tech-Magazin)',
    prompt: 'Tech-Illustration zu Vibe Coding',
    context: 'Headerbild für Blogbeitrag auf eweek.com (US-Tech-Magazin) zum Thema Vibe Coding.',
  },
  {
    src: '/samples/nb-nurse-02.jpg',
    label: 'NB – Nurse (engineered, Bing/Image Creator)',
    prompt: 'Professional nurse smiling at the camera in a clean hospital corridor',
    context: 'Symbolbild für Pflegekommunikation auf einer Klinik-Website.',
  },
  {
    src: '/samples/sd-emergencyroom-01.jpg',
    label: 'SD – Emergency Room',
    prompt: 'Doctors working in an emergency room',
    context: 'Editorial-Bild für einen Beitrag in einem Gesundheitsmagazin.',
  },
  {
    src: '/samples/sd-dinner-02.jpg',
    label: 'SD – Family Dinner',
    prompt: 'A family having dinner together',
    context: 'Lifestyle-Magazin-Beitrag über Familienkultur und gemeinsame Mahlzeiten.',
  },
]

const imageBase64 = ref('')
const imagePreview = ref('')
const mediaType = ref('image/jpeg')
const promptInput = ref('')
const contextInput = ref('')
const fileName = ref('')

const loading = ref(false)
const errorMessage = ref('')
const result = ref<SemanticAnalysisResult | null>(null)

const view = computed(() => result.value ? buildAnalysisViewModel(result.value) : null)
const contextEmpty = computed(() => !contextInput.value.trim())

// --- Debug-Modus ---
const debugMode = ref(false)
onMounted(() => {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (url.searchParams.get('debug') === '1') {
    debugMode.value = true
  } else {
    const stored = window.localStorage.getItem('semantic.debug')
    if (stored === '1') debugMode.value = true
  }
})

function toggleDebug() {
  debugMode.value = !debugMode.value
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('semantic.debug', debugMode.value ? '1' : '0')
  }
}

// --- File-Handling ---
function stripBase64Prefix(dataUrl: string): { base64: string; mediaType: string } {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
  if (!match || match[1] === undefined || match[2] === undefined) {
    return { base64: dataUrl, mediaType: 'image/jpeg' }
  }
  return { base64: match[2], mediaType: match[1] }
}

function fileToBase64(file: File): Promise<{ base64: string; mediaType: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result ?? '')
      const stripped = stripBase64Prefix(dataUrl)
      resolve({ ...stripped, dataUrl })
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  fileName.value = file.name
  const { base64, mediaType: mt, dataUrl } = await fileToBase64(file)
  imageBase64.value = base64
  mediaType.value = mt
  imagePreview.value = dataUrl
  result.value = null
  errorMessage.value = ''
}

async function loadSample(sample: Sample) {
  result.value = null
  errorMessage.value = ''
  fileName.value = sample.src.split('/').pop() ?? ''
  const res = await fetch(sample.src)
  const blob = await res.blob()
  const file = new File([blob], fileName.value, { type: blob.type || 'image/jpeg' })
  const { base64, mediaType: mt, dataUrl } = await fileToBase64(file)
  imageBase64.value = base64
  mediaType.value = mt
  imagePreview.value = dataUrl
  promptInput.value = sample.prompt
  contextInput.value = sample.context
}

async function submit() {
  if (!imageBase64.value) {
    errorMessage.value = 'Bitte zuerst ein Bild auswählen oder ein Beispiel laden.'
    return
  }
  loading.value = true
  errorMessage.value = ''
  result.value = null
  try {
    const data = await $fetch<SemanticAnalysisResult>('/api/analyze', {
      method: 'POST',
      body: {
        imageBase64: imageBase64.value,
        mediaType: mediaType.value,
        prompt: promptInput.value || undefined,
        context: contextInput.value || undefined,
      },
    })
    result.value = data
  } catch (err: any) {
    errorMessage.value = err?.data?.data?.message ?? err?.statusMessage ?? err?.message ?? 'Unbekannter Fehler'
  } finally {
    loading.value = false
  }
}

// --- Label-Helpers ---
const dimensionLabels: Record<'physics' | 'semantics' | 'bias', string> = {
  physics: 'Physik',
  semantics: 'Semantik',
  bias: 'Bias',
}

const dimensionDescriptions: Record<'physics' | 'semantics' | 'bias', string> = {
  physics: 'Licht, Schatten, Anatomie, Materialien',
  semantics: 'Szenenlogik, Prompt-Passung, Kontext',
  bias: 'Stereotype, Rollenbesetzung, Repräsentation',
}

const verdictLabels: Record<MaskingVerdict, string> = {
  none: 'keine Maskierung erkannt',
  low: 'geringe Tendenz',
  medium: 'mittlere Tendenz',
  high: 'starke Tendenz',
}

const readingModeDescriptions: Record<string, string> = {
  WA: 'Werbe-Ästhetik — maskiert über Normativität und Idealwelt.',
  DA: 'Dokumentarisch-Authentisch — maskiert über scheinbare Objektivität.',
  CI: 'Cinematisch — maskiert affektiv über Filmstimmung.',
  AA: 'Amateur-Authentisch — maskiert über Vertrautheit und Spontaneität.',
  MI: 'Magazin/Inszeniert — maskiert über Professionalität und Status.',
}

const dominantErrorLabels: Record<string, string> = {
  physics: 'Physik-Befund dominiert',
  anatomy: 'Anatomie-Befund dominiert',
  context: 'Kontext-Befund dominiert',
  mixed: 'mehrere Befunde gemischt',
  none: 'kein dominanter Befund',
}

const inputCompletenessLabels: Record<string, string> = {
  full: 'Prompt und Nutzungskontext vorhanden',
  image_context: 'Nutzungskontext vorhanden, ohne Prompt',
  image_prompt: 'Prompt vorhanden, ohne Nutzungskontext',
  image_only: 'Nur Bild — Bewertung wird generisch',
}

function statusToBadgeVariant(status: DimensionStatus) {
  return status === 'green' ? 'success' : status === 'yellow' ? 'warning' : 'danger'
}

function statusLabel(status: DimensionStatus) {
  return status === 'green' ? 'unauffällig' : status === 'yellow' ? 'auffällig' : 'kritisch'
}

function severityVariant(severity: ContextReviewHint['severity']) {
  return severity === 'high' ? 'danger' : severity === 'medium' ? 'warning' : 'secondary'
}

function severityLabel(severity: ContextReviewHint['severity']) {
  return severity === 'high' ? 'hoch' : severity === 'medium' ? 'mittel' : 'niedrig'
}

function riskBadgeVariant(risk: RiskLevel | 'none') {
  return risk === 'high' ? 'danger' : risk === 'medium' ? 'warning' : risk === 'low' ? 'success' : 'secondary'
}

function verdictBadgeVariant(verdict: MaskingVerdict) {
  return verdict === 'high' ? 'danger' : verdict === 'medium' ? 'warning' : verdict === 'low' ? 'secondary' : 'success'
}

const VERDICT_RING_CLASS: Record<DimensionStatus, string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  red: 'bg-red-500',
}

const VERDICT_TEXT_CLASS: Record<DimensionStatus, string> = {
  green: 'text-emerald-700',
  yellow: 'text-amber-700',
  red: 'text-red-700',
}

const VERDICT_BG_CLASS: Record<DimensionStatus, string> = {
  green: 'bg-emerald-50 border-emerald-200',
  yellow: 'bg-amber-50 border-amber-200',
  red: 'bg-red-50 border-red-200',
}

const DIM_DOT_CLASS: Record<DimensionStatus, string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  red: 'bg-red-500',
}

const HINT_SEVERITY_LABEL: Record<'high' | 'medium' | 'low', string> = {
  high: 'hoch',
  medium: 'mittel',
  low: 'niedrig',
}

const HINT_SEVERITY_TEXT_CLASS: Record<'high' | 'medium' | 'low', string> = {
  high: 'text-red-600',
  medium: 'text-amber-600',
  low: 'text-slate-500',
}
</script>

<template>
  <TooltipProvider>
    <div class="min-h-screen bg-slate-50 text-slate-900">
      <header class="border-b border-slate-200 bg-white">
        <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 class="text-2xl font-semibold tracking-tight">SemantIC</h1>
            <p class="mt-1 text-sm text-slate-600">
              AI Visual Integrity Validator — Bild + Prompt + Kontext → redaktionelle Einschätzung.
            </p>
          </div>
          <Button :variant="debugMode ? 'default' : 'outline'" size="sm" :aria-pressed="debugMode" @click="toggleDebug">
            <Bug class="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Debug {{ debugMode ? 'an' : 'aus' }}
          </Button>
        </div>
      </header>

      <main class="mx-auto max-w-6xl space-y-8 px-6 py-8">
        <!-- Sample-Buttons (nur im Debug-Modus) -->
        <section v-if="debugMode">
          <h2 class="mb-2 text-sm font-medium text-slate-700">Beispielbilder (Debug)</h2>
          <div class="flex flex-wrap gap-2">
            <Button
              v-for="sample in samples"
              :key="sample.src"
              variant="outline"
              size="sm"
              @click="loadSample(sample)"
            >
              {{ sample.label }}
            </Button>
          </div>
        </section>

        <!-- Upload + Form -->
        <section class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div class="space-y-4">
            <div>
              <label for="image-input" class="mb-1 block text-sm font-medium text-slate-700">Bild</label>
              <input
                id="image-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="block w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-white hover:file:bg-slate-700"
                @change="onFileChange"
              />
              <p v-if="fileName" class="mt-1 text-xs text-slate-500">{{ fileName }}</p>
            </div>

            <div>
              <label for="prompt-input" class="mb-1 block text-sm font-medium text-slate-700">
                Original-Prompt <span class="font-normal text-slate-500">(optional)</span>
              </label>
              <textarea
                id="prompt-input"
                v-model="promptInput"
                rows="2"
                class="block w-full rounded border border-slate-300 px-3 py-2 text-sm"
                placeholder="z.B. 'Nurse in hospital corridor'"
              />
            </div>

            <div>
              <label for="context-input" class="mb-1 block text-sm font-medium text-slate-700">
                Nutzungskontext <span class="font-normal text-slate-500">(optional, aber empfohlen)</span>
              </label>
              <textarea
                id="context-input"
                v-model="contextInput"
                rows="3"
                class="block w-full rounded border border-slate-300 px-3 py-2 text-sm"
                placeholder="z.B. 'Headerbild für Editorial-Beitrag in einem Gesundheitsmagazin'"
              />
              <p
                v-if="contextEmpty"
                class="mt-1 flex items-start gap-1.5 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-900"
              >
                <AlertTriangle class="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Ohne Nutzungskontext bleibt die Bias-Einschätzung generisch. Empfohlen ausfüllen.</span>
              </p>
            </div>

            <Button :disabled="loading || !imageBase64" @click="submit">
              {{ loading ? 'Analysiere … (15–30 s)' : 'Analyse starten' }}
            </Button>

            <p v-if="errorMessage" role="alert" class="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {{ errorMessage }}
            </p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Vorschau</label>
            <div class="flex aspect-video items-center justify-center overflow-hidden rounded border border-slate-200 bg-white">
              <img
                v-if="imagePreview"
                :src="imagePreview"
                alt="Bildvorschau"
                class="max-h-full max-w-full object-contain"
              />
              <span v-else class="text-sm text-slate-400">Noch kein Bild geladen</span>
            </div>
          </div>
        </section>

        <!-- Resultat -->
        <section v-if="view" class="space-y-6">
          <Separator />

          <!-- Kontext-Lücke-Banner -->
          <p
            v-if="view.hasContextWarning"
            class="flex items-start gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
          >
            <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Ohne vollständigen Kontext bleibt die Einschätzung generisch.</span>
          </p>

          <!-- Verdict-Hero-Karte -->
          <Card :class="['border', VERDICT_BG_CLASS[view.overallVerdict.status]]">
            <CardContent class="flex gap-5 p-6">
              <div
                :class="['h-16 w-16 shrink-0 rounded-full', VERDICT_RING_CLASS[view.overallVerdict.status]]"
                aria-hidden="true"
              />
              <div class="flex-1 space-y-3">
                <div>
                  <h2 :class="['text-2xl font-semibold tracking-tight', VERDICT_TEXT_CLASS[view.overallVerdict.status]]">
                    {{ view.overallVerdict.headline }}
                  </h2>
                  <p class="mt-1 text-xs uppercase tracking-wider text-slate-500">Empfehlung — keine Detektion</p>
                </div>
                <p class="text-sm text-slate-700">{{ view.overallVerdict.recommendation }}</p>

                <ol v-if="view.userHints.length > 0" class="space-y-1.5 pl-1">
                  <li
                    v-for="(hint, i) in view.userHints"
                    :key="hint.topic"
                    class="flex items-start gap-2 text-sm text-slate-800"
                  >
                    <span class="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-700 ring-1 ring-slate-300">
                      {{ i + 1 }}
                    </span>
                    <span class="flex-1">{{ hint.text }}</span>
                  </li>
                </ol>
                <p v-else class="text-sm text-slate-600">Keine spezifischen Hinweise.</p>

                <p class="border-t border-slate-200/70 pt-2 text-xs text-slate-500">
                  Diese Einschätzung ist eine Empfehlung. Letztes Urteil liegt bei dir.
                </p>
              </div>
            </CardContent>
          </Card>

          <!-- "Worauf basiert das?" -->
          <div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
            <span class="font-medium text-slate-700">Worauf basiert das?</span>
            <span
              v-for="(dim, key) in view.dimensions"
              :key="key"
              class="flex items-center gap-1.5"
            >
              <span :class="['inline-block h-2.5 w-2.5 rounded-full', DIM_DOT_CLASS[dim.status]]" aria-hidden="true" />
              <span>{{ dimensionLabels[key] }}</span>
            </span>
          </div>

          <!-- Debug-Sektion: alle Forschungs-Karten + Raw-Layer -->
          <section v-if="debugMode" class="space-y-6">
            <Separator />
            <h2 class="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Bug class="h-4 w-4" /> Debug-Layer
            </h2>

            <!-- Dimensions-Karten mit Scores -->
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Card v-for="(dim, key) in view.dimensions" :key="key">
                <CardHeader class="pb-2">
                  <CardTitle class="flex items-center justify-between">
                    <span>{{ dimensionLabels[key] }}</span>
                    <CheckCircle2 v-if="dim.status === 'green'" class="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    <CircleAlert v-else-if="dim.status === 'yellow'" class="h-4 w-4 text-amber-600" aria-hidden="true" />
                    <XCircle v-else class="h-4 w-4 text-red-600" aria-hidden="true" />
                  </CardTitle>
                  <CardDescription>{{ dimensionDescriptions[key] }}</CardDescription>
                </CardHeader>
                <CardContent class="flex items-end justify-between">
                  <Badge :variant="statusToBadgeVariant(dim.status)">{{ statusLabel(dim.status) }}</Badge>
                  <span class="text-sm tabular-nums text-slate-500">{{ dim.score }}/100</span>
                </CardContent>
              </Card>

              <!-- Aesthetic-Karte -->
            <Card>
              <CardHeader class="pb-2">
                <CardTitle class="flex items-center justify-between">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <button type="button" class="cursor-help underline decoration-dotted underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Ästhetik</button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Mittel aus Sonnet (LLM) und LAION-V2.5 (deterministischer Predictor).
                      Bei grosser Abweichung wird eine Divergenz angezeigt.
                    </TooltipContent>
                  </Tooltip>
                  <Info class="h-4 w-4 text-slate-400" aria-hidden="true" />
                </CardTitle>
                <CardDescription>visuelle Oberfläche, kombiniert</CardDescription>
              </CardHeader>
              <CardContent class="space-y-1.5">
                <div class="flex items-end justify-between">
                  <span class="text-2xl font-semibold tabular-nums">{{ view.aestheticCombined }}</span>
                  <span class="text-xs text-slate-500">/100</span>
                </div>
                <p v-if="view.aestheticDivergent" class="flex items-start gap-1.5 rounded bg-amber-50 px-1.5 py-1 text-xs text-amber-900">
                  <AlertTriangle class="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                  <span>Ästhetik-Modelle weichen stark ab (Δ {{ view.aestheticDelta }}).</span>
                </p>
                <p v-else-if="view.aestheticFallbackOnly" class="flex items-start gap-1.5 rounded bg-slate-100 px-1.5 py-1 text-xs text-slate-600">
                  <CircleDashed class="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                  <span>Nur Sonnet — V2.5 nicht verfügbar.</span>
                </p>
              </CardContent>
            </Card>

            <!-- Maskierungs-Karte -->
            <Card>
              <CardHeader class="pb-2">
                <CardTitle class="flex items-center justify-between">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <button type="button" class="cursor-help underline decoration-dotted underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Maskierung</button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Tendenzhinweis: deckt die Ästhetik mögliche Probleme zu?
                      Aus Codebook-Evidenz und kombinierter Ästhetik abgeleitet — keine zuverlässige Messung.
                    </TooltipContent>
                  </Tooltip>
                  <Info class="h-4 w-4 text-slate-400" aria-hidden="true" />
                </CardTitle>
                <CardDescription>Tendenz, kein Nachweis</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge :variant="verdictBadgeVariant(view.maskingVerdict)">
                  {{ verdictLabels[view.maskingVerdict] }}
                </Badge>
              </CardContent>
            </Card>
          </div>

          <!-- Leseart + Visuelle Treiber -->
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <button type="button" class="cursor-help underline decoration-dotted underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Leseart</button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Lesearten sind subjektiv und überlappen oft. Eine Einstufung ist eine Tendenz, keine Wahrheit.
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent class="space-y-2">
                <div class="flex flex-wrap items-center gap-2">
                  <Badge variant="default">{{ view.readingMode.code }}</Badge>
                  <span class="text-sm text-slate-700">{{ view.readingMode.label }}</span>
                </div>
                <p class="text-xs text-slate-500">{{ readingModeDescriptions[view.readingMode.code] }}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visuelle Treiber</CardTitle>
                <CardDescription>was den visuellen Eindruck prägt</CardDescription>
              </CardHeader>
              <CardContent>
                <div v-if="view.visualDrivers.length > 0" class="flex flex-wrap gap-1.5">
                  <Badge
                    v-for="(driver, i) in view.visualDrivers"
                    :key="`${driver.code}-${i}`"
                    variant="secondary"
                  >
                    <span class="mr-1 font-mono text-[10px] opacity-70">{{ driver.code }}</span>
                    {{ driver.label }}
                  </Badge>
                </div>
                <p v-else class="text-xs text-slate-500">Keine spezifischen Treiber identifiziert.</p>
              </CardContent>
            </Card>
          </div>

          <!-- Bias-Achsen-Summary + Dominant-Error + Input-Completeness -->
          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader class="pb-2">
                <CardTitle>Bias-Achsen</CardTitle>
                <CardDescription>identifizierte Bias-Dimensionen</CardDescription>
              </CardHeader>
              <CardContent class="flex items-center justify-between">
                <span class="text-2xl font-semibold tabular-nums">{{ view.biasAxesSummary.count }}</span>
                <Badge :variant="riskBadgeVariant(view.biasAxesSummary.maxRisk)">
                  max. Risiko: {{ view.biasAxesSummary.maxRisk === 'none' ? '–' : view.biasAxesSummary.maxRisk }}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader class="pb-2">
                <CardTitle>Dominanter Befund</CardTitle>
                <CardDescription>was die Analyse hervorhebt</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">{{ dominantErrorLabels[view.dominantErrorType] }}</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader class="pb-2">
                <CardTitle>Input-Vollständigkeit</CardTitle>
                <CardDescription>was die Pipeline gesehen hat</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge
                  :variant="view.inputCompleteness === 'full' ? 'success' : view.inputCompleteness === 'image_only' ? 'warning' : 'secondary'"
                >
                  {{ inputCompletenessLabels[view.inputCompleteness] }}
                </Badge>
              </CardContent>
            </Card>
          </div>

          <!-- Hints-Akkordeon -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                Prüfhinweise (Hinweis, kein Nachweis)
                <Badge variant="outline" class="text-[10px]">
                  {{ view.hintsCountBySeverity.high }} hoch · {{ view.hintsCountBySeverity.medium }} mittel · {{ view.hintsCountBySeverity.low }} niedrig
                </Badge>
              </CardTitle>
              <CardDescription>
                {{ view.hintsSortedBySeverity.length }} Hinweis(e) für die redaktionelle Prüfung
              </CardDescription>
            </CardHeader>
            <CardContent class="pt-0">
              <p v-if="view.hintsSortedBySeverity.length === 0" class="text-sm text-slate-500">
                Keine Hinweise ausgelöst.
              </p>
              <Accordion
                v-else
                type="multiple"
                class="w-full"
                :default-value="view.hintsSortedBySeverity.filter(h => h.severity === 'high').map(h => h.id)"
              >
                <AccordionItem
                  v-for="hint in view.hintsSortedBySeverity"
                  :key="hint.id"
                  :value="hint.id"
                >
                  <AccordionTrigger>
                    <span class="flex items-center gap-2 text-left">
                      <Badge :variant="severityVariant(hint.severity)" class="shrink-0">
                        {{ severityLabel(hint.severity) }}
                      </Badge>
                      <span class="font-mono text-[10px] text-slate-500">{{ hint.id }}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent class="space-y-2">
                    <p class="text-sm text-slate-700">{{ hint.hint }}</p>
                    <p class="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                      <strong class="font-semibold">Prüffrage:</strong> {{ hint.reviewQuestion }}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <!-- Konsolidierte Hint-Spur (Topics) -->
          <Card>
            <CardHeader>
              <CardTitle>Konsolidierte Hints (Topics)</CardTitle>
              <CardDescription>
                {{ view.userHints.length }} sichtbar (Hero, max. 3) · {{ view.hiddenHints.length }} ausgeblendet (Anti-Rauschen-Filter oder Top-3-Cap)
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-2">
              <details
                v-for="hint in [...view.userHints, ...view.hiddenHints]"
                :key="`hint-${hint.topic}`"
                class="rounded border border-slate-200 bg-white"
              >
                <summary class="cursor-pointer select-none px-2 py-1.5 text-xs">
                  <span class="font-mono text-slate-500">{{ hint.topic }}</span>
                  <span class="ml-2">sev={{ hint.severity }} · support={{ hint.supportLevel }} · groups={{ hint.signalGroups.join(',') }}</span>
                </summary>
                <ul class="border-t border-slate-200 px-3 py-2 text-xs text-slate-700">
                  <li v-for="signal in hint.signals" :key="signal" class="font-mono">{{ signal }}</li>
                </ul>
              </details>
            </CardContent>
          </Card>

          <!-- Codebook-Variablen-Übersicht -->
          <Card>
            <CardHeader>
              <CardTitle>Codebook (Pipeline-Ausgabe)</CardTitle>
              <CardDescription>Rohwerte aus dem Gemini-Call</CardDescription>
            </CardHeader>
            <CardContent>
              <pre class="overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100">{{ JSON.stringify(view.debug.rawJson.analysis.research_layer.codebook, null, 2) }}</pre>
            </CardContent>
          </Card>

          <!-- Pipeline-Meta + Roh-JSON -->
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <Card>
              <CardHeader class="pb-2"><CardTitle>Sonnet</CardTitle></CardHeader>
              <CardContent>
                <span class="text-xl font-semibold tabular-nums">{{ view.debug.sonnetAesthetic }}</span>
                <span class="ml-1 text-xs text-slate-500">/100</span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader class="pb-2"><CardTitle>V2.5</CardTitle></CardHeader>
              <CardContent>
                <template v-if="view.debug.v25Aesthetic !== null">
                  <span class="text-xl font-semibold tabular-nums">{{ view.debug.v25Aesthetic }}</span>
                  <span class="ml-1 text-xs text-slate-500">/100 (raw {{ view.debug.v25Raw?.toFixed(2) }}/10)</span>
                </template>
                <Badge v-else variant="danger" class="text-[10px]">
                  Fehler: {{ view.debug.laionError ?? 'unbekannt' }}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader class="pb-2"><CardTitle>Integrity (lokal)</CardTitle></CardHeader>
              <CardContent>
                <span class="text-xl font-semibold tabular-nums">{{ view.debug.integrityScore }}</span>
                <span class="ml-1 text-xs text-slate-500">/100</span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader class="pb-2"><CardTitle>Pipeline-Meta</CardTitle></CardHeader>
              <CardContent class="text-xs text-slate-600">
                <p><strong>Analyse:</strong> {{ view.debug.modelLabel }}</p>
                <p v-if="view.debug.aestheticModelLabel"><strong>Aesthetic:</strong> {{ view.debug.aestheticModelLabel }}</p>
                <p><strong>Laufzeit:</strong> {{ (view.debug.durationMs / 1000).toFixed(1) }} s</p>
              </CardContent>
            </Card>
          </div>

          <details class="rounded border border-slate-200 bg-white">
            <summary class="cursor-pointer select-none px-3 py-2 text-sm font-medium">
              Roh-JSON (Pipeline-Output)
            </summary>
            <pre class="max-h-[60vh] overflow-auto border-t border-slate-200 bg-slate-900 p-3 text-xs text-slate-100">{{ JSON.stringify(view.debug.rawJson, null, 2) }}</pre>
          </details>
          </section>
        </section>
      </main>
    </div>
  </TooltipProvider>
</template>
