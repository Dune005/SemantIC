<script setup lang="ts">
// /analyze (analyze-input-spec.md + analyze-report-spec.md · microcopy.md · errors.md) –
// Tool-Seite mit clientseitiger Zustandsmaschine. Header/Footer/Skip-Link liefert das
// default-Layout; diese Seite liefert nur den Inhalt (kein eigenes <main>).
//
// ETAPPE-4-GRENZE: Die State-Maschine, der Upload (Picker + Drag&Drop), die Typ-
// Validierung, die TileSelect-Pflichtlogik, WaitState/ErrorCards und der usage_form-
// Freeze sind echt. Der Analyse-Schritt ruft eine GEKAPSELTE Mock-Funktion
// (runMockAnalysis → Fixture-ViewModel), KEIN $fetch. Echter Call + Downscaling/Base64 +
// buildAnalysisViewModel ersetzen den Mock in Etappe 5/6 (einzige Naht).
import { ref, computed, onBeforeUnmount } from 'vue'
import Button from '~/components/ui/Button.vue'
import TileSelect from '~/components/ui/TileSelect.vue'
import WaitState from '~/components/analyze/WaitState.vue'
import ErrorCard from '~/components/analyze/ErrorCard.vue'
import BefundKarte from '~/components/analyze/BefundKarte.vue'
import type { AnalysisViewModel, UsageForm } from '~/types/analysis'
import greenFx from '~/dev-fixtures/green.json'
import yellowFx from '~/dev-fixtures/yellow.json'
import redFx from '~/dev-fixtures/red.json'
import nullfallFx from '~/dev-fixtures/nullfall.json'

useHead({ title: 'Bild prüfen – SemantIC' })

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

// TileSelect-Optionen (verbatim aus microcopy.md §3; Reihenfolge bindend).
const INTENT_OPTIONS = [
  { value: 'unspecified', label: 'Standard', hint: 'keine besondere Haltung' },
  { value: 'affirmative', label: 'Bestätigend', hint: 'untermalt das Thema' },
  { value: 'critical', label: 'Kritisch', hint: 'ordnet ein / Negativbeispiel' },
  { value: 'illustrative', label: 'Illustrativ', hint: 'neutrales Beispielbild' },
]
const USAGE_OPTIONS = [
  { value: 'header', label: 'Headerbild', hint: 'Aufmacher zu einem Beitrag' },
  { value: 'mood', label: 'Moodbild', hint: 'stimmungsgebend, eher beiläufig' },
  { value: 'symbol', label: 'Symbolbild', hint: 'steht stellvertretend für ein Thema' },
  { value: 'illustration', label: 'Illustration', hint: 'bebildert einen Sachverhalt' },
  { value: 'social', label: 'Social-Post', hint: 'Beitrag für soziale Netzwerke' },
  { value: 'advertising', label: 'Werbe-/Marketingbild', hint: 'bewirbt ein Produkt oder Angebot' },
  { value: 'editorial', label: 'Editorial-Bild', hint: 'redaktioneller Einsatz mit Anspruch' },
]

