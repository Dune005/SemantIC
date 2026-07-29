<script setup lang="ts">
// Landing / index — Frontend 1.6, produktive Neukomposition aus der Lab-
// Variante v16-g (Loop-Video-Hero, Fixed-Canvas-Mess-Raster, Prüfregler-Exponat,
// Bild-Band, dunkle Maskierungs-Tafel) plus zwei kombinierten Bausteinen aus dem
// v18-atelier-Prototyp:
//   Kachel 1: «Der blinde Fleck» + Prüfregler-Exponat + Dimensions-Umschalter
//             (Physik/Semantik/Bias) – die drei Dimensionen sind hier in die
//             Kachel gezogen, der separate §2-Block entfällt.
//   Kachel 2: «Die Maskierung» = Bild-Paar oben + WIRKUNG | SUBSTANZ-Aufstellung
//             darunter (volle Breite).
// Architektur: nutzt das globale default-Layout (AppHeader/AppFooter/Skip-Link/
// VerdictCursor) – KEIN layout:false, KEIN lokaler Header/Skip-Link/<main>.
// Der Fixed-Canvas liegt auf `z-index:-1`: ein fixed-Element entkommt jeder
// isolation in den Root-Stacking-Kontext, daher hält ihn nur ein negativer
// z-index zuverlässig UNTER allen Sektionen UND dem globalen Footer (im Browser
// verifiziert). Der Body trägt bereits --page-bg als Grundton hinter den Dots.
// Beispielbild Kachel 1: FL_nurse_04 aus dem Phase-1-Prompt-Set (blindspot-nurse.webp)
// – trägt verifizierte Befunde in allen drei Dimensionen (Stethoskop/Physik,
// Namensschild/Semantik, Rollenbild/Bias); der frühere «Beispiel-Prüfbereich»-
// Demo-Zustand des Platzhalters entfällt damit. Kachel 2 behält bewusst das
// Pressekonferenz-Bild (zweites, eigenständiges Beispiel).
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Button from '~/components/ui/Button.vue'
import { useReveal } from '~/composables/useReveal'

// i18n (Seitentext-Migration): Prosa/DIMS aus pages.index.*, Titel/Description als
// Getter -> folgen dem Sprachwechsel ohne Reload. Hero-Kicker (drei Prüfdimensionen,
// NICHT der Brand-Claim) liegt in pages.index.hero.kicker.
const { t } = useI18n()
useHead({
  title: () => t('seo.index.title'),
  meta: [{ name: 'description', content: () => t('seo.index.description') }],
})

// ---- Hero-Video-Gate: nur fine-pointer ohne reduced-motion bekommt das Video --
const showMotion = ref(false)
const heroVideo = ref<HTMLVideoElement | null>(null)
// Bühnen-Ref: markiert die Zone, in der das Mess-Raster still bleibt.
const heroStage = ref<HTMLElement | null>(null)
// Erst wenn das Video tatsächlich läuft, wird es über das Standbild geblendet –
// bleibt Autoplay aus (Safari, Datensparmodus), bleibt schlicht das Bild stehen.
const videoPlaying = ref(false)
onMounted(async () => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  showMotion.value = fine && !reduce
  if (showMotion.value) {
    await nextTick()
    // Safari/Autoplay-Absicherung: schlägt play() fehl, bleibt das poster stehen.
    heroVideo.value?.play().catch(() => {})
  }
})

// ---- Prüfregler-Exponat (reaktiver Port des v16-g/v18-Reglers) ----------------
const reveal = ref(80) // Default: Stethoskop-Zone (Physik) + Chip vollständig sichtbar
// Grip-Position separat geklemmt, damit das Label bei 0/100 nicht aus dem Rahmen läuft.
const gripLeft = computed(() => `${Math.min(96, Math.max(4, reveal.value))}%`)

// ---- Dimensions-Umschalter (Segmented-Control, kein role=tablist) -------------
// DIMS strukturiert (kein v-html). Alle drei Dimensionen tragen am Nurse-Bild
// einen verifizierten Befund (rote Zone) – der frühere 'demo'-Zustand entfällt.
type DimKey = 'phys' | 'sem' | 'bias'
interface Dim {
  label: string
  chip: string
  /* Zonen nahe der Oberkante tragen den Chip UNTER der Zone (sonst ragt er aus dem Rahmen). */
  chipBelow?: boolean
  zone: { left: string; top: string; width: string; height: string }
  strong: string
  body: string
}
// DIMS als computed: Text-Werte (label/chip/strong/body) aus i18n (label = common.dimensions,
// Rest = pages.index.dims.*), Geometrie (zone) und chipBelow bleiben literal. So folgt der
// Umschalter dem Sprachwechsel ohne Reload.
const DIMS = computed<Record<DimKey, Dim>>(() => ({
  phys: {
    label: t('common.dimensions.physics'),
    chip: t('pages.index.dims.phys.chip'),
    // Eng auf den Ohrbügel: dort laufen die Metallrohre unmöglich zusammen.
    zone: { left: '48%', top: '56%', width: '17%', height: '22%' },
    strong: t('pages.index.dims.phys.strong'),
    body: t('pages.index.dims.phys.body'),
  },
  sem: {
    label: t('common.dimensions.semantics'),
    chip: t('pages.index.dims.sem.chip'),
    // Auf die Ausweiskarte selbst, nicht auf Clip und Band darueber.
    zone: { left: '41%', top: '86%', width: '14%', height: '12%' },
    strong: t('pages.index.dims.sem.strong'),
    body: t('pages.index.dims.sem.body'),
  },
  bias: {
    label: t('common.dimensions.bias'),
    chip: t('pages.index.dims.bias.chip'),
    chipBelow: true,
    zone: { left: '39%', top: '5%', width: '23%', height: '28%' },
    strong: t('pages.index.dims.bias.strong'),
    body: t('pages.index.dims.bias.body'),
  },
}))
const dim = ref<DimKey>('phys')
const current = computed(() => DIMS.value[dim.value])
const zoneStyle = computed(() => ({
  left: current.value.zone.left,
  top: current.value.zone.top,
  width: current.value.zone.width,
  height: current.value.zone.height,
}))

// ---- Fixed-Canvas-Dot-Grid (übernommen aus v16-g, pointer-getrieben) ----------
const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let raf = 0
let onMove: ((e: PointerEvent) => void) | null = null
let onLeave: (() => void) | null = null
let onResize: (() => void) | null = null
const pointer = { x: -9999, y: -9999, active: false }
const GAP = 24
const RADIUS = 170

function colorVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#000'
}

function draw(w: number, h: number, dotBase: string, dotInk: string, accent: string, animate: boolean) {
  if (!ctx) return
  ctx.clearRect(0, 0, w, h)
  for (let x = GAP; x < w; x += GAP) {
    for (let y = GAP; y < h; y += GAP) {
      let r = 1.1
      let fill = dotBase
      if (animate && pointer.active) {
        const dx = x - pointer.x
        const dy = y - pointer.y
        const dist = Math.hypot(dx, dy)
        if (dist < RADIUS) {
          const t = 1 - dist / RADIUS
          r = 1.1 + t * 2.6
          fill = t > 0.62 ? accent : dotInk
        }
      }
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = fill
      ctx.fill()
    }
  }
}

