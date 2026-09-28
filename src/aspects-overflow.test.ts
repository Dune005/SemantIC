// Regressionstest: Modell liefert mehr als 3 normative_masking.aspects (gemini-3-flash-preview
// bei FL_CEO_04, 2026-09-28). Die Analyse darf daran nicht scheitern; gekürzt wird nur dieses Feld.
// Ausführen: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { truncateAspectsOverflow } from './analyze.js'

const withAspects = (aspects: string[]) => JSON.stringify({
  research_layer: { normative_masking: { verdict: 'high', aspects, reasoning: 'x' }, reading_mode: 'WA' },
  integrity_score_llm: { score: 52, reasoning: 'y' },
})

test('kürzt 4 Aspekte auf die ersten 3 und meldet die ursprüngliche Anzahl', () => {
  const r = truncateAspectsOverflow(withAspects(['beauty_ideal', 'lifestyle_aspiration', 'gender_norm', 'success_norm']))
  assert.ok(r)
  assert.equal(r.before, 4)
  const parsed = JSON.parse(r.text)
  assert.deepEqual(parsed.research_layer.normative_masking.aspects, ['beauty_ideal', 'lifestyle_aspiration', 'gender_norm'])
})

test('lässt alle anderen Felder unverändert', () => {
  const r = truncateAspectsOverflow(withAspects(['beauty_ideal', 'lifestyle_aspiration', 'gender_norm', 'success_norm']))!
  const parsed = JSON.parse(r.text)
  assert.equal(parsed.research_layer.normative_masking.verdict, 'high')
  assert.equal(parsed.research_layer.reading_mode, 'WA')
  assert.deepEqual(parsed.integrity_score_llm, { score: 52, reasoning: 'y' })
})

test('greift nicht bei höchstens 3 Aspekten', () => {
  assert.equal(truncateAspectsOverflow(withAspects(['beauty_ideal', 'gender_norm', 'success_norm'])), null)
  assert.equal(truncateAspectsOverflow(withAspects([])), null)
})

test('greift nicht, wenn ein Aspekt ungültig ist – der Schemafehler bleibt sichtbar', () => {
  assert.equal(truncateAspectsOverflow(withAspects(['beauty_ideal', 'gender_norm', 'success_norm', 'INVALID'])), null)
  assert.equal(truncateAspectsOverflow(JSON.stringify({ research_layer: { normative_masking: { aspects: ['beauty_ideal', 'gender_norm', 'success_norm', 42] } } })), null)
})

test('greift nicht bei ungültigem JSON oder fehlendem Feld', () => {
  assert.equal(truncateAspectsOverflow('{kein json'), null)
  assert.equal(truncateAspectsOverflow(JSON.stringify({ research_layer: {} })), null)
})
