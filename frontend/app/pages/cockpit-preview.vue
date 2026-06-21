<script setup lang="ts">
// TEMPORÄRE Dev-Preview (Diagnose-Cockpit, Etappe 2). Rendert eine ECHTE Pipeline-Fixture
// (nicht ein Live-/analyze-Lauf) durch das ViewModel ins Cockpit – für Screenshot/DoD.
// JSON direkt importiert (Cast auf SemanticAnalysisResult); Bild als public-Asset.
// Assets unter app/_dev/ + public/_dev/. VOR MERGE entfernen/absichern.
import { computed } from 'vue'
import type { SemanticAnalysisResult } from '@pipeline/analyze'
import { buildAnalysisViewModel } from '~/composables/useAnalysisView'
import DiagnoseCockpit from '~/components/analyze/DiagnoseCockpit.vue'
import fixtureJson from '~/_dev/cockpit-fixture.json'

definePageMeta({ layout: false })

const fixture = fixtureJson as unknown as SemanticAnalysisResult
const vm = computed(() => buildAnalysisViewModel(fixture, 'editorial'))
</script>

<template>
  <div class="cockpit-preview">
    <DiagnoseCockpit
      :vm="vm"
      image-url="/_dev/cockpit-befund.jpeg"
      submitted-usage-form="editorial"
      timestamp="Analyse · echte Pipeline-Fixture"
    />
  </div>
</template>

<style scoped>
.cockpit-preview {
  min-height: 100vh;
  background: var(--page-bg);
  color: var(--ink);
}
</style>