onMounted(() => {
  const el = canvas.value
  if (!el) return
  ctx = el.getContext('2d')
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const animate = !reduce && finePointer
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  let w = 0
  let h = 0
  const dotBase = colorVar('--line')
  const dotInk = colorVar('--ink-soft')
  const accent = colorVar('--crit')

  const resize = () => {
    w = window.innerWidth
    h = window.innerHeight
    el.width = w * dpr
    el.height = h * dpr
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
    draw(w, h, dotBase, dotInk, accent, animate)
  }
  onResize = resize
  window.addEventListener('resize', onResize)
  resize()

  if (!animate) return

  let framePending = false
  const scheduleDraw = () => {
    if (framePending) return
    framePending = true
    raf = requestAnimationFrame(() => {
      framePending = false
      // Über dem Hero-Medium bleibt das Raster still: Dort trägt das Bild, und
      // Punkte, die unter dem ausblendenden Rand mitwandern, irritieren nur.
      // Das Rect wird im rAF-Callback gelesen (max. 1x pro Frame, kein Thrashing).
      const stageRect = heroStage.value?.getBoundingClientRect()
      if (stageRect && pointer.y >= stageRect.top && pointer.y <= stageRect.bottom) {
        pointer.active = false
      }
      draw(w, h, dotBase, dotInk, accent, true)
    })
  }
  onMove = (e: PointerEvent) => {
    pointer.x = e.clientX
    pointer.y = e.clientY
    pointer.active = true
    scheduleDraw()
  }
  onLeave = () => {
    pointer.active = false
    scheduleDraw()
  }
  window.addEventListener('pointermove', onMove, { passive: true })
  document.documentElement.addEventListener('mouseleave', onLeave)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  if (onResize) window.removeEventListener('resize', onResize)
  if (onMove) window.removeEventListener('pointermove', onMove)
  if (onLeave) document.documentElement.removeEventListener('mouseleave', onLeave)
})

const page = ref<HTMLElement | null>(null)
useReveal(page, '.reveal')
</script>

