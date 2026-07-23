<script setup lang="ts">
// Cockpit-Hero – Verdikt-Block + Integritäts-Panel + aufklappbare Dimensions-Lasche.
// Produktive Hero-Section (ex Variante 10 „Lasche"). Status-getrieben über eine einzige
// --bar/--bar-ink-Variable je Severity; Count-up via useCountUp; Score-Zahl bleibt neutral, die
// Farbe kommt vom gelieferten Status. Eine gemergte Kachel (vorne) sitzt über einer hellgrauen
// Lasche (--surface-2), die leicht dahinter getuckt ist und die 3 Dimensionen nach unten
// herausfährt. Tiefe über Flächenwechsel + Überlappung, dazu ein bewusster dezenter box-shadow
// auf .la-card (einzige gewollte Variante-C-Schatten-Ausnahme).
// Default eingeklappt; weiches Aufklappen (grid-template-rows 0fr↔1fr); a11y via
// aria-expanded/-controls + inert. Label-Texte überlagert → konstante Breite, Chips springen nicht.
import { computed, ref, toRef } from 'vue'
import type { Severity } from '~/lib/severity'
import type { DimensionStatus } from '~/types/analysis'
import { useCountUp } from '~/composables/useCountUp'
import { useReportT } from '~/composables/useReportT'

interface HeroDim {
  key: 'physics' | 'semantics' | 'bias'
  name: string
  desc: string
  score: number
  severity: Severity
  word: string
}

const props = defineProps<{
  status: DimensionStatus
  severity: Severity
  statusWord: string
  headline: string
  lead: string
  metaText: string
  integrity: number
  aesthetic: number
  readingModeLabel: string
  dims: HeroDim[]
}>()

// Statik in der eingefrorenen Report-Sprache (nicht UI-Locale).
const { rt } = useReportT()

const clampPct = (n: number) => Math.max(0, Math.min(100, n))
const integrityDisplay = useCountUp(toRef(props, 'integrity'), { duration: 1100, delay: 200 })
const dimDisplays = [0, 1, 2].map((i) =>
  useCountUp(
    computed(() => props.dims[i]?.score ?? 0),
    { duration: 900, delay: 400 + i * 100 },
  ),
)

const open = ref(false)
</script>