// Fehler-Presets (verbatim aus errors.md). severity: warn (Limit/Timeout/Upload) bzw.
// crit (Provider/Unknown). Aktionen als Event-Strings (ErrorCard emit `action`).
type ErrorPreset = {
  title: string
  message: string
  severity: 'warn' | 'crit'
  primaryAction?: { label: string; event: string }
  secondaryAction?: { label: string; event: string }
  rateLimit?: { remaining: number; resetsAt: string }
}
const ERROR_PRESETS: Record<ErrorKind, ErrorPreset> = {
  unsupported_type: {
    title: 'Format wird nicht unterstützt',
    message:
      'SemantIC prüft JPEG-, PNG- und WebP-Bilder. Dieses Format kann es nicht lesen. Speicher das Bild als JPEG, PNG oder WebP und leg es noch einmal ab.',
    severity: 'warn',
    primaryAction: { label: 'Anderes Bild wählen', event: 'reset' },
  },
  too_large: {
    title: 'Bild zu gross',
    message:
      'Diese Datei überschreitet das Limit von 3.5 MB. Grössere Bilder verkleinern wir normalerweise automatisch – hier hat das nicht gereicht. Exportier das Bild etwas kleiner (oder als JPEG) und versuch es erneut.',
    severity: 'warn',
    primaryAction: { label: 'Anderes Bild wählen', event: 'reset' },
  },
  downscale_failed: {
    title: 'Bild liess sich nicht verkleinern',
    message:
      'Beim lokalen Verkleinern des Bildes ist etwas schiefgelaufen – die Datei ist möglicherweise beschädigt oder ungewöhnlich kodiert. Versuch es mit einer neu exportierten Version des Bildes.',
    severity: 'warn',
    primaryAction: { label: 'Anderes Bild wählen', event: 'reset' },
  },
  rate_limited: {
    title: 'Tageslimit erreicht',
    message:
      'Pro Browser-Verbindung sind 3 Analysen in 24 Stunden möglich – das schützt die Kosten dieses Lehrprojekts. Du hast das Limit für heute ausgeschöpft. Morgen sind wieder 3 Analysen frei. Für eine Demo oder als Gutachter:in kannst du das Limit sofort aufheben: Trag den Zugangscode im Feld „Zugangscode" unten im Footer ein.',
    severity: 'warn',
    primaryAction: { label: 'Zugangscode eingeben', event: 'focusBypass' },
    secondaryAction: { label: 'Verstanden', event: 'dismiss' },
    rateLimit: { remaining: 0, resetsAt: '31.05.2026, 09:14 Uhr' },
  },
  timeout: {
    title: 'Analyse hat zu lange gebraucht',
    message:
      'Die Prüfung dauert normalerweise zehn bis dreissig Sekunden. Diesmal kam innerhalb der Wartezeit keine Antwort zurück – meist ein vorübergehendes Problem beim Analyse-Dienst. Versuch es gleich noch einmal. Deine Eingaben bleiben erhalten.',
    severity: 'warn',
    primaryAction: { label: 'Erneut versuchen', event: 'retry' },
    secondaryAction: { label: 'Neues Bild prüfen', event: 'reset' },
  },
  provider_error: {
    title: 'Analyse momentan nicht möglich',
    message:
      'Der Dienst, der dein Bild prüft, hat einen Fehler gemeldet oder ist gerade nicht erreichbar. Das liegt nicht an deinem Bild. Warte einen Moment und versuch es erneut. Deine Eingaben bleiben erhalten.',
    severity: 'crit',
    primaryAction: { label: 'Erneut versuchen', event: 'retry' },
    secondaryAction: { label: 'Neues Bild prüfen', event: 'reset' },
  },
  unknown: {
    title: 'Etwas ist schiefgelaufen',
    message:
      'Die Analyse wurde unerwartet abgebrochen. Was genau passiert ist, konnten wir nicht eindeutig zuordnen. Versuch es noch einmal. Wenn es erneut auftritt, lad das Bild neu hoch und starte frisch.',
    severity: 'crit',
    primaryAction: { label: 'Erneut versuchen', event: 'retry' },
    secondaryAction: { label: 'Neues Bild prüfen', event: 'reset' },
  },
}

// Dev-Fixtures (nur für den Mock + Dev-Switcher; in Etappe 8 mit app/dev-fixtures/ entfernt).
const RESULT_FIXTURES: Record<string, AnalysisViewModel> = {
  green: greenFx as unknown as AnalysisViewModel,
  yellow: yellowFx as unknown as AnalysisViewModel,
  red: redFx as unknown as AnalysisViewModel,
  nullfall: nullfallFx as unknown as AnalysisViewModel,
}

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
const isDragover = ref(false)

// usage_form-Freeze (frontend-only, nie im API-Body) + Mock-Ergebnis
const submittedUsageForm = ref<UsageForm | null>(null)
const resultVm = ref<AnalysisViewModel | null>(null)

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