<template>
  <div ref="page" class="lp">
    <!-- Interaktives Mess-Raster als Fixed-Schicht HINTER dem Inhalt;
         via .lp { isolation:isolate } auf den Landing-Teilbaum gekapselt. -->
    <canvas ref="canvas" class="lp__grid" aria-hidden="true" />

    <!-- Inhalts-Gruppe (Geschwister des Canvas) – liegt im normalen Fluss über
         dem z-index:-1-Canvas; bündelt alle Sektionen als eine Einheit. -->
    <div class="lp__main">
      <!-- ============ HERO · Plakat: Motiv oben randabfallend, Copy darunter ==
           Achsendrehung gegenüber 1.6 (Text links | Video rechts): Das Leinen-
           Motiv ist ein Breitformat – der 90°-Verlauf hat es halbiert und das
           «SemantIC»-Etikett ausgewaschen. Jetzt läuft das Medium über die volle
           Breite, seine UNTERkante blendet sich per Verlauf selbst aus, und die
           Copy greift von unten in diese Kante hinein. Dieselbe «das Medium
           blendet sich selbst ein»-Geste wie bisher schon auf Mobile, nur um 90°
           gedreht – und damit auf allen Breiten dieselbe Komposition.
           Bewusst NICHT im Hero: Befund-Zonen/Marker auf dem Motiv (F4: keine
           erfundenen Befunde) und jedes zusätzliche Rot (offenes Finding zur
           Rot-Inflation). Einziges Rot bleibt der Satzpunkt. -->
      <section class="hero" aria-labelledby="hero-headline">
        <!-- data-cursor="native": Über dem Medium blendet der VerdictCursor aus
             und der native Zeiger kommt zurück – der Kreis konkurriert dort mit
             dem Bild, statt etwas zu erschliessen. Das Mess-Raster hält im
             selben Bereich still (siehe onMove weiter oben). -->
        <div ref="heroStage" class="hero__stage" data-cursor="native">
          <!-- Standbild als bleibende Unterlage, Video legt sich darüber, sobald
               es wirklich läuft. Vorher tauschte ein v-if/v-else das Element bei
               der Hydration aus – das kostete einen leeren Frame UND startete
               die Auftritts-Animation ein zweites Mal (im Browser gemessen:
               hero-media bei 99 ms und nochmal bei 217 ms = sichtbares
               Doppel-Flackern). Nebeneffekt: Der alt-Text gilt jetzt in beiden
               Fällen, nicht nur im reduced-motion-Fall. -->
          <img
            class="hero__visual"
            src="/landing/hero-loop-leine-poster.jpg"
            width="2752"
            height="1536"
            fetchpriority="high"
            :alt="$t('pages.index.hero.mediaAlt')"
          />
          <video
            v-if="showMotion"
            ref="heroVideo"
            class="hero__visual hero__visual--motion"
            :class="{ 'is-playing': videoPlaying }"
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
            aria-hidden="true"
            @playing="videoPlaying = true"
          >
            <source src="/landing/hero-loop-leine.webm" type="video/webm" />
            <source src="/landing/hero-loop-leine.mp4" type="video/mp4" />
          </video>
        </div>

        <div class="hero__inner">
          <!-- Fuge Bild|Text: die Transparenz-Deklaration steht als Bildunter-
               schrift dort, wo sie hingehört (vorher: Kärtchen in der Bildecke).
               Rechts eine Massstabs-Leiste im Laborjournal-Duktus. -->
          <p class="hero__seam">
            <span class="hero__ticks hero__ticks--l" aria-hidden="true" />
            <span class="hero__decl">{{ showMotion ? $t('pages.index.hero.chipVideo') : $t('components.moodBand.chip') }}</span>
            <span class="hero__ticks hero__ticks--r" aria-hidden="true" />
          </p>

          <div class="hero__copy">
            <p class="kicker"><span class="kicker__dot" aria-hidden="true" />{{ $t('pages.index.hero.kicker') }}</p>
            <i18n-t keypath="pages.index.hero.headline" tag="h1" id="hero-headline" class="hero__head" scope="global">
              <template #tail><span class="nowrap">{{ $t('pages.index.hero.headlineTail') }}<span class="end">.</span></span></template>
            </i18n-t>
            <p class="hero__sub">{{ $t('pages.index.hero.sub') }}</p>
            <div class="hero__cta">
              <Button as="a" href="/analyze" variant="primary" size="md" class="hero__go">
                {{ $t('pages.index.hero.cta') }} <span class="hero__arrow" aria-hidden="true">→</span>
              </Button>
              <NuxtLink to="/how-it-works" class="hero__how">{{ $t('pages.index.hero.how') }}</NuxtLink>
            </div>
            <p class="hero__micro">{{ $t('pages.index.hero.micro') }}</p>
          </div>
        </div>
      </section>

      <!-- ============ KACHEL 1 · Der blinde Fleck + Prüftisch ================== -->
      <section class="wall" aria-labelledby="s1-head">
        <span class="wall__axis" aria-hidden="true" />
        <div class="center">
          <div class="tablet tablet--canvas">
            <p class="eyebrow reveal">{{ $t('pages.index.blindspot.eyebrow') }}</p>
            <h2 id="s1-head" class="h2 reveal r1">{{ $t('pages.index.blindspot.title') }}</h2>
            <i18n-t keypath="pages.index.blindspot.lead" tag="p" scope="global" class="lead reveal r2">
              <template #correct><em>{{ $t('pages.index.blindspot.correct') }}</em></template>
              <template #masking><em>{{ $t('pages.index.blindspot.masking') }}</em></template>
            </i18n-t>

            <p class="switch-hint reveal r2">{{ $t('pages.index.blindspot.switchHint') }}</p>

            <!-- Segmented-Control statt role=tablist (Codex-Review): Buttons mit
                 aria-pressed, monochrome Punkte (KEINE Severity-Farben). -->
            <div class="dims reveal r2" role="group" :aria-label="$t('pages.index.blindspot.dimsAria')">
              <button
                v-for="(d, key) in DIMS"
                :key="key"
                type="button"
                class="dims__tab"
                :class="{ 'is-active': dim === key }"
                :aria-pressed="dim === key"
                @click="dim = key as DimKey"
              >
                <span class="dims__dot" aria-hidden="true" />{{ d.label }}
              </button>
            </div>

            <figure class="spec reveal r2">
                <div class="spec__stage">
                  <div class="spec__frame">
                    <img
                      src="/landing/blindspot-nurse.webp"
                      width="1616"
                      height="1212"
                      loading="lazy"
                      :alt="$t('pages.index.blindspot.specAlt')"
                    />
                    <!-- Befund-Layer: per clip-path vom Regler freigegeben. -->
                    <div class="spec__anno" :style="{ clipPath: `inset(0 ${100 - reveal}% 0 0)` }">
                      <span class="spec__tint" aria-hidden="true" />
                      <span class="spec__zone spec__zone--crit" :style="zoneStyle">
                        <span class="spec__chip" :class="{ 'spec__chip--below': current.chipBelow }">{{ current.chip }}</span>
                      </span>
                    </div>
                    <div class="spec__divider" aria-hidden="true" :style="{ left: gripLeft }">
                      <span class="spec__grip">{{ $t('pages.index.blindspot.grip') }}</span>
                    </div>
                  </div>
                  <input
                    v-model.number="reveal"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    class="spec__input"
                    :aria-label="$t('pages.index.blindspot.sliderAria')"
                    aria-describedby="spec-dim-desc"
                    :aria-valuetext="$t('pages.index.blindspot.sliderValueText', { reveal })"
                  />
                </div>
                <!-- Bedienhinweis eigenstaendig und kontraststark: als Teil der
                     grauen Caption ging er unter (Feedback 2026-07-20). -->
                <p class="spec__pull">
                  <span aria-hidden="true">◂▸</span> {{ $t('pages.index.blindspot.pull') }}
                </p>
                <figcaption class="spec__card">{{ $t('pages.index.blindspot.caption') }}</figcaption>
            </figure>

            <div class="diminfo reveal r3" role="status" aria-live="polite" aria-atomic="true">
              <div class="diminfo__row">
                <span class="diminfo__tag">{{ current.label }}</span>
                <p id="spec-dim-desc" class="diminfo__txt"><b>{{ current.strong }}</b> {{ current.body }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ KACHEL 2 · Die Maskierung (dunkel) ====================== -->
      <section class="wall wall--ink" aria-labelledby="s3-head">
        <span class="wall__axis" aria-hidden="true" />
        <div class="center">
          <div class="tablet tablet--ink">
            <p class="eyebrow reveal">{{ $t('pages.index.masking.eyebrow') }}</p>
            <h2 id="s3-head" class="h2 reveal r1">{{ $t('pages.index.masking.title') }}</h2>
            <i18n-t keypath="pages.index.masking.lead" tag="p" scope="global" class="lead reveal r2">
              <template #appears><em>{{ $t('pages.index.masking.appears') }}</em></template>
              <template #holds><em>{{ $t('pages.index.masking.holds') }}</em></template>
              <template #link><NuxtLink to="/how-it-works">{{ $t('pages.index.masking.linkText') }}</NuxtLink></template>
            </i18n-t>

            <!-- Bild-Paar oben: Gesamteindruck + Detail-Crop. -->
            <div class="pair reveal r2">
              <figure class="pair__item">
                <div class="pair__frame">
                  <img
                    src="/landing/masking-press.webp"
                    width="1616"
                    height="1024"
                    loading="lazy"
                    :alt="$t('pages.index.masking.pairAlt1')"
                  />
                </div>
                <figcaption>{{ $t('pages.index.masking.pairCap1') }}</figcaption>
              </figure>
              <figure class="pair__item">
                <div class="pair__frame pair__frame--zoom">
                  <img
                    src="/landing/masking-press.webp"
                    width="1616"
                    height="1024"
                    loading="lazy"
                    :alt="$t('pages.index.masking.pairAlt2')"
                  />
                </div>
                <figcaption>{{ $t('pages.index.masking.pairCap2') }}</figcaption>
              </figure>
            </div>

            <!-- WIRKUNG | SUBSTANZ darunter, volle Breite (v18-atelier-Übernahme). -->
            <div class="formula reveal r3" role="group" :aria-label="$t('pages.index.masking.formulaAria')">
              <div class="formula__side formula__side--look">
                <span class="formula__tag">{{ $t('pages.index.masking.lookTag') }}</span>
                <h3 class="formula__name">{{ $t('pages.index.masking.lookName') }}</h3>
                <p class="formula__txt">{{ $t('pages.index.masking.lookTxt') }}</p>
              </div>
              <div class="formula__vs" aria-hidden="true">vs.</div>
              <div class="formula__side">
                <span class="formula__tag">{{ $t('pages.index.masking.substanceTag') }}</span>
                <h3 class="formula__name">{{ $t('pages.index.masking.substanceName') }}</h3>
                <p class="formula__txt">{{ $t('pages.index.masking.substanceTxt') }}</p>
              </div>
            </div>
            <p class="formula__cap reveal r3">{{ $t('pages.index.masking.cap') }}</p>
          </div>
        </div>
      </section>

      <!-- ============ EINORDNUNG · hellster Moment (randlos) ================== -->
      <section class="wall wall--surface" aria-labelledby="s4-head">
        <span class="wall__axis" aria-hidden="true" />
        <div class="center">
          <div class="open">
            <p class="eyebrow reveal">{{ $t('pages.index.context.eyebrow') }}</p>
            <h2 id="s4-head" class="h2 reveal r1">{{ $t('pages.index.context.title') }}</h2>
            <i18n-t keypath="pages.index.context.lead" tag="p" scope="global" class="lead reveal r2">
              <template #quality><em>{{ $t('pages.index.context.quality') }}</em></template>
            </i18n-t>
          </div>
        </div>
      </section>

      <!-- ============ Bild-Band · randabfallend ============================== -->
      <section class="band" :aria-label="$t('pages.index.band.aria')">
        <img
          class="band__img"
          src="/landing/band-printstudio.webp"
          width="2752"
          height="1536"
          loading="lazy"
          :alt="$t('pages.index.band.alt')"
        />
        <span class="band__tone" aria-hidden="true" />
        <span class="band__chip">{{ $t('components.moodBand.chip') }}</span>
      </section>

      <!-- ============ DIE FORSCHUNG DAHINTER ================================= -->
      <section class="wall" aria-labelledby="s5-head">
        <span class="wall__axis" aria-hidden="true" />
        <div class="center">
          <div class="tablet tablet--canvas">
            <p class="eyebrow reveal">{{ $t('pages.index.research.eyebrow') }}</p>
            <h2 id="s5-head" class="h2 reveal r1">{{ $t('pages.index.research.title') }}</h2>
            <p class="lead reveal r2">{{ $t('pages.index.research.lead') }}</p>

            <div class="facts reveal r2">
              <div class="facts__item">
                <span class="facts__num">144</span>
                <span class="facts__label">{{ $t('pages.index.research.facts.images.label') }}</span>
                <span class="facts__sub">{{ $t('pages.index.research.facts.images.sub') }}</span>
              </div>
              <div class="facts__item">
                <span class="facts__num">5</span>
                <span class="facts__label">{{ $t('pages.index.research.facts.readings.label') }}</span>
                <span class="facts__sub">{{ $t('pages.index.research.facts.readings.sub') }}</span>
              </div>
              <div class="facts__item">
                <span class="facts__num">9</span>
                <span class="facts__label">{{ $t('pages.index.research.facts.drivers.label') }}</span>
                <span class="facts__sub">{{ $t('pages.index.research.facts.drivers.sub') }}</span>
              </div>
            </div>

            <p class="reveal r3">
              <NuxtLink to="/how-it-works" class="inline-link">
                {{ $t('pages.index.research.link') }} <span class="arrow" aria-hidden="true">→</span>
              </NuxtLink>
            </p>
          </div>
        </div>
      </section>

      <!-- ================= SCHLUSS-CTA · dunkel ================= -->
      <section class="closer" aria-labelledby="closer-head">
        <div class="closer__inner">
          <h2 id="closer-head" class="closer__head">{{ $t('pages.index.closer.title') }}<span class="dot-end">.</span></h2>
          <p class="closer__body">{{ $t('pages.index.closer.body') }}</p>
          <div class="closer__cta">
            <Button as="a" href="/analyze" variant="inverse" size="md">
              {{ $t('pages.index.closer.cta') }} <span class="arrow" aria-hidden="true">→</span>
            </Button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================ */
/* Landing-Wrapper + Fixed-Canvas-Mess-Raster                   */
/* isolation:isolate kapselt den fixed-Canvas auf den Landing-  */
/* Teilbaum – der globale Footer (Layout-Wurzel) bleibt darüber. */
/* ============================================================ */
.lp {
  /* Plain Container (Ref-Anker für useReveal). KEIN background/position/isolation:
     der Body trägt bereits --page-bg, und der Canvas sitzt als z-index:-1 hinter
     allem Inhalt. Ein fixed-Element entkommt jeder isolation in den Root-Kontext;
     nur ein negativer z-index hält es zuverlässig UNTER Sektionen UND Footer. */
}
.lp__grid {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  display: block;
  pointer-events: none;
}

/* ============================================================ */
/* GALERIEWAND – .wall transparent (Canvas scheint im Seiten-   */
/* grund durch), Tafeln/Hero/Ink/Surface/Band/Closer sind opak. */
/* ============================================================ */
.wall {
  position: relative;
  background: transparent;
  padding-block: clamp(72px, 11vw, 140px);
}
.wall--surface {
  background: var(--surface);
}
.wall__axis {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 1px;
  height: clamp(40px, 7vw, 80px);
  background: var(--line);
}
.center {
  width: 100%;
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: var(--gutter);
  text-align: center;
}
.tablet {
  max-width: 760px;
  margin-inline: auto;
  border: 1px solid var(--line);
  border-radius: var(--r);
  padding: clamp(48px, 8vw, 96px) clamp(28px, 6vw, 72px);
}
.tablet--canvas {
  background: var(--canvas);
}
.open {
  max-width: 760px;
  margin-inline: auto;
}

/* ---- gemeinsame Typo der Tafeln ---- */
.eyebrow {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 500;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--subtle);
  margin-bottom: clamp(18px, 3vw, 28px);
}
.h2 {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(28px, 4.6vw, 46px);
  letter-spacing: -0.03em;
  line-height: 1.06;
  color: var(--ink);
  max-width: 18ch;
  margin-inline: auto;
  text-wrap: balance;
}
.lead {
  margin: clamp(22px, 3.5vw, 34px) auto 0;
  max-width: 58ch;
  color: var(--ink-soft);
  font-size: clamp(15px, 1.5vw, 17px);
  line-height: 1.64;
  text-align: left;
}
.lead em {
  font-style: normal;
  font-weight: 600;
  color: var(--ink);
}

