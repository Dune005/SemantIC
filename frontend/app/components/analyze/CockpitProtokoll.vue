<script setup lang="ts">
// CockpitProtokoll (Etappe 2) – „04 · Prüfprotokoll" mit drei Tabs (reka-ui: ARIA +
// Pfeiltasten gratis). Bildbefunde (userHints, jede Zeile „unverifiziert"), Bias-Achsen
// (Beobachtung↔Interpretation getrennt), Kontext & Wirkung. Daten render-fertig vom Root.
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from 'reka-ui'
import { useReportT } from '~/composables/useReportT'

interface FindingRow {
  id: string
  category: string
  text: string
  severityWord: string
  severityTone: 'crit' | 'warn' | 'minor'
}
interface MaskingNote {
  text: string
  links: { code: string; label: string; area: string }[]
}
interface BiasAxis {
  label: string
  meta: string[]
  pairs: { observation: string; interpretation: string; supports: boolean }[]
}
interface ContextItem {
  k: string
  v: string
  tone: string
}
interface ContextData {
  items: ContextItem[]
  drivers: { code: string; label: string }[]
  normative: { verdictWord: string; reasoning: string; aspects: string[] } | null
  notes: string[]
}

defineProps<{
  findings: FindingRow[]
  maskingNote: MaskingNote | null
  biasAxes: BiasAxis[]
  context: ContextData
  readingModeMaskingLogic: string | null
  counts: { findings: number; bias: number }
}>()

// Statik in der eingefrorenen Report-Sprache (nicht UI-Locale).
const { rt } = useReportT()
</script>

<template>
  <section class="evidence-section is-reveal" aria-labelledby="evidence-title">
    <TabsRoot default-value="findings">
      <div class="evidence-section__head">
        <div class="evidence-section__title">
          <div>
            <p class="eyebrow">{{ rt('report.protokoll.eyebrow') }}</p>
            <h2 id="evidence-title">{{ rt('report.protokoll.title') }}</h2>
          </div>
          <p class="evidence-section__note">
            {{ rt('report.protokoll.note') }}
          </p>
        </div>
        <TabsList class="tabs" :aria-label="rt('report.protokoll.tabsAria')">
          <TabsTrigger value="findings" class="tab">{{ rt('report.protokoll.tabFindings', { n: counts.findings }) }}</TabsTrigger>
          <TabsTrigger value="bias" class="tab">{{ rt('report.protokoll.tabBias', { n: counts.bias }) }}</TabsTrigger>
          <TabsTrigger value="context" class="tab">{{ rt('report.protokoll.tabContext') }}</TabsTrigger>
        </TabsList>
      </div>

      <div class="tabpanels">
        <!-- Tab 1: Bildbefunde -->
        <TabsContent value="findings" class="tabpanel">
          <div class="findings-layout">
            <div class="finding-list">
              <article v-for="f in findings" :key="f.id" class="finding-row">
                <span class="finding-row__id">{{ f.id }}</span>
                <span>
                  <span class="finding-row__cat">{{ f.category }}</span>
                  <span class="finding-row__text">{{ f.text }}</span>
                </span>
                <span class="finding-row__flags">
                  <span class="severity" :class="`severity--${f.severityTone}`">{{ f.severityWord }}</span>
                  <span class="claim-tag">{{ rt('report.common.unverified') }}</span>
                </span>
              </article>
              <p v-if="!findings.length" class="panel-empty">{{ rt('report.protokoll.noFindings') }}</p>
            </div>
            <aside v-if="maskingNote" class="masking-note">
              <p class="eyebrow">{{ rt('report.protokoll.maskingEyebrow') }}</p>
              <h3>{{ rt('report.protokoll.maskingTitle') }}</h3>
              <p>{{ maskingNote.text }}</p>
              <div v-if="maskingNote.links.length" class="driver-links">
                <div v-for="(l, i) in maskingNote.links" :key="`${l.code}-${i}`" class="driver-link">
                  <b>{{ l.code }}</b><span>{{ l.label }} → {{ l.area }}</span>
                </div>
              </div>
            </aside>
          </div>
        </TabsContent>

        <!-- Tab 2: Bias-Achsen -->
        <TabsContent value="bias" class="tabpanel">
          <p v-if="readingModeMaskingLogic" class="leseart-note">
            <span class="leseart-note__label">{{ rt('report.protokoll.readingModeLogicLabel') }}</span>
            {{ readingModeMaskingLogic }}
          </p>
          <div v-if="biasAxes.length" class="bias-grid">
            <article v-for="(ax, i) in biasAxes" :key="i" class="axis-card">
              <div class="axis-card__head">
                <h3>{{ ax.label }}</h3>
                <div class="axis-meta"><span v-for="(m, j) in ax.meta" :key="j">{{ m }}</span></div>
              </div>
              <div class="axis-card__body">
                <template v-for="(p, j) in ax.pairs" :key="j">
                  <div class="evidence-pair">
                    <span class="evidence-pair__label">{{ rt('report.common.observation') }}</span>
                    <p>{{ p.observation }}</p>
                  </div>
                  <div class="evidence-pair">
                    <span class="evidence-pair__label">{{ rt('report.common.interpretation') }}</span>
                    <p>{{ p.interpretation }}</p>
                  </div>
                  <div class="support">
                    {{ p.supports ? rt('report.protokoll.supportsBias') : rt('report.protokoll.supportsNoBias') }}
                  </div>
                </template>
              </div>
            </article>
          </div>
          <p v-else class="panel-empty">{{ rt('report.protokoll.noBiasAxes') }}</p>
        </TabsContent>

        <!-- Tab 3: Kontext & Wirkung -->
        <TabsContent value="context" class="tabpanel">
          <div class="context-grid">
            <div>
              <p class="eyebrow">{{ rt('report.protokoll.editorialContext') }}</p>
              <ul class="context-list">
                <li v-for="(it, i) in context.items" :key="i">
                  <span>{{ it.k }}</span>
                  <strong :class="`ctx-tone--${it.tone}`">{{ it.v }}</strong>
                </li>
              </ul>
            </div>
            <div>
              <p class="eyebrow">{{ rt('report.protokoll.visualDrivers') }}</p>
              <div v-if="context.drivers.length" class="chips">
                <span v-for="d in context.drivers" :key="d.code" class="chip"><b>{{ d.code }}</b>{{ d.label }}</span>
              </div>
              <p v-else class="panel-empty">{{ rt('report.protokoll.noDrivers') }}</p>
              <div v-if="context.normative" class="normative">
                <strong>{{ rt('report.protokoll.normativeTitle', { verdict: context.normative.verdictWord }) }}</strong>
                <div v-if="context.normative.aspects.length" class="chips normative__aspects">
                  <span v-for="a in context.normative.aspects" :key="a" class="chip">{{ a }}</span>
                </div>
                <p>{{ context.normative.reasoning }}</p>
              </div>
              <div v-for="(n, i) in context.notes" :key="i" class="ctx-note">{{ n }}</div>
            </div>
          </div>
        </TabsContent>
      </div>
    </TabsRoot>
  </section>