// --- Abgeleitet ------------------------------------------------------------
const canSubmit = computed(() => !!declaredIntent.value && !!usageForm.value)
const submitHint = computed(() => {
  if (canSubmit.value) return 'Bereit – beim Start friert SemantIC die Verwendungsform ein.'
  if (!declaredIntent.value && !usageForm.value) return 'Wähl Haltung und Verwendungsform, dann kannst du starten.'
  if (!declaredIntent.value) return 'Es fehlt noch die Haltung.'
  return 'Es fehlt noch die Verwendungsform.'
})
const intentInvalid = computed(() => triedSubmit.value && !declaredIntent.value)
const usageInvalid = computed(() => triedSubmit.value && !usageForm.value)
const errorPreset = computed(() => ERROR_PRESETS[errorKind.value])

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
  if (file) handleFile(file)
}
function onDrop(event: DragEvent) {
  isDragover.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) handleFile(file)
}
function handleFile(file: File) {
  // Etappe-4-Validierung: Typ-Check. (Downscaling/Base64-Budget + too_large = Etappe 6.)
  if (!ACCEPTED.includes(file.type)) {
    errorKind.value = 'unsupported_type'
    state.value = 'upload_error'
    return
  }
  state.value = 'validating'
  const reader = new FileReader()
  reader.onload = () => {
    const dataUrl = reader.result as string
    imageUrl.value = dataUrl
    fileName.value = file.name
    const sizeMb = (file.size / 1024 / 1024).toFixed(1)
    const typeLabel = (file.type.split('/')[1] || '').toUpperCase()
    const img = new Image()
    img.onload = () => {
      fileMeta.value = `${img.naturalWidth} × ${img.naturalHeight} px · ${sizeMb} MB · ${typeLabel}`
    }
    img.onerror = () => {
      fileMeta.value = `${sizeMb} MB · ${typeLabel}`
    }
    img.src = dataUrl
    state.value = 'collecting'
  }
  reader.onerror = () => {
    errorKind.value = 'downscale_failed'
    state.value = 'upload_error'
  }
  reader.readAsDataURL(file)
}

// --- Analyse (Mock; Naht zu Etappe 6) -------------------------------------
let timeoutId: ReturnType<typeof setTimeout> | null = null
let abortController: AbortController | null = null

function onSubmit() {
  if (!canSubmit.value) {
    triedSubmit.value = true
    return
  }
  // usage_form einfrieren (frontend-only, nie im API-Body). Der Composable-Aufruf
  // buildAnalysisViewModel(rawResult, submittedUsageForm.value ?? undefined) folgt
  // in Etappe 6, sobald $fetch einen rohen SemanticAnalysisResult liefert (Etappe 5
  // hat keinen Roh-Input – Verifikation des Composables läuft über /_playground).
  // Cast begründet: usageForm enthält ausschliesslich gültige UsageForm-Werte (USAGE_OPTIONS).
  submittedUsageForm.value = usageForm.value as UsageForm
  runMockAnalysis()
}
function runMockAnalysis() {
  state.value = 'analyzing'
  abortController?.abort()
  abortController = new AbortController()
  const signal = abortController.signal
  // ETAPPE-6-EINSTIEG: Hier ersetzt der echte Pfad den Mock:
  //   const raw = await $fetch<SemanticAnalysisResult>('/api/analyze', { method:'POST', body, signal })
  //   resultVm.value = buildAnalysisViewModel(raw, submittedUsageForm.value ?? undefined)
  // In Etappe 5 bleibt der VM-Passthrough (die Fixtures sind fertige ViewModels,
  // kein roher Result vorhanden) – der Composable ist über /_playground verifiziert.
  timeoutId = setTimeout(() => {
    if (signal.aborted) return
    resultVm.value = RESULT_FIXTURES.yellow ?? null
    state.value = 'result'
  }, 1500)
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
  submittedUsageForm.value = null
  resultVm.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}
function cancelAnalysis() {
  // „Bild entfernen während analyzing" → stiller Rücksprung nach empty (TASKS D2).
  fullReset()
}
function onErrorAction(event: string) {
  if (event === 'reset') fullReset()
  else if (event === 'retry') runMockAnalysis()
  else if (event === 'dismiss') state.value = 'collecting'
  else if (event === 'focusBypass') focusFooterBypass()
}
function focusFooterBypass() {
  // Footer-Bypass liegt im Layout (AppFooter). Etappe 6 hängt die echte Redeem-Logik ein;
  // hier nur scrollen + fokussieren (ID dynamisch via useId → Attribut-Selektor).
  const field = document.querySelector<HTMLInputElement>('.app-footer input[id^="bypass-code"]')
  if (field) {
    field.scrollIntoView({ behavior: 'smooth', block: 'center' })
    field.focus({ preventScroll: true })
  }
}