/* ============================================================ */
/* KACHEL 1 · Dimensions-Umschalter + Prüfregler-Exponat        */
/* ============================================================ */
.switch-hint {
  margin: clamp(20px, 3vw, 30px) auto clamp(18px, 2.6vw, 24px);
  max-width: 52ch;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 12px;
  letter-spacing: 0.03em;
  line-height: 1.6;
  color: var(--muted);
  text-align: center;
}
/* Segmented-Control: monochrom (keine Severity-Farben auf den Dots). */
.dims {
  display: flex;
  justify-content: center;
  gap: 0;
  margin: 0 auto clamp(20px, 3vw, 28px);
  border: 1px solid var(--line);
  border-radius: var(--r);
  /* Eingesenkte Rinne statt flacher Fläche: dadurch liest sich die aktive Kachel als
     Schieber, der eine von drei Positionen einnimmt – die Gruppe ist als Umschalter
     erkennbar, bevor man mit der Maus draufkommt. */
  background: var(--surface-2);
  padding: 4px;
  max-width: fit-content;
  flex-wrap: wrap;
}
.dims__tab {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 500;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px 18px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  transition: color 0.15s ease, background 0.15s ease, transform 0.1s ease;
}
/* Hover hob vorher nur die Textfarbe von --muted auf --ink-soft – zwei Grautöne, deren
   Unterschied im Fliesstext nicht auffiel. Jetzt hebt sich die Kachel sichtbar aus der
   Rinne heraus: helle Fläche wie die aktive Position, nur ohne Inversion.
   :not(.is-active) statt Reihenfolgen-Abhängigkeit – der aktive Tab darf nicht aufhellen. */