<template>
  <section class="la is-reveal" :class="`la--${severity}`" aria-labelledby="cockpit-verdict-title">
    <!-- EINE gemergte Kachel (vorne, deckt die Lasche dahinter) -->
    <div class="la-card">
      <div class="la-card__verdict">
        <span class="la-status"><span class="la-status__dot" aria-hidden="true" />{{ statusWord }}</span>
        <h1 id="cockpit-verdict-title" class="la-headline">{{ headline }}<span class="la-point">.</span></h1>
        <p class="la-lead">{{ lead }}</p>
        <div class="la-rule" aria-hidden="true" />
        <p class="la-meta">{{ metaText }}</p>
      </div>

      <div class="la-card__score">
        <div class="la-corner" aria-hidden="true">
          <svg
            class="la-corner__mark"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
            focusable="false"
          >
            <path v-if="severity === 'safe'" d="M5 12.5l4.5 4.5L19 6.5" />
            <g v-else-if="severity === 'crit'">
              <path d="M6.5 6.5l11 11" />
              <path d="M17.5 6.5l-11 11" />
            </g>
            <g v-else>
              <path d="M12 4.5v9.5" />
              <circle cx="12" cy="18.6" r="1.2" fill="currentColor" stroke="none" />
            </g>
          </svg>
        </div>

        <p class="la-eyebrow">{{ rt('report.common.integrity') }}</p>
        <div class="la-score__head">
          <span class="la-score__num">{{ integrityDisplay }}</span><span class="la-score__den">/ 100</span>
        </div>
        <div
          class="la-bar"
          role="meter"
          :aria-label="rt('report.common.integrity')"
          :aria-valuenow="clampPct(integrity)"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuetext="rt('report.common.scoreOf100', { name: rt('report.common.integrity'), n: clampPct(integrity) })"
          :style="{ '--fill': `${clampPct(integrity)}%` }"
        >
          <span class="la-bar__fill" />
          <span class="la-bar__marker" :style="{ left: `${clampPct(integrity)}%` }" />
        </div>
        <div class="la-bar__ends" aria-hidden="true"><span>0</span><span>50</span><span>100</span></div>
        <div class="la-lines">
          <div class="la-line">
            <span class="la-line__k">{{ rt('report.common.aesthetic') }}</span>
            <span class="la-line__v">{{ aesthetic }} / 100<em class="la-line__note">{{ rt('report.common.noVerdict') }}</em></span>
          </div>
          <div class="la-line">
            <span class="la-line__k">{{ rt('report.common.readingMode') }}</span>
            <span class="la-line__v">{{ readingModeLabel }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- LASCHE: hellgrau, sitzt hinter der Kachel, faehrt nach unten heraus -->
    <div class="la-drawer" :class="{ 'is-open': open }">
      <button
        type="button"
        class="la-tab"
        :aria-expanded="open"
        aria-controls="la-dimwrap"
        @click="open = !open"
      >
        <span class="la-tab__label">
          <span class="la-tab__show">{{ rt('report.verdikt.showDims') }}</span>
          <span class="la-tab__hide">{{ rt('report.verdikt.hideDims') }}</span>
        </span>
        <span class="la-tab__preview" aria-hidden="true">
          <span v-for="d in dims" :key="d.key" class="la-tab__chip" :class="`tint-${d.severity}`">
            <span class="la-tab__dot" />{{ d.name }}
          </span>
        </span>
        <svg
          class="la-chev"
          viewBox="0 0 24 24"
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M5 9l7 7 7-7" />
        </svg>
      </button>

      <div id="la-dimwrap" class="la-dimwrap" :class="{ 'is-collapsed': !open }" :inert="!open">
        <div class="la-dimgrid" :aria-label="rt('report.verdikt.dimsAria')">
          <div v-for="(d, i) in dims" :key="d.key" class="la-dim" :class="`tint-${d.severity}`">
            <p class="la-dim__name">{{ d.name }}</p>
            <p class="la-dim__desc">{{ d.desc }}</p>
            <p class="la-dim__row">
              <span class="la-dim__score">{{ dimDisplays[i]?.value ?? d.score }}</span>
              <span class="la-dim__den">/ 100</span>
              <span class="la-dim__state" :class="`la-dim__state--${d.severity}`">{{ d.word }}</span>
            </p>
            <div
              class="la-dim__gauge"
              role="meter"
              :aria-label="d.name"
              :aria-valuenow="clampPct(d.score)"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-valuetext="rt('report.common.scoreOf100', { name: d.name, n: clampPct(d.score) })"
              :style="{ '--fill': `${clampPct(d.score)}%` }"
            >
              <span class="la-dim__gauge-fill" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.la {
  --vr: 12px;
  --bar: var(--safe);
  --bar-ink: var(--safe-ink);
  position: relative;
  display: flex;
  flex-direction: column;
}
.la--safe { --bar: var(--safe); --bar-ink: var(--safe-ink); }
.la--warn { --bar: var(--warn); --bar-ink: var(--warn-ink); }
.la--crit { --bar: var(--crit); --bar-ink: var(--crit-ink); }

/* ── Gemergte Kachel (vorne) ──────────────────────────────────────────────── */
.la-card {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(340px, 0.8fr);
  border: 1px solid var(--line);
  border-radius: var(--vr);
  overflow: hidden;
  /* OPAK (canvas-basiert) → deckt die Lasche dahinter sauber ab. */
  background: color-mix(in srgb, var(--bar) 12%, var(--canvas));
  /* Bewusste Variante-C-Ausnahme (Nutzer-Wunsch, nur hier): dezenter, nach unten gerichteter
     Schatten – die Kachel „schwebt" leicht ueber der Lasche → verstaerkt den „dahinter"-Effekt. */
  box-shadow: 0 12px 22px -14px rgba(35, 37, 29, 0.34), 0 4px 10px -6px rgba(35, 37, 29, 0.16);
}
.la-card__verdict {
  padding: clamp(22px, 2.6vw, 32px);
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.la-card__score {
  position: relative;
  padding: clamp(22px, 2.6vw, 32px);
  border-left: 1px solid var(--line);
}

/* ── Verdikt ─────────────────────────────────────────────────────────────── */
.la-status {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-height: 32px;
  padding: 6px 15px;
  border-radius: 999px;
  color: var(--ink-text);
  background: var(--bar-ink);
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}
.la-status__dot { width: 9px; height: 9px; border-radius: 50%; background: var(--ink-text); }
.la-headline {
  max-width: 20ch;
  margin: 15px 0 11px;
  font-size: clamp(26px, 3.2vw, 40px);
  line-height: 1.05;
  letter-spacing: -0.035em;
  text-wrap: balance;
}
.la-point { color: var(--bar); font-weight: 800; }
.la-lead { max-width: 58ch; margin: 0; color: var(--ink-soft); font-size: 15.5px; line-height: 1.6; }
.la-rule { height: 1px; margin: 18px 0 0; background: var(--line); }
.la-meta { margin: 12px 0 0; color: var(--muted); font-family: var(--mono); font-size: 11px; letter-spacing: 0.03em; }

/* ── Integritaet ─────────────────────────────────────────────────────────── */
.la-eyebrow {
  margin: 0 0 10px;
  color: var(--subtle);
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
.la-score__head { display: flex; align-items: baseline; gap: 10px; }
.la-score__num {
  font-size: clamp(46px, 5vw, 64px);
  font-weight: 700;
  line-height: 0.85;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
}
.la-score__den { font-family: var(--mono); font-size: 17px; font-weight: 500; color: var(--muted); }
.la-bar {
  position: relative;
  height: 28px;
  margin: 18px 0 7px;
  border: 1px solid var(--ink);
  border-radius: 3px;
  background: color-mix(in srgb, var(--bar) 22%, var(--surface));
  overflow: hidden;
}
.la-bar::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(90deg, transparent 0 calc(25% - 1.5px), var(--ink) calc(25% - 1.5px) 25%);
  opacity: 0;
  animation: la-barticks 0.5s ease-out 0.25s forwards;
}
@keyframes la-barticks { to { opacity: 0.16; } }
.la-bar__fill {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 0;
  background: linear-gradient(90deg, var(--bar), color-mix(in srgb, var(--bar) 72%, var(--surface)));
  opacity: 0;
  animation: la-barfill 1.1s cubic-bezier(0.2, 0.7, 0.2, 1) 0.25s forwards;
  z-index: 1;
}
@keyframes la-barfill { to { width: var(--fill); opacity: 0.85; } }
.la-bar__marker {
  position: absolute;
  top: -3px;
  bottom: -3px;
  width: 3px;
  background: var(--ink);
  transform: translateX(-50%) scaleY(0);
  transform-origin: center;
  z-index: 2;
  animation: la-barmarker 0.3s ease-out 1.25s forwards;
}
@keyframes la-barmarker { to { transform: translateX(-50%) scaleY(1); } }
.la-bar__ends {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  color: var(--subtle);
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.06em;
}
.la-lines { display: flex; flex-direction: column; }
.la-line {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 12px;
  align-items: baseline;
  padding: 10px 0;
  border-top: 1px solid var(--line);
}
.la-line__k { color: var(--subtle); font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; }
.la-line__v { font-family: var(--mono); font-size: 13.5px; font-weight: 600; font-variant-numeric: tabular-nums; }
.la-line__note {
  font-style: normal;
  font-weight: 500;
  color: var(--subtle);
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-left: 7px;
}

/* ── Eck-Verlauf + Severity-Zeichen (statisch) ───────────────────────────── */
.la-corner {
  position: absolute;
  top: 0;
  right: 0;
  width: 140px;
  height: 140px;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(125% 125% at 100% 0%, color-mix(in srgb, var(--bar) 42%, transparent) 0%, transparent 64%);
}
.la-corner__mark {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 42px;
  height: 42px;
  color: var(--bar-ink);
  opacity: 0;
  animation: la-mark-in 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) 0.5s forwards;
}
@keyframes la-mark-in {
  from { opacity: 0; transform: scale(0.7); }
  to { opacity: 0.9; transform: scale(1); }
}
.la-card__score > :not(.la-corner) { position: relative; z-index: 1; }

/* ── LASCHE (Drawer hinter der Kachel) ────────────────────────────────────── */
.la-drawer {
  position: relative;
  z-index: 1;
  /* tuck: 18px hinter die Kachel; seitlich 12px schmaler → liest sich als „dahinter". */
  margin: -18px 12px 0;
  padding-top: 18px;
  background: var(--surface-2); /* heller Grau (statt weiss) */
  border: 1px solid var(--line);
  border-radius: var(--vr);
  overflow: hidden;
}
.la-tab {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 12px 16px;
  flex-wrap: wrap;
  margin: 0;
  padding: 12px 16px;
  border: 0;
  background: transparent;
  color: var(--ink-soft);
  font: inherit;
  text-align: left;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.14s ease-out;
}
.la-tab:hover { color: var(--ink); }
.la-tab:focus-visible { outline: 2px solid var(--ink); outline-offset: -3px; border-radius: var(--vr); }
/* Beide Labels im selben Grid-Slot → konstante Breite, Chips springen nicht. */
.la-tab__label {
  display: inline-grid;
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.la-tab__show,
.la-tab__hide { grid-area: 1 / 1; }
.la-tab__hide { visibility: hidden; }
.la-drawer.is-open .la-tab__show { visibility: hidden; }
.la-drawer.is-open .la-tab__hide { visibility: visible; }
.la-tab__preview { display: inline-flex; flex-wrap: wrap; gap: 6px; }
.la-tab__chip {
  --dot: var(--safe);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface); /* weiss → hebt sich von der grauen Lasche ab */
  font-family: var(--mono);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--muted);
}
.la-tab__chip.tint-safe { --dot: var(--safe); }
.la-tab__chip.tint-warn { --dot: var(--warn); }
.la-tab__chip.tint-crit { --dot: var(--crit); }
.la-tab__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--dot); }
.la-chev { margin-left: auto; flex: none; color: var(--muted); transition: transform 0.25s ease; }
.la-drawer.is-open .la-chev { transform: rotate(180deg); }