// --- Dev-Switcher (no-print; in Etappe 8 entfernt) ------------------------
function devSetState(target: StageState, kind?: ErrorKind) {
  if (kind) errorKind.value = kind
  state.value = target
}
function devSetResult(key: keyof typeof RESULT_FIXTURES) {
  resultVm.value = RESULT_FIXTURES[key] ?? null
  submittedUsageForm.value = submittedUsageForm.value ?? 'header'
  state.value = 'result'
}
</script>

<template>
  <div class="page-head">
    <p class="page-kicker">Tool · /analyze</p>
    <h1>Bild prüfen</h1>
    <p class="lead">
      Leg ein KI-generiertes Bild ab, ergänze zwei kurze Angaben zur Verwendung – und SemantIC prüft
      Physik, Semantik und Bias, bevor du es veröffentlichst.
    </p>
  </div>

  <!-- Dev-State-Switcher (NUR Entwicklung, no-print; entfällt in Etappe 8) -->
  <div class="state-switch no-print" role="group" aria-label="Zustand der Eingabe-Maschine umschalten (nur Entwicklung)">
    <span class="state-switch__lab">Zustand</span>
    <button type="button" :aria-pressed="state === 'empty'" @click="devSetState('empty')">empty</button>
    <button type="button" :aria-pressed="state === 'validating'" @click="devSetState('validating')">validating</button>
    <button type="button" :aria-pressed="state === 'collecting'" @click="devSetState('collecting')">collecting</button>
    <button type="button" :aria-pressed="state === 'analyzing'" @click="devSetState('analyzing')">analyzing</button>
    <button type="button" :aria-pressed="state === 'upload_error'" @click="devSetState('upload_error', 'unsupported_type')">upload_error</button>
    <button type="button" :aria-pressed="state === 'analysis_error' && errorKind === 'timeout'" @click="devSetState('analysis_error', 'timeout')">err · timeout</button>
    <button type="button" :aria-pressed="state === 'analysis_error' && errorKind === 'rate_limited'" @click="devSetState('analysis_error', 'rate_limited')">err · 429</button>
    <button type="button" :aria-pressed="state === 'analysis_error' && errorKind === 'provider_error'" @click="devSetState('analysis_error', 'provider_error')">err · provider</button>
    <button type="button" @click="devSetResult('green')">result · green</button>
    <button type="button" @click="devSetResult('yellow')">result · yellow</button>
    <button type="button" @click="devSetResult('red')">result · red</button>
    <button type="button" @click="devSetResult('nullfall')">result · nullfall</button>
    <p class="state-switch__note">
      Nur Entwicklungs-Hilfe: schaltet die Zustandsmaschine durch. Die echte Pipeline-Verkabelung
      (API-Call statt Mock) folgt in Etappe 5/6.
    </p>
  </div>

  <!-- TOOL-STAGE (eine Karte, sieben Zustände) -->
  <section class="stage" :data-state="state" aria-label="Bildprüfung – Eingabe und Ablauf">
    <div class="stage__strip" aria-hidden="true">
      <span>SEMANTIC · INPUT</span>
      <span>
        <span class="step" :class="{ 'is-active': activeStep === 'upload' }">upload</span>
        ·
        <span class="step" :class="{ 'is-active': activeStep === 'angaben' }">angaben</span>
        ·
        <span class="step" :class="{ 'is-active': activeStep === 'analyse' }">analyse</span>
        ·
        <span class="step" :class="{ 'is-active': activeStep === 'befund' }">befund</span>
      </span>
    </div>

    <div class="stage__body">
      <!-- EMPTY + UPLOAD_ERROR teilen die Dropzone -->
      <div v-if="state === 'empty' || state === 'upload_error'">
        <div class="dz-head">
          <h2>Bild prüfen</h2>
          <p class="help">Leg ein KI-generiertes Bild ab oder wähl eine Datei – den Rest fragen wir danach ab.</p>
        </div>

        <div
          class="dropzone"
          :class="{ 'is-dragover': isDragover }"
          tabindex="0"
          role="button"
          aria-label="Bild hierher ziehen oder Datei auswählen. JPEG, PNG oder WebP, bis 3.5 Megabyte."
          @click="triggerPick"
          @keydown.enter.prevent="triggerPick"
          @keydown.space.prevent="triggerPick"
          @dragover.prevent="isDragover = true"
          @dragleave="isDragover = false"
          @drop.prevent="onDrop"
        >
          <div class="dz-default">
            <svg class="dropzone__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M12 16V4m0 0L7 9m5-5 5 5" />
              <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
            <span class="dropzone__primary">Bild hierher ziehen</span>
            <span class="dropzone__or">oder</span>
            <Button variant="secondary" size="sm" class="self-center" @click.stop="triggerPick">Datei auswählen</Button>
            <p class="dropzone__formats">JPEG · PNG · WebP · bis 3.5 MB</p>
          </div>
          <div class="dz-dragmsg" aria-hidden="true">Loslassen, um das Bild zu laden</div>
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
        <h2>Bild wird verarbeitet …</h2>
        <p class="help">Grosse Bilder werden für die Analyse verkleinert – das passiert lokal in deinem Browser.</p>
      </div>

      <!-- COLLECTING -->
      <div v-else-if="state === 'collecting'">
        <div class="preview">
          <div class="preview__imgwrap">
            <img v-if="imageUrl" :src="imageUrl" alt="Vorschau des hochgeladenen Bildes" class="preview__img" />
            <div v-else class="ph-hatch" aria-label="Bildvorschau"><span>Bild · 4:5</span></div>
          </div>
          <div class="preview__meta">
            <span class="preview__label">Dein Bild</span>
            <span class="preview__name">{{ fileName }}</span>
            <span class="preview__dims">{{ fileMeta }}</span>
            <div class="preview__actions">
              <Button variant="ghost" size="sm" @click="removeImage">Bild entfernen</Button>
              <Button variant="secondary" size="sm" @click="triggerPick">Anderes Bild</Button>
            </div>
          </div>
        </div>

        <form class="collect-block" novalidate @submit.prevent="onSubmit">
          <div class="collect-block__head">
            <p class="section-kicker">Schritt 2</p>
            <h2>Angaben zur Verwendung</h2>
            <p class="help lead">
              Zwei kurze Angaben, damit die Empfehlung zu deinem Einsatz passt. Beide sind nötig, bevor du
              starten kannst.
            </p>
            <p class="frame-hint">
              Haltung rahmt die Empfehlung, Verwendungsform ordnet die Strenge ein – beide sind
              Empfehlungs-Einordnung, kein Analyse-Input, und ändern Befund oder Status nicht.
            </p>
          </div>

          <TileSelect
            v-model="declaredIntent"
            name="intent"
            label="Haltung"
            field-help="Welche Funktion hat das Bild in deinem Beitrag?"
            :options="INTENT_OPTIONS"
            :columns="2"
            :invalid="intentInvalid"
            error-message="Es fehlt noch die Haltung."
            class="mt-6"
          />

          <TileSelect
            v-model="usageForm"
            name="usageForm"
            label="Verwendungsform"
            field-help="Wofür ist das Bild gedacht? Das bestimmt, wie streng der Massstab der Empfehlung ist."
            :options="USAGE_OPTIONS"
            :columns="4"
            :invalid="usageInvalid"
            error-message="Es fehlt noch die Verwendungsform."
            class="mt-6"
          />

          <div class="optionals">
            <details class="opt">
              <summary>
                <svg class="opt__chev" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 4l4 4-4 4" /></svg>
                Nutzungskontext hinzufügen
                <span class="mono-note ml-auto">optional</span>
              </summary>
              <div class="opt__body">
                <label class="opt__field-lab" for="ctxField">Nutzungskontext</label>
                <p class="opt__field-help">
                  Wo und wie soll das Bild erscheinen? Ein paar Sätze genügen – das schärft besonders die
                  Bias-Einschätzung.
                </p>
                <textarea
                  id="ctxField"
                  v-model="contextText"
                  class="field"
                  maxlength="2000"
                  placeholder="z. B. Aufmacher zu einem Artikel über Pflegeberufe in einer Tageszeitung"
                />
                <span class="charcount">{{ contextText.length }} / 2000</span>
                <p v-if="!contextText" class="opt__emptyhint">Ohne Nutzungskontext bleibt die Bias-Einschätzung allgemeiner.</p>
              </div>
            </details>

            <details class="opt">
              <summary>
                <svg class="opt__chev" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 4l4 4-4 4" /></svg>
                Original-Prompt hinzufügen
                <span class="mono-note ml-auto">optional</span>
              </summary>
              <div class="opt__body">
                <label class="opt__field-lab" for="promptField">Original-Prompt</label>
                <p class="opt__field-help">Der Text, mit dem das Bild generiert wurde. Hilft, die Bias-Achsen genauer abzuleiten.</p>
                <textarea
                  id="promptField"
                  v-model="promptText"
                  class="field"
                  maxlength="2000"
                  placeholder="z. B. a professional nurse in a hospital, photorealistic, soft light"
                />
                <span class="charcount">{{ promptText.length }} / 2000</span>
              </div>
            </details>
          </div>

          <div class="submit-bar">
            <div class="submit-bar__row">
              <Button type="submit" variant="primary" :disabled="!canSubmit">Analyse starten</Button>
              <p class="submit-hint" :class="{ 'submit-hint--blocked': !canSubmit }">{{ submitHint }}</p>
            </div>
            <p class="help-sm">
              Beim Start friert SemantIC die Verwendungsform ein.
              <span class="mono-note">usage_form bleibt frontend-only – nie im API-Body.</span>
            </p>
          </div>
        </form>
      </div>

      <!-- ANALYZING -->
      <div v-else-if="state === 'analyzing'">
        <WaitState />
        <div class="cancel-row">
          <Button variant="ghost" size="sm" @click="cancelAnalysis">Analyse abbrechen</Button>
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

      <!-- RESULT (BefundKarte rendert den vollen Report) -->
      <div v-else-if="state === 'result' && resultVm">
        <BefundKarte
          :vm="resultVm"
          :image-url="imageUrl"
          :submitted-usage-form="submittedUsageForm"
          sample-id="SEMANTIC"
          image-aspect="4:5"
        />
        <div class="result-actions">
          <Button variant="secondary" @click="fullReset">Neues Bild prüfen</Button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-head {
  max-width: 760px;
  margin: 0 auto 8px;
}
.page-kicker {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 500;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--subtle);
}
.page-head h1 {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: 26px;
  letter-spacing: -0.02em;
  margin-top: 6px;
  color: var(--ink);
}
.page-head .lead {
  color: var(--muted);
  font-size: 15px;
  margin-top: 8px;
  max-width: var(--container-text);
}

