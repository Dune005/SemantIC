<script setup lang="ts">
// GuardrailList (Frontend 1.7, §2-Vertiefung) – „Die Leitplanken der Bewertung".
// Erklärgrafik (keine Daten): je Paar links die Modell-Tendenz „maskiert" (hinter
// dezentem Schleier-Raster), rechts die SemantIC-Leitplanke „klar". Hover/Focus hebt
// den Schleier – rein DEKORATIV: der Tendenz-Text ist immer voll lesbar (Codex-A11y),
// nie erst durch Hover. Quelle der 5 Paare: texte-beschriftungen.md (hart erzwungen,
// gehedgtes Wording). Variante C „maskiert → klar".
// i18n (Seitentext-Migration): Default-Paare aus components.guardrailList.pairs.* (5 Paare),
// als computed -> folgt dem Sprachwechsel ohne Reload. Ein via Prop uebergebenes pairs-Array
// gewinnt weiterhin (kein Verhalten geaendert). n wird aus dem Index abgeleitet.
type Pair = { n: string; tendenz: string; leitplanke: string }

const props = defineProps<{ pairs?: readonly Pair[] }>()

const { t } = useI18n()
const PAIR_COUNT = 5
const resolvedPairs = computed<readonly Pair[]>(
  () =>
    props.pairs ??
    Array.from({ length: PAIR_COUNT }, (_, i) => ({
      n: String(i + 1).padStart(2, '0'),
      tendenz: t(`components.guardrailList.pairs.${i}.tendenz`),
      leitplanke: t(`components.guardrailList.pairs.${i}.leitplanke`),
    })),
)
</script>

<template>
  <ol class="rails">
    <li v-for="p in resolvedPairs" :key="p.n" class="rail">
      <!-- Tendenz „maskiert": Schleier ist ein dekoratives ::before; der Text liegt
           im .rail__content darüber und bleibt immer voll lesbar. -->
      <div class="rail__cell rail__cell--was">
        <div class="rail__content">
          <p class="rail__tag">
            <span class="rail__dot rail__dot--was" aria-hidden="true" />
            <span class="rail__num">{{ p.n }}</span>&nbsp;{{ $t('components.guardrailList.tendenzTag') }}
          </p>
          <p class="rail__text">{{ p.tendenz }}</p>
        </div>
      </div>

      <div class="rail__arrow" aria-hidden="true">
        <svg viewBox="0 0 40 14" preserveAspectRatio="none" focusable="false">
          <line x1="0" y1="7" x2="33" y2="7" />
          <path d="M28 2 L34 7 L28 12" />
        </svg>
      </div>

      <!-- Leitplanke „klar": präsent, voller Kontrast, substance-Akzent. -->
      <div class="rail__cell rail__cell--now">
        <div class="rail__content">
          <p class="rail__tag">
            <span class="rail__dot rail__dot--now" aria-hidden="true" />
            <span class="rail__num">{{ p.n }}</span>&nbsp;{{ $t('components.guardrailList.leitplankeTag') }}
          </p>
          <p class="rail__text">{{ p.leitplanke }}</p>
        </div>
      </div>
    </li>
  </ol>
</template>

<style scoped>
.rails {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.rail {
  display: grid;
  grid-template-columns: 1fr 56px 1fr;
  align-items: stretch;
}

/* Gemeinsame Zelle */
.rail__cell {
  position: relative;
  padding: 22px 24px;
  border-radius: var(--r);
  overflow: hidden;
  isolation: isolate;
}
.rail__content {
  position: relative;
  z-index: 1; /* immer ÜBER dem dekorativen Schleier → Text stets voll lesbar */
}

/* Tendenz „maskiert" – gedämpfte Fläche, gestrichelte Kante. */
.rail__cell--was {
  background: var(--canvas);
  border: 1px dashed var(--line-strong);
  color: var(--muted);
}
/* „maskiert → klar" OHNE Raster über dem Text (Codex): die Verdeckung trägt ein
   textfreier Hatch-Marker im Tag (siehe .rail__dot--was) plus die gedämpfte Fläche.
   Hover „klärt" die Tendenz-Zelle – Kante wird durchgezogen, Text kräftiger. */
.rail__cell--was {
  transition: color 0.35s ease, border-color 0.35s ease;
}
.rail:hover .rail__cell--was,
.rail:focus-within .rail__cell--was {
  border-style: solid;
  color: var(--ink-soft);
}

/* Leitplanke „klar" – präsente weisse Fläche, kräftige Kante. */
.rail__cell--now {
  background: var(--surface);
  border: 1px solid var(--line-strong);
  color: var(--ink);
}

.rail__tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 10px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.rail__num {
  font-variant-numeric: tabular-nums;
}
.rail__cell--was .rail__tag {
  color: var(--subtle);
}
.rail__cell--now .rail__tag {
  color: var(--substance);
}
.rail__dot {
  width: 11px;
  height: 11px;
  border-radius: 2px;
  flex: 0 0 auto;
}
/* „maskiert": kleiner schraffierter Marker (textfrei) – dieselbe Hatch-Sprache wie
   die Maskierungs-Zone im Quadranten, nur neutral statt warn. */
.rail__dot--was {
  background-image: repeating-linear-gradient(
    -45deg,
    var(--muted) 0,
    var(--muted) 1px,
    transparent 1px,
    transparent 5px
  );
  border: 1px solid var(--line-strong);
}
/* „klar": solider Akzentpunkt. */
.rail__dot--now {
  background: var(--substance);
  border-radius: 50%;
}
.rail__text {
  margin: 0;
  font-size: clamp(15px, 1.6vw, 17px);
  line-height: 1.5;
}
.rail__cell--now .rail__text {
  font-weight: 500;
}

/* Brücke: Mono-Ziffer entfällt (steht schon im Tag); nur der Pfeil. */
.rail__arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}
.rail__arrow svg {
  width: 100%;
  height: 14px;
}
.rail__arrow :is(line, path) {
  stroke: var(--line-strong);
  stroke-width: 1.4;
  fill: none;
  transition: stroke 0.35s ease;
}
.rail:hover .rail__arrow :is(line, path),
.rail:focus-within .rail__arrow :is(line, path) {
  stroke: var(--substance);
}

/* Mobil: einspaltig; nur das kompakte SVG dreht 90° (nicht der ganze Grid-Block,
   sonst ragt der vollbreite Pfeil über die Zellen – Codex-Befund). */
@media (max-width: 719px) {
  .rail {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .rail__arrow {
    padding: 2px 0;
  }
  .rail__arrow svg {
    width: 36px;
    height: 14px;
    transform: rotate(90deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .rail__cell--was,
  .rail__arrow :is(line, path) {
    transition: none;
  }
}
</style>
