<script setup lang="ts">
// TEMPORÄRE Dev-Preview (Diagnose-Cockpit). Rendert ECHTE Pipeline-Fixtures (nicht ein
// Live-/analyze-Lauf) durch das ViewModel ins Cockpit – für Screenshot/DoD/Etappe-4-Härtung.
// Fall-Umschalter über ?case=full|empty|heavy|derived. ReportPrintView ist mitgerendert
// (im Druck sichtbar, Cockpit im Druck ausgeblendet), damit der Druck je Fall prüfbar ist.
// Fixtures werden zur Laufzeit gegen die Zod-Schemas geprüft (Codex: der reine Cast versteckt
// kaputte Fixtures vor dem Typecheck). Assets unter app/_dev/ + public/_dev/. VOR MERGE entfernen.
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { SemanticAnalysisResult } from '@pipeline/analyze'
import { AnalysisSchema } from '@pipeline/schemas/analysis'
import { AestheticSchema } from '@pipeline/schemas/aesthetic'
import { buildAnalysisViewModel } from '~/composables/useAnalysisView'
import DiagnoseCockpit from '~/components/analyze/DiagnoseCockpit.vue'
import ReportPrintView from '~/components/analyze/ReportPrintView.vue'
import fullJson from '~/_dev/cockpit-fixture.json'
import emptyJson from '~/_dev/cockpit-fixture-empty.json'
import heavyJson from '~/_dev/cockpit-fixture-heavy.json'
import derivedJson from '~/_dev/cockpit-fixture-derived.json'

definePageMeta({ layout: false })

const CASES = {
  full: fullJson,
  empty: emptyJson,
  heavy: heavyJson,
  derived: derivedJson,
} as const
type CaseKey = keyof typeof CASES

// Fallabhängiger Submit-State (frontend-only, nicht im Fixture-JSON), passend zur
// input_completeness der jeweiligen Fixture – damit Block 2 im Druck nicht „nicht angegeben"
// zeigt, während input_completeness „vorhanden" meldet (Codex).
const SUBMIT: Record<CaseKey, { context: string | null; prompt: string | null }> = {
  full: { context: 'Artikel über den Fachkräftemangel im Schweizer Gesundheitswesen (Symbolbild).', prompt: null },
  empty: { context: null, prompt: null },
  heavy: {
    context: 'Reportage über Hochleistungsmedizin und den OP-Alltag in Schweizer Spitälern.',
    prompt: 'cinematic photo of a focused surgeon in a high-tech operating room, dramatic lighting, shallow depth of field',
  },
  derived: { context: 'Beitrag über Führungskultur und Rollenbilder in Kliniken.', prompt: null },
}

const route = useRoute()
const activeCase = computed<CaseKey>(() => {
  const c = String(route.query.case ?? 'full')
  return (Object.hasOwn(CASES, c) ? c : 'full') as CaseKey
})
const submit = computed(() => SUBMIT[activeCase.value])

// Laufzeit-Validierung: bricht laut ab, wenn eine TEMP-Fixture nicht schemakonform ist.
const fixture = computed<SemanticAnalysisResult>(() => {
  const raw = CASES[activeCase.value] as Record<string, unknown>
  AnalysisSchema.parse(raw.analysis)
  AestheticSchema.parse(raw.aesthetic)
  return raw as unknown as SemanticAnalysisResult
})

const vm = computed(() => buildAnalysisViewModel(fixture.value, 'editorial'))
const heroScore = computed(() => vm.value.integrityScore)
</script>

<template>
  <div class="cockpit-preview">
    <nav class="case-switch" aria-label="Fixture-Fall (TEMP)">
      <a v-for="key in (['full', 'empty', 'heavy', 'derived'] as const)" :key="key"
         :href="`?case=${key}`" :class="{ 'is-active': activeCase === key }">{{ key }}</a>
    </nav>
    <DiagnoseCockpit
      class="cockpit-screen"
      :vm="vm"
      :image-url="activeCase === 'empty' ? null : '/_dev/cockpit-befund.jpeg'"
      submitted-usage-form="editorial"
      :submitted-context="submit.context"
      :submitted-prompt="submit.prompt"
      timestamp="Analyse · echte Pipeline-Fixture"
    />
    <ReportPrintView
      :view-model="vm"
      :hero-score="heroScore"
      generated-at="21.06.2026"
      :image-url="activeCase === 'empty' ? null : '/_dev/cockpit-befund.jpeg'"
      submitted-usage-form="editorial"
      :submitted-context="submit.context"
      :submitted-prompt="submit.prompt"
    />
  </div>
</template>

<style scoped>
.cockpit-preview {
  min-height: 100vh;
  background: var(--page-bg);
  color: var(--ink);
}
.case-switch {
  display: flex;
  gap: 8px;
  padding: 10px clamp(20px, 4vw, 48px);
  font-family: var(--mono);
  font-size: 12px;
}
.case-switch a {
  padding: 4px 10px;
  border: 1px solid var(--line-strong);
  border-radius: 4px;
  color: var(--muted);
  text-decoration: none;
}
.case-switch a.is-active {
  border-color: var(--ink);
  color: var(--ink);
}
@media print {
  .case-switch,
  .cockpit-screen {
    display: none !important;
  }
}
</style>