.dims__tab:not(.is-active):hover {
  color: var(--ink);
  background: var(--surface);
}
.dims__tab:not(.is-active):active {
  transform: scale(0.97);
}
.dims__tab.is-active {
  background: var(--ink);
  color: var(--surface);
}
.dims__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  /* Monochrom – KEINE Severity-Farben (siehe Kommentar am Markup): ein roter oder grüner
     Punkt läse sich hier als Bewertung der Dimension statt als Schalterzustand. */
  background: var(--muted);
  flex: 0 0 auto;
  transition: background 0.15s ease, transform 0.15s ease;
}
.dims__tab:not(.is-active):hover .dims__dot {
  background: var(--ink);
  transform: scale(1.3);
}
.dims__tab.is-active .dims__dot {
  background: var(--surface);
}

@media (prefers-reduced-motion: reduce) {
  .dims__tab,
  .dims__dot {
    transition: none;
  }
  .dims__tab:not(.is-active):active,
  .dims__tab:not(.is-active):hover .dims__dot {
    transform: none;
  }
}
.dims__tab.is-active .dims__dot {
  background: var(--surface);
}

/* Passepartout direkt auf dem <figure> – so bleibt figcaption ein direkter
   figure-Kind (valide Caption-Zuordnung, Codex-Review). */
.spec {
  /* Volle Tafel-Innenbreite (760px - 2x72px Padding): das Exponat nutzt den
     Raum, den die Tafel ohnehin bereitstellt, und schliesst bündig mit der
     Textspalte ab. Breiter waere moeglich, laesst aber bei 4:3 Bild und
     Befundtext nicht mehr gemeinsam in den Viewport passen. */
  max-width: 616px;
  margin: 0 auto;
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--canvas);
  padding: clamp(20px, 4vw, 36px);
}
.spec__stage {
  position: relative;
}
.spec__frame {
  position: relative;
  border: 1.5px solid var(--line-strong);
  border-radius: calc(var(--r) - 1px);
  overflow: hidden;
}
.spec__frame > img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1616 / 1212;
}
.spec__anno {
  position: absolute;
  inset: 0;
}
.spec__tint {
  position: absolute;
  inset: 0;
  background: var(--canvas);
  opacity: 0.18;
}
/* Befund-Zone: alle drei Dimensionen zeigen am Nurse-Bild einen verifizierten
   Befund (rot); der frühere neutrale Demo-Zustand ist entfallen. */
.spec__zone {
  position: absolute;
}
.spec__zone--crit {
  border: 1.5px solid var(--crit);
}
.spec__chip {
  position: absolute;
  /* Rechtsbündig an der Zone: so liegt der Chip über der aufgedeckten Befund-
     Fläche links und wird vom Regler-Divider nicht angeschnitten. */
  right: 0;
  bottom: calc(100% + 6px);
  display: inline-block;
  padding: 3px 8px;
  background: var(--canvas);
  border: 1px solid var(--line);
  border-radius: 3px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 9.5px;
  letter-spacing: 0.06em;
  color: var(--ink-soft);
  white-space: nowrap;
}
.spec__chip--below {
  bottom: auto;
  top: calc(100% + 6px);
}
/* Sehr schmale Screens: kompaktere Chip-Typo, sonst ragt der rechtsbündige Chip
   links über den Bildrahmen hinaus (overflow:hidden schneidet ihn dann an). */
@media (max-width: 379px) {
  .spec__chip {
    font-size: 8.5px;
    letter-spacing: 0.03em;
    padding: 3px 6px;
  }
}
.spec__divider {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--ink);
  pointer-events: none;
}
.spec__grip {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 3px 8px;
  background: var(--ink);
  color: var(--surface);
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 9px;
  letter-spacing: 0.12em;
  white-space: nowrap;
}
.spec__input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: ew-resize;
  appearance: none;
  -webkit-appearance: none;
  background: transparent;
}
.spec__stage:has(.spec__input:focus-visible) .spec__frame {
  outline: 2px solid var(--ink);
  outline-offset: 3px;
}
/* Bedienhinweis: kraeftiger als die Caption, damit er nicht in der grauen
   Fusszeile verschwindet. Bewusst ohne Rahmen/Flaeche – er soll auffallen,
   aber nicht als klickbarer Button missverstanden werden. */
.spec__pull {
  margin: clamp(14px, 2.4vw, 20px) 0 0;
  text-align: center;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--ink);
  text-wrap: balance;
}
.spec__pull span {
  margin-right: 4px;
  color: var(--muted);
}
.spec__card {
  margin-top: clamp(8px, 1.4vw, 12px);
  text-align: center;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.05em;
  line-height: 1.7;
  color: var(--subtle);
  max-width: 46ch;
  margin-inline: auto;
}

.diminfo {
  max-width: 560px;
  margin: clamp(22px, 3.5vw, 32px) auto 0;
}
.diminfo__row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  align-items: baseline;
  padding: 14px 18px;
  border: 1px solid var(--line);
  border-radius: var(--r);
  background: var(--surface);
  text-align: left;
}
.diminfo__tag {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--subtle);
  white-space: nowrap;
}
.diminfo__txt {
  font-size: 14px;
  line-height: 1.55;
  color: var(--ink-soft);
  margin: 0;
}
.diminfo__txt b {
  color: var(--ink);
  font-weight: 600;
}

/* Sichtbarer Slider + Touch-Verhalten (schmale Viewports / Touch). */
@media (max-width: 719px), (pointer: coarse) {
  .spec__input {
    position: static;
    display: block;
    height: 44px;
    margin-top: 8px;
    opacity: 1;
    cursor: default;
    appearance: auto;
    -webkit-appearance: auto;
    accent-color: var(--ink);
  }
  .spec__stage:has(.spec__input:focus-visible) .spec__frame {
    outline: none;
  }
}

/* ============================================================ */
/* DUNKLE SEKTION «Die Maskierung» (Ink-Inversion + Archivbild)  */
/* ============================================================ */
.wall--ink {
  background-image:
    linear-gradient(rgba(35, 37, 29, 0.88), rgba(35, 37, 29, 0.93)),
    url('/landing/bg-archive-dark.webp');
  background-size: cover;
  background-position: center;
}
.wall--ink .wall__axis {
  background: var(--ink-line);
}
.tablet--ink {
  background: var(--ink-surface-2);
  border-color: var(--ink-line);
}
.wall--ink .eyebrow {
  color: var(--ink-text-muted);
}
.wall--ink .h2 {
  color: var(--ink-text);
}
.wall--ink .lead {
  color: var(--ink-text-soft);
}
.wall--ink .lead em {
  color: var(--ink-text);
}
/* Fliesstext-Link auf dunkler Tafel: die globale a-Regel setzt --ink (dunkel)
   und waere hier unlesbar. */
