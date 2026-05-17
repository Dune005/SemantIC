<script setup lang="ts">
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

const imageBase64 = ref<string>('')
const imagePreview = ref<string>('')
const mediaType = ref<string>('image/jpeg')
const promptInput = ref<string>('')
const contextInput = ref<string>('')
const fileName = ref<string>('')

const loading = ref(false)
const errorMessage = ref<string>('')
const result = ref<any>(null)

function stripBase64Prefix(dataUrl: string): { base64: string; mediaType: string } {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
  if (!match) return { base64: dataUrl, mediaType: 'image/jpeg' }
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
    const data = await $fetch('/api/analyze', {
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

const contextEmpty = computed(() => !contextInput.value.trim())
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto max-w-6xl px-6 py-5">
        <h1 class="text-2xl font-semibold tracking-tight">SemantIC – Minimal Frontend</h1>
        <p class="mt-1 text-sm text-slate-600">
          Erster End-to-End-Test der Analyse-Pipeline. Bild + Prompt + Kontext → JSON-Resultat.
        </p>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-6 py-8 space-y-8">
      <!-- Sample-Buttons -->
      <section>
        <h2 class="text-sm font-medium text-slate-700 mb-2">Beispielbilder</h2>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="sample in samples"
            :key="sample.src"
            type="button"
            class="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-100"
            @click="loadSample(sample)"
          >
            {{ sample.label }}
          </button>
        </div>
      </section>

      <!-- Upload + Form -->
      <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Bild</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="block w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-white hover:file:bg-slate-700"
              @change="onFileChange"
            />
            <p v-if="fileName" class="mt-1 text-xs text-slate-500">{{ fileName }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Original-Prompt <span class="font-normal text-slate-500">(optional)</span>
            </label>
            <textarea
              v-model="promptInput"
              rows="2"
              class="block w-full rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder="z.B. 'Nurse in hospital corridor'"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Nutzungskontext <span class="font-normal text-slate-500">(optional, aber empfohlen)</span>
            </label>
            <textarea
              v-model="contextInput"
              rows="3"
              class="block w-full rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder="z.B. 'Headerbild für Editorial-Beitrag in einem Gesundheitsmagazin'"
            />
            <p
              v-if="contextEmpty"
              class="mt-1 rounded bg-amber-50 border border-amber-200 px-2 py-1 text-xs text-amber-900"
            >
              Ohne Nutzungskontext wird die Bias-Bewertung generisch. Empfohlen ausfüllen.
            </p>
          </div>

          <button
            type="button"
            class="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="loading || !imageBase64"
            @click="submit"
          >
            {{ loading ? 'Analysiere … (10–25 s)' : 'Analyse starten' }}
          </button>

          <p v-if="errorMessage" class="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">
            {{ errorMessage }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Vorschau</label>
          <div class="aspect-video rounded border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
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
      <section v-if="result">
        <h2 class="text-sm font-medium text-slate-700 mb-2">Resultat</h2>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div class="rounded border border-slate-200 bg-white px-3 py-2">
            <div class="text-xs text-slate-500">Integrität (lokal)</div>
            <div class="text-xl font-semibold">{{ result.computed?.integrity_score_local ?? '–' }}</div>
          </div>
          <div class="rounded border border-slate-200 bg-white px-3 py-2">
            <div class="text-xs text-slate-500">Ästhetik</div>
            <div class="text-xl font-semibold">{{ result.aesthetic?.aesthetic_score ?? '–' }}</div>
          </div>
          <div class="rounded border border-slate-200 bg-white px-3 py-2">
            <div class="text-xs text-slate-500">Maskierung (Tendenz)</div>
            <div class="text-xl font-semibold">{{ result.computed?.masking_score ?? '–' }}</div>
          </div>
        </div>

        <details open class="rounded border border-slate-200 bg-white">
          <summary class="cursor-pointer px-3 py-2 text-sm font-medium select-none">
            Roh-JSON (Pipeline-Output)
          </summary>
          <pre class="overflow-auto border-t border-slate-200 bg-slate-900 text-slate-100 text-xs p-3 max-h-[60vh]">{{ JSON.stringify(result, null, 2) }}</pre>
        </details>
      </section>
    </main>
  </div>
</template>