/* Dev-State-Switcher (no-print) */
.state-switch {
  max-width: 760px;
  margin: 24px auto 8px;
  padding: 14px 16px;
  border: 1px dashed var(--line-strong);
  border-radius: var(--r);
  background: var(--canvas);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.state-switch__lab {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  margin-right: 8px;
}
.state-switch button {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r);
  padding: 6px 10px;
  cursor: pointer;
  line-height: 1.2;
  transition: background 0.12s ease, border-color 0.12s ease;
}
.state-switch button:hover {
  border-color: var(--ink);
}
.state-switch button[aria-pressed='true'] {
  background: var(--ink);
  color: var(--surface);
  border-color: var(--ink);
}
.state-switch button:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
}
.state-switch__note {
  flex-basis: 100%;
  font-size: 12px;
  color: var(--muted);
  margin-top: 4px;
}

/* Tool-Stage */
.stage {
  max-width: 760px;
  margin-inline: auto;
  background: var(--surface);
  border: 1.5px solid var(--ink);
  border-radius: var(--r);
  overflow: hidden;
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
.help-sm {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.5;
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
.dz-dragmsg {
  display: none;
  font-weight: 600;
  font-size: 16px;
  color: var(--ink);
}
.dropzone.is-dragover .dz-default {
  display: none;
}
.dropzone.is-dragover .dz-dragmsg {
  display: block;
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
.frame-hint {
  margin-top: 12px;
  padding: 11px 14px;
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--surface-2);
  font-size: 12.5px;
  color: var(--ink-soft);
  line-height: 1.55;
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
</style>