.wall--ink .lead a {
  color: var(--ink-text);
  text-decoration-color: var(--ink-text-muted);
}
.wall--ink .lead a:hover {
  text-decoration-color: var(--ink-text);
}

/* ---- Bild-Paar ---- */
.pair {
  margin-top: clamp(28px, 4.5vw, 42px);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(14px, 2.5vw, 24px);
}
.pair__item {
  margin: 0;
}
.pair__frame {
  border: 1px solid var(--ink-line);
  border-radius: var(--r);
  overflow: hidden;
  background: var(--ink-surface);
  aspect-ratio: 4 / 3;
}
.pair__frame img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.pair__frame--zoom img {
  transform: scale(2.6);
  transform-origin: 32% 86%;
}
.pair__item figcaption {
  margin-top: 10px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-text-muted);
}

/* ---- WIRKUNG | SUBSTANZ-Aufstellung (dunkel) ---- */
.formula {
  margin-top: clamp(28px, 4.5vw, 42px);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: stretch;
  gap: 0;
  border: 1px solid var(--ink-line);
  border-radius: var(--r);
  overflow: hidden;
  background: var(--ink-surface);
  text-align: left;
}
.formula__side {
  padding: clamp(22px, 3vw, 34px);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.formula__side--look {
  border-right: 1px solid var(--ink-line);
}
.formula__tag {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-text-muted);
}
.formula__name {
  font-weight: 700;
  font-size: clamp(20px, 2.6vw, 28px);
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: var(--ink-text);
  margin: 0;
}
.formula__txt {
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--ink-text-soft);
  margin: 0;
}
.formula__vs {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 18px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 500;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-text-muted);
  background: rgba(255, 255, 255, 0.03);
}
.formula__cap {
  margin: clamp(14px, 2.4vw, 20px) auto 0;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--ink-text-muted);
  text-align: center;
  line-height: 1.6;
}

/* ---- Forschungs-Kennzahlen ---- */
.facts {
  margin-top: clamp(30px, 4.5vw, 44px);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(12px, 2vw, 18px);
  text-align: left;
}
.facts__item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: clamp(18px, 2.6vw, 26px) clamp(16px, 2.2vw, 22px);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r);
}
.facts__num {
  font-weight: 700;
  font-size: clamp(28px, 3.6vw, 38px);
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}
.facts__label {
  margin-top: 6px;
  font-weight: 600;
  font-size: 14px;
  color: var(--ink-soft);
}
.facts__sub {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10.5px;
  letter-spacing: 0.04em;
  color: var(--subtle);
  font-variant-numeric: tabular-nums;
}
.inline-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: clamp(26px, 4vw, 38px);
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 600;
  font-size: 15px;
  color: var(--ink);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: var(--line-strong);
}
.inline-link:hover {
  text-decoration-color: var(--ink);
}
.inline-link .arrow {
  transition: transform 0.14s ease;
}
.inline-link:hover .arrow {
  transform: translateX(3px);
}

/* ============================================================ */
/* Bild-Band · randabfallend                                    */
/* ============================================================ */
.band {
  position: relative;
  width: 100%;
  height: clamp(260px, 38vh, 420px);
  overflow: hidden;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  background: var(--surface-2);
}
.band__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.band__tone {
  position: absolute;
  inset: 0;
  background: linear-gradient(rgba(228, 229, 221, 0.12), rgba(228, 229, 221, 0.12));
  pointer-events: none;
}
.band__chip {
  position: absolute;
  left: 14px;
  bottom: 12px;
  padding: 4px 9px;
  background: var(--canvas);
  border: 1px solid var(--line);
  border-radius: 3px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 9.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

/* ============================================================ */
/* SCHLUSS-CTA · dunkel                                          */
/* ============================================================ */
.closer {
  position: relative;
  background: var(--ink-surface);
  color: var(--ink-text);
  border-top: 1px solid var(--line);
}
.closer__inner {
  max-width: var(--container);
  margin-inline: auto;
  padding: clamp(56px, 8vh, 84px) var(--gutter);
  text-align: center;
}
.closer__head {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(26px, 3.4vw, 40px);
  line-height: 1.08;
  letter-spacing: -0.03em;
  color: var(--ink-text);
  max-width: 22ch;
  margin-inline: auto;
}
.closer__head .dot-end {
  color: var(--crit);
}
.closer__body {
  margin-top: 16px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 13px;
  letter-spacing: 0.02em;
  color: var(--ink-text-soft);
  line-height: 1.6;
}
.closer__cta {
  margin-top: 30px;
}
.arrow {
  display: inline-block;
}

/* ============================================================ */
/* HERO · Plakat-Komposition                                     */
/* Motiv oben randabfallend über die volle Breite, Unterkante     */
/* blendet sich selbst aus, Copy greift von unten hinein.         */
/* ============================================================ */
/* Transparent statt --canvas: So scheint das cursor-reaktive Mess-Raster
   (.lp__grid, fixed auf z-index:-1) auch in der Hero durch und belebt die
   Flächen neben der Copy – dieselbe Logik wie bei den .wall-Sektionen.
   Ohne border-bottom: Hero und erste Sektion teilen denselben Grund, die
   .wall__axis übernimmt die Trennung. */
.hero {
  position: relative;
  overflow: hidden;
}
/* Warmer Lichtkegel unter der Copy: Er hält den Papierton der Marke (--canvas)
   dort, wo gelesen wird, und läuft nach aussen ins Raster aus. Damit steht der
   Text ruhig, ohne dass eine Karte oder Kante nötig wäre – und die Hero
   gewinnt die Tiefe, die eine flache Fläche nicht hergibt. */
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse 64% 56% at 50% 64%,
    var(--canvas) 0%,
    rgba(238, 239, 233, 0.88) 40%,
    rgba(238, 239, 233, 0.55) 62%,
    rgba(238, 239, 233, 0.2) 80%,
    rgba(238, 239, 233, 0) 94%
  );
}