</template>

<style scoped>
.evidence-section {
  margin-top: 30px;
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--surface);
  overflow: hidden;
}
.evidence-section__head {
  padding: 24px 26px 0;
  background: var(--canvas);
}
.evidence-section__title {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
}
.eyebrow {
  margin: 0;
  color: var(--subtle);
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
.evidence-section h2 {
  margin: 7px 0 0;
  font-size: 25px;
  line-height: 1.15;
  letter-spacing: -0.025em;
}
.evidence-section__note {
  max-width: 45ch;
  margin: 0;
  color: var(--muted);
  font-size: 12.5px;
  text-align: right;
}
.tabs {
  display: flex;
  gap: 0;
  margin-top: 22px;
  overflow-x: auto;
  border-bottom: 1px solid var(--line);
}
.tab {
  min-height: 44px;
  padding: 10px 17px;
  border: 0;
  border-top: 2px solid transparent;
  border-right: 1px solid var(--line-soft);
  background: transparent;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
}
.tab:hover {
  color: var(--ink);
}
.tab[data-state='active'] {
  border-top-color: var(--ink);
  background: var(--surface);
  color: var(--ink);
}
.tab:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: -2px;
}
.tabpanels {
  padding: 26px;
}
.tabpanel[hidden] {
  display: none;
}
.panel-empty {
  margin: 0;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 12px;
}
.findings-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.75fr);
  gap: 28px;
  align-items: start;
}
.finding-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.finding-row {
  padding: 15px;
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--surface);
  color: var(--ink);
  text-align: left;
}
.finding-row__id {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border: 1px solid var(--line-strong);
  border-radius: 50%;
  background: var(--surface-2);
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 600;
}
.finding-row__cat {
  display: block;
  margin-bottom: 3px;
  color: var(--subtle);
  font-family: var(--mono);
  font-size: 9.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.finding-row__text {
  font-size: 13.5px;
  line-height: 1.5;
}
.severity {
  padding: 3px 6px;
  border: 1px solid var(--warn);
  border-radius: 2px;
  color: var(--warn-ink);
  font-family: var(--mono);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
}
.severity--minor {
  border-color: var(--line-strong);
  color: var(--muted);
}
.severity--crit {
  border-color: var(--crit);
  color: var(--crit-ink);
}
.finding-row__flags {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}
.claim-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: var(--mono);
  font-size: 9.5px;
  font-weight: 500;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--muted);
  white-space: nowrap;
}
.claim-tag::before {
  content: '';
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--line-strong);
  flex: none;
}
.masking-note {
  padding: 19px;
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--canvas);
}
.masking-note h3 {
  margin: 8px 0 10px;
  font-size: 18px;
  line-height: 1.2;
}
.masking-note p {
  margin: 0;
  color: var(--ink-soft);
  font-size: 13.5px;
}
.driver-links {
  margin-top: 16px;
  padding-top: 13px;
  border-top: 1px solid var(--line);
}
.driver-link {
  display: grid;
  grid-template-columns: 30px 1fr;
  gap: 8px;
  padding: 7px 0;
  color: var(--muted);
  font-size: 12px;
}
.driver-link b {
  font-family: var(--mono);
  color: var(--ink);
}
.leseart-note {
  margin: 0 0 18px;
  padding: 13px 15px;
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--canvas);
  color: var(--ink-soft);
  font-size: 13px;
  line-height: 1.55;
}
.leseart-note__label {
  display: block;
  margin-bottom: 5px;
  color: var(--subtle);
  font-family: var(--mono);
  font-size: 9.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.bias-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.axis-card {
  border: 1px solid var(--line);
  border-radius: var(--r);
  overflow: hidden;
}
.axis-card__head {
  padding: 14px 15px;
  background: var(--canvas);
  border-bottom: 1px solid var(--line);
}
.axis-card__head h3 {
  margin: 0 0 6px;
  font-size: 15px;
}
.axis-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  color: var(--subtle);
  font-family: var(--mono);
  font-size: 9.5px;
  text-transform: uppercase;
}
.axis-card__body {
  padding: 15px;
}
.evidence-pair {
  display: grid;
  grid-template-columns: 92px 1fr;
  gap: 8px 12px;
  font-size: 13px;
}
.evidence-pair + .evidence-pair {
  margin-top: 13px;
  padding-top: 13px;
  border-top: 1px solid var(--line-soft);
}
.evidence-pair__label {
  font-family: var(--mono);
  font-size: 9.5px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--subtle);
}
.evidence-pair p {
  margin: 0;
  color: var(--ink-soft);
}
.support {
  margin-top: 13px;
  padding-top: 10px;
  border-top: 1px solid var(--line-soft);
  color: var(--muted);
  font-family: var(--mono);
  font-size: 10px;
}
.context-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
}
.context-list {
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}
.context-list li {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 10px 0;
  border-top: 1px solid var(--line-soft);
  font-size: 13px;
}
.context-list span:first-child {
  color: var(--muted);
}
.context-list strong {
  text-align: right;
  font-weight: 600;
}
.ctx-tone--safe {
  color: var(--safe-ink);
}
.ctx-tone--warn {
  color: var(--warn-ink);
}
.ctx-tone--crit {
  color: var(--crit-ink);
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 13px;
}
.chip {
  padding: 5px 8px;
  border: 1px solid var(--line-strong);
  border-radius: 3px;
  background: var(--surface);
  color: var(--ink-soft);
  font-family: var(--mono);
  font-size: 10px;
}
.chip b {
  margin-right: 5px;
  color: var(--muted);
}
.normative {
  margin-top: 20px;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--canvas);
}
.normative strong {
  display: block;
  margin-bottom: 6px;
}
.normative__aspects {
  margin-bottom: 10px;
}
.normative p {
  margin: 0;
  color: var(--ink-soft);
  font-size: 13px;
}
.ctx-note {
  margin-top: 12px;
  padding: 12px 14px;
  border: 1px solid var(--line-soft);
  border-radius: var(--r);
  color: var(--muted);
  font-size: 12.5px;
  line-height: 1.5;
}
.is-reveal {
  opacity: 0;
  transform: translateY(10px);
  animation: rise 0.55s cubic-bezier(0.2, 0.7, 0.2, 1) 0.22s forwards;
}
@keyframes rise {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .is-reveal {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
@media (max-width: 760px) {
  .findings-layout,
  .bias-grid,
  .context-grid {
    grid-template-columns: 1fr;
  }
  .evidence-section__title {
    flex-direction: column;
    align-items: start;
    gap: 8px;
  }
  .evidence-section__note {
    text-align: left;
  }
}
/* Phones: die Severity-/„unverifiziert"-Flags auf eine eigene Zeile legen, damit der
   Befundtext die volle Breite bekommt (sonst zerfasert er in einer ~98px-Spalte). */
@media (max-width: 560px) {
  .finding-row {
    grid-template-columns: 34px minmax(0, 1fr);
  }
  .finding-row__flags {
    grid-column: 1 / -1;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    margin-top: 2px;
  }
  /* Bias-Achsen: Beobachtung/Interpretation – Label über den Text stapeln statt in eine
     92px-Spalte (sonst nur ~145px Textbreite). */
  .evidence-pair {
    grid-template-columns: 1fr;
    gap: 3px 0;
  }
  /* Tab-Leiste: die drei Tabs passen bei Phone-Breite nicht nebeneinander (448px vs ~281px) –
     statt horizontalem Scroll mit abgeschnittenem 3. Tab → gleich breite, zentrierte Tabs, die
     bei Bedarf zweizeilig umbrechen. Kein Scroll, nichts verdeckt. */
  .tabs {
    overflow-x: visible;
  }
  .tab {
    flex: 1 1 0;
    min-width: 0;
    padding: 8px 6px;
    font-size: 9.5px;
    letter-spacing: 0.03em;
    white-space: normal;
    text-align: center;
    line-height: 1.3;
  }
  .tab:last-child {
    border-right: 0;
  }
}
</style>
