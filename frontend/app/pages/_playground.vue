<script setup lang="ts">
// DEV-WERKZEUG (Etappe 1/2): visuelle Kontrolle von Design-System + Komponenten.
// Nicht Teil des Produkts – wird in Etappe 8 entfernt.
import { severityFor, SEVERITY_WORD, STATUS_WORD, DIMENSION_LABELS, READING_MODE_DESC } from '~/lib/severity'

const scores = [88, 64, 28]
const tokens = [
  { name: '--canvas', cls: 'bg-canvas' },
  { name: '--surface', cls: 'bg-surface' },
  { name: '--surface-2', cls: 'bg-surface-2' },
  { name: '--page-bg', cls: 'bg-page-bg' },
]
const severities = [
  { sev: 'safe', dot: 'bg-safe', ink: 'text-safe-ink' },
  { sev: 'warn', dot: 'bg-warn', ink: 'text-warn-ink' },
  { sev: 'crit', dot: 'bg-crit', ink: 'text-crit-ink' },
] as const
</script>

<template>
  <main class="mx-auto max-w-[var(--container)] px-[var(--gutter)] py-12 text-ink">
    <p class="mono text-subtle text-xs uppercase tracking-wider">Design-System-Check · Etappe 1</p>
    <h1 class="mt-1 text-[26px] font-bold tracking-tight">Überzeugend ist nicht genug.</h1>
    <p class="mt-2 text-muted">IBM Plex Sans als Body-Schrift. <span class="mono">IBM Plex Mono · 0123456789</span> mit tnum.</p>

    <!-- Flächen-Tokens -->
    <section class="mt-8">
      <h2 class="text-[20px] font-bold">Flächen-Tokens</h2>
      <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div v-for="t in tokens" :key="t.name" :class="['rounded border border-line p-4', t.cls]">
          <span class="mono text-xs">{{ t.name }}</span>
        </div>
      </div>
    </section>

    <!-- Severity-Ampel (Doppelkodierung Farbe + Wort) -->
    <section class="mt-8">
      <h2 class="text-[20px] font-bold">Severity – Doppelkodierung</h2>
      <div class="mt-3 flex flex-wrap gap-4">
        <div v-for="s in severities" :key="s.sev" class="flex items-center gap-2 rounded border border-line bg-surface px-3 py-2">
          <span :class="['inline-block h-3 w-3 rounded-full', s.dot]" />
          <span :class="['mono text-sm font-semibold', s.ink]">{{ SEVERITY_WORD[s.sev] }}</span>
        </div>
      </div>
      <div class="mt-3 flex flex-wrap gap-3">
        <div v-for="sc in scores" :key="sc" class="rounded border border-line bg-surface px-3 py-2">
          <span class="mono text-sm">score {{ sc }} → {{ severityFor(sc) }} · {{ SEVERITY_WORD[severityFor(sc)] }}</span>
        </div>
      </div>
    </section>

    <!-- Status-Wörter + Leseart -->
    <section class="mt-8">
      <h2 class="text-[20px] font-bold">Status & Labels</h2>
      <p class="mt-2 text-muted">Status: {{ STATUS_WORD.green }} / {{ STATUS_WORD.yellow }} / {{ STATUS_WORD.red }}</p>
      <p class="text-muted">Dimensionen: {{ DIMENSION_LABELS.physics }}, {{ DIMENSION_LABELS.semantics }}, {{ DIMENSION_LABELS.bias }}</p>
      <p class="mt-2 text-sm text-muted">{{ READING_MODE_DESC.WA }}</p>
    </section>

    <!-- Fokusring (Tab drücken) -->
    <section class="mt-8">
      <h2 class="text-[20px] font-bold">Fokus-State</h2>
      <button type="button" class="mt-3 rounded border border-ink bg-surface px-4 py-2 font-semibold">
        Tab-Fokus zeigt --ink-Ring
      </button>
    </section>
  </main>
</template>