/* ---- Bühne: das Medium über die volle Breite ---- */
.hero__stage {
  position: relative;
  z-index: 1;
  /* Kein 100svh-Zwang: Bühne + Copy sollen zusammen in eine 900er-Viewporthöhe
     passen, ohne dass die CTA unter die Falz rutscht. */
  height: clamp(290px, 42vh, 520px);
  overflow: hidden;
}
.hero__visual {
  position: absolute;
  /* Breiter als die Bühne und rechts verankert: Links liegt im Motiv rund ein
     Viertel leere Wand – die ragt so über den linken Rand hinaus (die Bühne
     schneidet ab) und die Print-Reihe füllt die Fläche, statt sie halb leer
     stehen zu lassen. */
  inset: 0 0 0 auto;
  width: 128%;
  max-width: none;
  height: 100%;
  /* Vertikal 30 %: Bei Breitbild-Beschnitt entscheidet allein die Y-Achse, was
     man sieht. 30 % legt die Leine mit Klammern und dem SemantIC-Etikett ins
     obere Drittel der Bühne – bei 50 % wären beide oben weggeschnitten. */
  object-position: 42% 30%;
  object-fit: cover;
  display: block;
  /* Das Medium blendet sich selbst aus – Maske statt Farbverlauf darüber:
     Dahinter bleibt die Fläche wirklich transparent, das Mess-Raster läuft
     ohne Kante weiter. Ab 86 % ist nichts mehr da; dort sitzt die Fuge. */
  -webkit-mask-image: linear-gradient(
    to bottom,
    #000 0%,
    #000 52%,
    rgba(0, 0, 0, 0.86) 63%,
    rgba(0, 0, 0, 0.5) 73%,
    rgba(0, 0, 0, 0.14) 82%,
    transparent 90%
  );
  mask-image: linear-gradient(
    to bottom,
    #000 0%,
    #000 52%,
    rgba(0, 0, 0, 0.86) 63%,
    rgba(0, 0, 0, 0.5) 73%,
    rgba(0, 0, 0, 0.14) 82%,
    transparent 90%
  );
}

/* ---- Copy-Block: greift in die auslaufende Bildkante ---- */
.hero__inner {
  position: relative;
  z-index: 1;
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: var(--gutter);
  /* Die Copy überlappt die Bühnen-Box, aber nicht das noch sichtbare Bild: Die
     Fuge landet dort, wo der Verlauf bereits ~95 % deckt. Sonst liegt der
     Massstab unruhig auf durchscheinenden Bildkanten. */
  margin-top: clamp(-64px, -6vh, -40px);
  padding-bottom: clamp(44px, 7vh, 84px);
}

/* Fuge Bild|Text: Bildunterschrift mittig, Massstab läuft nach beiden Seiten
   aus. Sie ist genau so breit wie die Textspalte darunter – so rahmt sie die
   Copy, statt als Balken quer durchs Motiv zu laufen. */
.hero__seam {
  display: flex;
  align-items: center;
  gap: clamp(14px, 2.5vw, 26px);
  max-width: 820px;
  margin-inline: auto;
  margin-bottom: clamp(26px, 4.2vh, 46px);
}
.hero__decl {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
  white-space: nowrap;
}
.hero__ticks {
  flex: 1;
  height: 9px;
  /* Massstab mit Hierarchie: kurze Teilstriche im 9px-Raster, jeder fünfte
     länger und kräftiger – ein Lineal, kein gleichförmiges Streifenmuster. */
  background-image:
    repeating-linear-gradient(to right, var(--line-strong) 0 1px, transparent 1px 45px),
    repeating-linear-gradient(to right, var(--line) 0 1px, transparent 1px 9px);
  background-size: 100% 9px, 100% 5px;
  background-repeat: no-repeat;
}
/* Der Massstab läuft von der Mitte nach aussen: beide Hälften sind an der
   Deklaration verankert, damit die Teilstriche dort bündig anschliessen. */
.hero__ticks--l {
  background-position: right bottom, right bottom;
  transform-origin: right center;
}
.hero__ticks--r {
  background-position: left bottom, left bottom;
  transform-origin: left center;
}

.kicker {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 500;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--subtle);
  margin-bottom: 22px;
  display: inline-flex;
  align-items: center;
  gap: 9px;
}
.kicker__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--ink);
}
/* Zentriert wie jede Sektion darunter: Linksbündig war die Hero der einzige
   Ausreisser im Seitenaufbau und liess auf breiten Schirmen die halbe Fläche
   rechts leer stehen. */
.hero__copy {
  max-width: 820px;
  margin-inline: auto;
  text-align: center;
}
.hero__head {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  /* 18ch statt 16ch: Der Umbruch fällt damit auf «Überzeugend ist / nicht
     genug.» – zwei annähernd gleich lange Zeilen, die die Fläche tragen,
     statt eines schmalen Turms in der Mitte. */
  font-size: clamp(40px, 6.2vw, 92px);
  line-height: 0.96;
  letter-spacing: -0.035em;
  color: var(--ink);
  max-width: 18ch;
  margin-inline: auto;
  text-wrap: balance;
}
.hero__head .nowrap {
  white-space: nowrap;
}
.hero__head .end {
  color: var(--accent);
}
.hero__sub {
  margin-top: clamp(20px, 3vw, 30px);
  margin-inline: auto;
  font-size: clamp(15.5px, 1.7vw, 19px);
  line-height: 1.58;
  color: var(--ink-soft);
  /* Etwa auf Headline-Breite: Läuft der Fliesstext breiter als die Zeile
     darüber, kippt die Hierarchie. */
  max-width: 60ch;
  text-wrap: pretty;
}
.hero__cta {
  margin-top: clamp(26px, 3.6vw, 34px);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px 26px;
}
.hero__arrow {
  display: inline-block;
  transition: transform 0.16s ease;
}
.hero__go:hover .hero__arrow {
  transform: translateX(3px);
}
/* Sekundäraktion: keine Unterstrich-Fussnote mehr, sondern eine eigene
   Grundlinie, die auf Hover zur vollen Kante wird. */
.hero__how {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: var(--muted);
  text-decoration: none;
  padding-bottom: 3px;
  border-bottom: 1px solid var(--line-strong);
  transition: color 0.14s ease, border-color 0.14s ease;
}
.hero__how:hover {
  color: var(--ink);
  border-bottom-color: var(--ink);
}
.hero__micro {
  margin-top: clamp(22px, 3.2vw, 30px);
  margin-inline: auto;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11.5px;
  letter-spacing: 0.03em;
  color: var(--muted);
  line-height: 1.6;
  /* Einzeilig, solange die Breite reicht: die kurze zweizeilige Fussnote war
     der dritte schmale Block untereinander. */
  max-width: 100ch;
  text-wrap: balance;
}

/* ---- Auftritt: reine CSS-Keyframes ------------------------------
   Bewusst keine JS-Klasse: CSS greift vor dem ersten Paint, also kein
   Flash zwischen SSR-Markup und Hydration – und der Auftritt läuft auch
   ohne JS. Reihenfolge: Motiv → Fuge → Kicker → Headline → Sub → CTA. */