/* Weiche Hoehen-Animation. */
.la-dimwrap {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.32s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.la-dimwrap.is-collapsed { grid-template-rows: 0fr; }
.la-dimwrap > .la-dimgrid {
  min-height: 0;
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.28s ease, transform 0.32s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.la-dimwrap.is-collapsed > .la-dimgrid { opacity: 0; transform: translateY(-6px); }

/* Dim-Inhalt der Lasche: 3 Spalten, Hairline-Trenner, getoent auf der grauen Flaeche. */
.la-dimgrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  background: var(--line);
  border-top: 1px solid var(--line);
}
.la-dim { padding: 16px clamp(14px, 1.8vw, 22px); background: var(--surface-2); }
.la-dim.tint-safe { background: color-mix(in srgb, var(--safe) 9%, var(--surface-2)); }
.la-dim.tint-warn { background: color-mix(in srgb, var(--warn) 11%, var(--surface-2)); }
.la-dim.tint-crit { background: color-mix(in srgb, var(--crit) 9%, var(--surface-2)); }
.la-dim__name {
  margin: 0;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}
.la-dim__desc { margin: 4px 0 0; color: var(--subtle); font-family: var(--mono); font-size: 10px; line-height: 1.45; letter-spacing: 0.02em; }
.la-dim__row { display: flex; align-items: baseline; gap: 8px; margin: 12px 0 12px; }
.la-dim__score { font-size: 30px; font-weight: 700; line-height: 1; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.la-dim__den { font-family: var(--mono); font-size: 12px; font-weight: 500; color: var(--muted); }
.la-dim__state { margin-left: auto; font-family: var(--mono); font-size: 12px; font-weight: 600; }
.la-dim__state--safe { color: var(--safe-ink); }
.la-dim__state--warn { color: var(--warn-ink); }
.la-dim__state--crit { color: var(--crit-ink); }
.la-dim__gauge { position: relative; height: 6px; border-radius: 3px; background: var(--surface); overflow: hidden; }
.la-dim__gauge-fill {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 0;
  border-radius: 3px;
  animation: la-dimfill 1s cubic-bezier(0.2, 0.7, 0.2, 1) 0.1s forwards;
}
.tint-safe .la-dim__gauge-fill { background: var(--safe); }
.tint-warn .la-dim__gauge-fill { background: var(--warn); }
.tint-crit .la-dim__gauge-fill { background: var(--crit); }
@keyframes la-dimfill { to { width: var(--fill, 0); } }

/* ── Reveal ───────────────────────────────────────────────────────────────── */
.is-reveal {
  opacity: 0;
  transform: translateY(10px);
  animation: la-rise 0.55s cubic-bezier(0.2, 0.7, 0.2, 1) 0.02s forwards;
}
@keyframes la-rise { to { opacity: 1; transform: translateY(0); } }

@media (prefers-reduced-motion: reduce) {
  .is-reveal { animation: none; opacity: 1; transform: none; }
  .la-corner__mark { animation: none; opacity: 0.9; transform: none; }
  .la-bar::after { animation: none; opacity: 0.16; }
  .la-bar__fill { animation: none; width: var(--fill); opacity: 0.85; }
  .la-bar__marker { animation: none; transform: translateX(-50%) scaleY(1); }
  .la-dim__gauge-fill { animation: none; width: var(--fill, 0); }
  .la-chev,
  .la-tab,
  .la-dimwrap,
  .la-dimwrap > .la-dimgrid { transition: none; }
}

/* ── Responsive ───────────────────────────────────────────────────────────── */
@media (max-width: 820px) {
  .la-card { grid-template-columns: 1fr; }
  .la-card__score { border-left: 0; border-top: 1px solid var(--line); }
}
@media (max-width: 560px) {
  .la-dimgrid { grid-template-columns: 1fr; }
}
</style>