@keyframes hero-media {
  from { opacity: 0; transform: scale(1.035); }
  to   { opacity: 1; transform: none; }
}
@keyframes hero-rise {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
@keyframes hero-scale-in {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
/* Auftritt auf der BÜHNE, nicht auf dem Medium: Das Medium ist der einzige
   Knoten, der sich zur Laufzeit ändern kann – läge die Animation dort, würde
   sie bei jedem Wechsel neu anlaufen. Die Bühne bleibt stabil. */
.hero__stage {
  animation: hero-media 1100ms cubic-bezier(0.22, 0.61, 0.24, 1) both;
}
/* Weicher Übergang Standbild → Video statt hartem Austausch. */
.hero__visual--motion {
  opacity: 0;
  transition: opacity 0.55s ease;
}
.hero__visual--motion.is-playing {
  opacity: 1;
}
.hero__seam,
.kicker,
.hero__head,
.hero__sub,
.hero__cta,
.hero__micro {
  animation: hero-rise 620ms cubic-bezier(0.22, 0.61, 0.24, 1) both;
}
.hero__seam  { animation-delay: 200ms; }
.kicker      { animation-delay: 300ms; }
.hero__head  { animation-delay: 370ms; }
.hero__sub   { animation-delay: 450ms; }
.hero__cta   { animation-delay: 520ms; }
.hero__micro { animation-delay: 590ms; }
.hero__ticks {
  animation: hero-scale-in 760ms cubic-bezier(0.22, 0.61, 0.24, 1) both;
  animation-delay: 340ms;
}
/* base.css kürzt Animationen global auf 0.01ms; hier zusätzlich hart
   abgeschaltet, damit garantiert der Endzustand steht. */
@media (prefers-reduced-motion: reduce) {
  .hero__stage,
  .hero__seam,
  .hero__ticks,
  .kicker,
  .hero__head,
  .hero__sub,
  .hero__cta,
  .hero__micro {
    animation: none;
  }
  .hero__visual--motion {
    transition: none;
  }
}

/* ============================================================ */
/* REVEALS (Gate via useReveal; ohne JS sofort sichtbar)         */
/* ============================================================ */
.reveal-ready .reveal {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.reveal-ready .reveal.is-in {
  opacity: 1;
  transform: none;
}
.reveal-ready .reveal:focus-within {
  opacity: 1;
  transform: none;
  transition: none;
}
.reveal-ready .reveal.r1 {
  transition-delay: 0.07s;
}
.reveal-ready .reveal.r2 {
  transition-delay: 0.14s;
}
.reveal-ready .reveal.r3 {
  transition-delay: 0.21s;
}
@media (prefers-reduced-motion: reduce) {
  .reveal-ready .reveal {
    opacity: 1 !important;
    transform: none !important;
  }
}

/* ============================================================ */
/* RESPONSIVE + PRINT                                            */
/* ============================================================ */
@media (max-width: 959px) {
  /* Gleiche Plakat-Komposition wie auf Desktop – die frühere Sonderlösung
     (Medium als unten verankertes Fenster mit maskierter Oberkante) war die
     Kompensation für das Text-links-Layout und entfällt mit der Achsendrehung.
     Angepasst werden nur die Proportionen: flachere Bühne, geringere
     Überlappung, engerer Bildausschnitt gegen den Cover-Zoom. */
  .hero {
    border-bottom-color: var(--line);
  }
  .hero__stage {
    height: clamp(240px, 34svh, 400px);
  }
  .hero__visual {
    /* Deutlich stärker als auf Desktop (128 %): Auf schmalen Schirmen bestimmt
       die Höhe die Skalierung, das Bild wird also kaum vergrössert – ohne
       zusätzliche Breite bliebe die leere Wand links im Ausschnitt. 156 %
       schiebt sie ganz hinaus, die Print-Reihe füllt den Rahmen. */
    width: 156%;
    object-position: 50% 40%;
  }
  .hero__inner {
    margin-top: clamp(-48px, -4.5svh, -28px);
  }
}
@media (max-width: 719px) {
  .lead {
    text-align: center;
  }
  /* Unter 720px bleibt für den Massstab neben der Deklaration nur ein Stummel
     übrig – dann trägt die Fuge die Bildunterschrift allein, mittig. */
  .hero__ticks {
    display: none;
  }
  .hero__seam {
    justify-content: center;
  }
  .hero__cta {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  .hero__cta :deep(a:first-child) {
    width: 100%;
  }
  .hero__how {
    align-self: center;
  }
  .pair {
    grid-template-columns: 1fr;
  }
  .facts {
    grid-template-columns: 1fr;
  }
  /* WIRKUNG | SUBSTANZ stapeln; «vs.» wird zur horizontalen Trennzeile. */
  .formula {
    grid-template-columns: 1fr;
  }
  .formula__side--look {
    border-right: none;
    border-bottom: 1px solid var(--ink-line);
  }
  .formula__vs {
    padding: 10px;
    border-bottom: 1px solid var(--ink-line);
  }
  .band {
    height: clamp(200px, 32vh, 320px);
  }
  .diminfo__row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
@media print {
  .closer,
  .band {
    display: none;
  }
  /* Der Hero-Auftritt startet per fill-mode:both bei opacity 0. Ein Druck bzw.
     PDF-Export direkt nach dem Laden erwischte sonst eine leere erste Seite
     (in Chromium reproduziert, Codex-Review 2026-07-24) – auf Papier gilt
     immer der Endzustand. */
  .hero__stage,
  .hero__seam,
  .hero__ticks,
  .kicker,
  .hero__head,
  .hero__sub,
  .hero__cta,
  .hero__micro {
    animation: none;
    opacity: 1;
    transform: none;
  }
  /* Auf Papier steht das Standbild; das Video-Overlay wäre ein leeres Feld. */
  .hero__visual--motion {
    display: none;
  }
  /* Der Lichtkegel braucht das Raster als Gegenstück – auf Papier gibt es
     keins (.lp__grid ist ausgeblendet), er würde nur als grauer Fleck
     drucken (base.css erzwingt print-color-adjust: exact). */
  .hero::before {
    display: none;
  }
  /* Ohne Maske im Druck: Der weiche Auslauf wird auf Papier zu einem
     ausgewaschenen Rand; die klare Kante ist im Druck das ehrlichere Bild. */
  .hero__visual {
    -webkit-mask-image: none;
    mask-image: none;
  }
  /* Bedienhinweis auf Papier sinnlos – der Regler laesst sich nicht ziehen. */
  .spec__pull {
    display: none;
  }
  .lp__grid {
    display: none;
  }
  .wall,
  .wall--ink {
    background: #fff;
    background-image: none;
    padding-block: 24px;
  }
  .wall--ink .h2,
  .wall--ink .lead,
  .wall--ink .lead em,
  .wall--ink .eyebrow {
    color: var(--ink);
  }
  /* innere Ink-Tafel im Druck aufhellen, sonst dunkler Text auf dunkler Tafel. */
  .tablet--ink {
    background: #fff;
    border-color: var(--line);
  }
  .pair__item {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .pair__item figcaption {
    color: var(--muted);
  }
  /* Formel auf Weiss lesbar machen. */
  .formula,
  .formula__side,
  .formula__vs {
    background: #fff;
    border-color: var(--line);
  }
  .formula__side--look {
    border-right-color: var(--line);
  }
  .formula__tag {
    color: var(--muted);
  }
  .formula__name {
    color: var(--ink);
  }
  .formula__txt {
    color: var(--ink-soft);
  }
  .formula__cap {
    color: var(--muted);
  }
  .formula,
  .facts,
  .facts__item {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
</style>
