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

useHead({
  title: 'SemantIC – Überzeugend ist nicht genug.',
  meta: [
    {
      name: 'description',
      content:
        'SemantIC entstand aus der Analyse von 144 KI-generierten Bildern – ein Forschungsprototyp, der Bilder auf physikalische Kohärenz, semantische Konsistenz und Bias prüft.',
    },
  ],
})

// Hero-Kicker: bewusst NICHT der Brand-Claim «AI Visual Integrity Check» (der
// steht schon im Header direkt darüber) – stattdessen die drei Prüfdimensionen,
// die der Lead danach ausformuliert.
const KICKER = 'Physik · Semantik · Bias'

// ---- Hero-Video-Gate: nur fine-pointer ohne reduced-motion bekommt das Video --
const showMotion = ref(false)
const heroVideo = ref<HTMLVideoElement | null>(null)
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
const DIMS: Record<DimKey, Dim> = {
  phys: {
    label: 'Physik',
    chip: 'Stethoskop-Knoten',
    zone: { left: '32%', top: '42%', width: '34%', height: '36%' },
    strong: 'Licht, Schatten, Material.',
    body: 'Hier sichtbar: Das Stethoskop ist unmöglich verschlungen – Schlauch, Bügel und Band laufen so zusammen, dass es sich real nicht tragen liesse. Ein Strukturfehler, der im Gesamteindruck untergeht.',
  },
  sem: {
    label: 'Semantik',
    chip: 'Fremdes Foto',
    zone: { left: '40%', top: '82%', width: '15%', height: '15%' },
    strong: 'Inhalt, Kontext, Logik.',
    body: 'Passt die Szene zusammen? Hier nicht: Das Namensschild zeigt das Foto einer anderen Person, Name und Beschriftung sind Zeichensalat – ein Kontextbruch mitten im Bild.',
  },
  bias: {
    label: 'Bias',
    chip: 'Rollenklischee',
    chipBelow: true,
    zone: { left: '39%', top: '5%', width: '23%', height: '28%' },
    strong: 'Darstellung, Rolle, Machtdynamik.',
    body: 'Geschlecht und Hautfarbe werden nur beschrieben, nie bewertet. Bewertet wird das Muster: Die Pflegefachperson ist wie selbstverständlich als junge, makellose Frau besetzt – ein Rollen- und Körperklischee, das Bildgeneratoren immer wieder reproduzieren.',
  },
}
const dim = ref<DimKey>('phys')
const current = computed(() => DIMS[dim.value])
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
      <!-- ============ HERO · Video rechts, Copy links, weicher Verlauf ======== -->
      <section class="hero" aria-labelledby="hero-headline">
        <div class="hero__inner">
          <div class="hero__copy">
            <p class="kicker"><span class="kicker__dot" aria-hidden="true" />{{ KICKER }}</p>
            <h1 id="hero-headline" class="hero__head">
              Überzeugend ist <span class="nowrap">nicht genug<span class="end">.</span></span>
            </h1>
            <p class="hero__sub">
              SemantIC entstand aus der Analyse von 144 KI-generierten Bildern: ein
              Forschungsprototyp, der deine Bilder auf physikalische Kohärenz, semantische
              Konsistenz und Bias prüft – und dir die Stellen markiert, die einen
              zweiten Blick verdienen.
            </p>
            <div class="hero__cta">
              <Button as="a" href="/analyze" variant="primary" size="md">
                Bild prüfen lassen <span aria-hidden="true">→</span>
              </Button>
              <NuxtLink to="/how-it-works" class="hero__how">Wie das funktioniert</NuxtLink>
            </div>
            <p class="hero__micro">
              Research Preview · entstanden im Rahmen einer Bachelorarbeit an der
              Fachhochschule Graubünden
            </p>
          </div>
        </div>

        <div class="hero__media">
          <video
            v-if="showMotion"
            ref="heroVideo"
            class="hero__visual"
            poster="/landing/hero-loop-leine-poster.jpg"
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
            aria-hidden="true"
          >
            <source src="/landing/hero-loop-leine.webm" type="video/webm" />
            <source src="/landing/hero-loop-leine.mp4" type="video/mp4" />
          </video>
          <img
            v-else
            class="hero__visual"
            src="/landing/hero-loop-leine-poster.jpg"
            width="2752"
            height="1536"
            alt="KI-generiertes Moodbild: Fotodrucke mit roten Prüfpunkten hängen an einer Leine im hellen Tageslicht, dazwischen ein Etikett mit dem Schriftzug SemantIC."
          />
          <span class="hero__fade" aria-hidden="true" />
          <span class="hero__chip">{{ showMotion ? 'KI-generiertes Moodvideo' : 'KI-generiertes Moodbild' }}</span>
        </div>
      </section>

      <!-- ============ KACHEL 1 · Der blinde Fleck + Prüftisch ================== -->
      <section class="wall" aria-labelledby="s1-head">
        <span class="wall__axis" aria-hidden="true" />
        <div class="center">
          <div class="tablet tablet--canvas">
            <p class="eyebrow reveal">Der blinde Fleck</p>
            <h2 id="s1-head" class="h2 reveal r1">Ein Bild kann perfekt aussehen und trotzdem nicht stimmen.</h2>
            <p class="lead reveal r2">
              KI-Bildgeneratoren sind gut darin, Bilder schön zu machen – und deutlich
              schlechter darin, sie <em>richtig</em> zu machen: physikalisch plausibel,
              inhaltlich passend, frei von Klischees. Die visuelle Perfektion überdeckt
              diese Schwächen: Ein Bild wirkt so überzeugend, dass du gar nicht erst
              hinschaust, ob es auch hält. Diesen Effekt nennen wir <em>Maskierung</em> –
              ihm arbeitet SemantIC entgegen.
            </p>

            <p class="switch-hint reveal r2">
              Dasselbe Beispielbild, drei Blickwinkel: Physik, Semantik und Bias.
              Wechsle die Dimension und zieh den Regler in die Befund-Ansicht.
            </p>

            <!-- Segmented-Control statt role=tablist (Codex-Review): Buttons mit
                 aria-pressed, monochrome Punkte (KEINE Severity-Farben). -->
            <div class="dims reveal r2" role="group" aria-label="Prüf-Dimension wählen">
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
                      alt="KI-generiertes Beispielbild: Junge Pflegefachfrau mit Stethoskop und Namensschild in einem Spitalkorridor."
                    />
                    <!-- Befund-Layer: per clip-path vom Regler freigegeben. -->
                    <div class="spec__anno" :style="{ clipPath: `inset(0 ${100 - reveal}% 0 0)` }">
                      <span class="spec__tint" aria-hidden="true" />
                      <span class="spec__zone spec__zone--crit" :style="zoneStyle">
                        <span class="spec__chip" :class="{ 'spec__chip--below': current.chipBelow }">{{ current.chip }}</span>
                      </span>
                    </div>
                    <div class="spec__divider" aria-hidden="true" :style="{ left: gripLeft }">
                      <span class="spec__grip">PRÜFUNG ◂▸ WIRKUNG</span>
                    </div>
                  </div>
                  <input
                    v-model.number="reveal"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    class="spec__input"
                    aria-label="Befund-Ansicht einblenden"
                    aria-describedby="spec-dim-desc"
                    :aria-valuetext="`${reveal} Prozent der Befund-Ansicht sichtbar`"
                  />
                </div>
                <figcaption class="spec__card">
                  Beispiel-Exponat · KI-generiert · Demo-Ansicht – zieh den Regler für die Befund-Ansicht
                </figcaption>
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
            <p class="eyebrow reveal">Die Maskierung</p>
            <h2 id="s3-head" class="h2 reveal r1">Die Lücke zwischen schön und stimmig.</h2>
            <p class="lead reveal r2">
              SemantIC bewertet zwei Dinge strikt getrennt: wie ein Bild <em>wirkt</em>
              (Ästhetik) und was es inhaltlich <em>hält</em> (Integrität). So wird sichtbar,
              wenn ein Bild besser aussieht, als es ist – der Nährboden für Maskierung.
              Wie der Maskierungs-Check im Detail funktioniert, zeigt die Erklärseite.
            </p>

            <!-- Bild-Paar oben: Gesamteindruck + Detail-Crop. -->
            <div class="pair reveal r2">
              <figure class="pair__item">
                <div class="pair__frame">
                  <img
                    src="/landing/masking-press.webp"
                    width="1616"
                    height="1024"
                    loading="lazy"
                    alt="KI-generiertes Beispielbild in der Gesamtansicht: Frau spricht an einer Pressekonferenz in mehrere Mikrofone."
                  />
                </div>
                <figcaption>Gesamtwirkung – überzeugend</figcaption>
              </figure>
              <figure class="pair__item">
                <div class="pair__frame pair__frame--zoom">
                  <img
                    src="/landing/masking-press.webp"
                    width="1616"
                    height="1024"
                    loading="lazy"
                    alt="Detailausschnitt desselben Bildes: Die Senderlogos auf den Mikrofonen sind unleserlicher Zeichensalat."
                  />
                </div>
                <figcaption>Detail – die Mikrofon-Logos sind Zeichensalat</figcaption>
              </figure>
            </div>

            <!-- WIRKUNG | SUBSTANZ darunter, volle Breite (v18-atelier-Übernahme). -->
            <div class="formula reveal r3" role="group" aria-label="Wirkung gegenüber Substanz">
              <div class="formula__side formula__side--look">
                <span class="formula__tag">Wirkung</span>
                <h3 class="formula__name">Wie ein Bild wirkt</h3>
                <p class="formula__txt">Die ästhetische Oberfläche – Stimmung, Schärfe, Komposition. Was auf den ersten Blick überzeugt.</p>
              </div>
              <div class="formula__vs" aria-hidden="true">vs.</div>
              <div class="formula__side">
                <span class="formula__tag">Substanz</span>
                <h3 class="formula__name">Was es inhaltlich hält</h3>
                <p class="formula__txt">Physik, Semantik, Bias. Was beim genauen Hinsehen trägt – oder eben nicht.</p>
              </div>
            </div>
            <p class="formula__cap reveal r3">
              Beide werden bewusst getrennt bewertet – nie zu einer Zahl verschmolzen.
            </p>
          </div>
        </div>
      </section>

      <!-- ============ EINORDNUNG · hellster Moment (randlos) ================== -->
      <section class="wall wall--surface" aria-labelledby="s4-head">
        <span class="wall__axis" aria-hidden="true" />
        <div class="center">
          <div class="open">
            <p class="eyebrow reveal">Zur Einordnung</p>
            <h2 id="s4-head" class="h2 reveal r1">Kein Echtheits-Detektor.</h2>
            <p class="lead reveal r2">
              SemantIC sagt dir nicht, ob ein Bild „echt" oder „KI" ist, und sortiert
              nicht in „Fake" und „nicht Fake". Es bewertet die <em>Qualität</em> eines
              bereits als KI-generiert bekannten Bildes – schlechte KI gegen gute KI.
              Und jeder Befund ist ein Hinweis, kein Urteil.
            </p>
          </div>
        </div>
      </section>

      <!-- ============ Bild-Band · randabfallend ============================== -->
      <section class="band" aria-label="Atelier-Einblick">
        <img
          class="band__img"
          src="/landing/band-printstudio.webp"
          width="2752"
          height="1536"
          loading="lazy"
          alt="KI-generiertes Moodbild: Prüftisch mit ausgelegten Fotodrucken, eine Hand setzt eine rote Markierung."
        />
        <span class="band__tone" aria-hidden="true" />
        <span class="band__chip">KI-generiertes Moodbild</span>
      </section>

      <!-- ============ DIE FORSCHUNG DAHINTER ================================= -->
      <section class="wall" aria-labelledby="s5-head">
        <span class="wall__axis" aria-hidden="true" />
        <div class="center">
          <div class="tablet tablet--canvas">
            <p class="eyebrow reveal">Die Forschung dahinter</p>
            <h2 id="s5-head" class="h2 reveal r1">Die Prüflogik kommt aus eigener Forschung.</h2>
            <p class="lead reveal r2">
              Die Kriterien, nach denen SemantIC prüft, stammen aus einer eigenen
              qualitativen Inhaltsanalyse von 144 KI-generierten Bildern – wie daraus
              die Prüfung wurde und wo ihre Grenzen liegen, steht offen auf der
              Erklärseite.
            </p>

            <div class="facts reveal r2">
              <div class="facts__item">
                <span class="facts__num">144</span>
                <span class="facts__label">codierte Bilder</span>
                <span class="facts__sub">qualitative Inhaltsanalyse</span>
              </div>
              <div class="facts__item">
                <span class="facts__num">5</span>
                <span class="facts__label">Lesearten</span>
                <span class="facts__sub">WA · DA · CI · AA · MI</span>
              </div>
              <div class="facts__item">
                <span class="facts__num">9</span>
                <span class="facts__label">visuelle Treiber</span>
                <span class="facts__sub">von Cinematic Lighting bis Bokeh</span>
              </div>
            </div>

            <p class="reveal r3">
              <NuxtLink to="/how-it-works" class="inline-link">
                So funktioniert die Prüfung <span class="arrow" aria-hidden="true">→</span>
              </NuxtLink>
            </p>
          </div>
        </div>
      </section>

      <!-- ================= SCHLUSS-CTA · dunkel ================= -->
      <section class="closer" aria-labelledby="closer-head">
        <div class="closer__inner">
          <h2 id="closer-head" class="closer__head">Lass dein Bild prüfen, bevor es jemand anderes tut<span class="dot-end">.</span></h2>
          <p class="closer__body">Ein Bild ablegen, kurz warten, einen Befund lesen. Keine Anmeldung.</p>
          <div class="closer__cta">
            <Button as="a" href="/analyze" variant="inverse" size="md">
              Jetzt prüfen lassen <span class="arrow" aria-hidden="true">→</span>
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
  background: var(--surface);
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
  transition: color 0.15s ease, background 0.15s ease;
}
.dims__tab:hover {
  color: var(--ink-soft);
}
.dims__tab.is-active {
  background: var(--ink);
  color: var(--surface);
}
.dims__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--line-strong);
  flex: 0 0 auto;
}
.dims__tab.is-active .dims__dot {
  background: var(--surface);
}

/* Passepartout direkt auf dem <figure> – so bleibt figcaption ein direkter
   figure-Kind (valide Caption-Zuordnung, Codex-Review). */
.spec {
  max-width: 460px;
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
.spec__card {
  margin-top: clamp(14px, 2.4vw, 22px);
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
/* HERO · Video-Backdrop rechts, Copy links, weicher Verlauf     */
/* ============================================================ */
.hero {
  position: relative;
  background-color: var(--canvas);
  border-bottom: 1px solid var(--line-soft);
  overflow: hidden;
}
.hero__inner {
  position: relative;
  z-index: 1;
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: var(--gutter);
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
.hero__copy {
  max-width: 660px;
  padding-block: clamp(80px, 15vh, 170px);
}
.hero__head {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(48px, 6.4vw, 88px);
  line-height: 0.98;
  letter-spacing: -0.035em;
  color: var(--ink);
  max-width: 16ch;
  text-wrap: balance;
}
.hero__head .nowrap {
  white-space: nowrap;
}
.hero__head .end {
  color: var(--accent);
}
.hero__sub {
  margin-top: clamp(24px, 3.5vw, 36px);
  font-size: clamp(16px, 1.7vw, 19px);
  line-height: 1.6;
  color: var(--ink-soft);
  max-width: 52ch;
}
.hero__cta {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}
.hero__how {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 500;
  font-size: 13.5px;
  color: var(--muted);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: var(--line-strong);
  transition: color 0.12s ease, text-decoration-color 0.12s ease;
}
.hero__how:hover {
  color: var(--ink);
  text-decoration-color: var(--ink);
}
.hero__micro {
  margin-top: 24px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11.5px;
  letter-spacing: 0.03em;
  color: var(--muted);
  line-height: 1.6;
  max-width: 52ch;
}
.hero__media {
  position: absolute;
  inset: 0;
  z-index: 0;
}
/* Full-bleed statt 66 %: es gibt KEINE harte Bildkante mehr (User-Feedback
   17.06.). Das Medium deckt die ganze Hero-Fläche; der Verlauf links erzeugt
   den Text-Freiraum und blendet nach rechts ins Bild aus – «Video läuft rechts»
   bleibt visuell erhalten, ohne sichtbare Kante. */
.hero__visual {
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
  object-fit: cover;
  display: block;
}
.hero__fade {
  position: absolute;
  inset: 0;
  /* Rechts früher auf null (User-Feedback 2026-07-19): voller Schutz bleibt
     hinter der Copy (bis ~40 %), danach fällt der Verlauf zügig ab, damit das
     Video ab Textende nicht flau wirkt. */
  background: linear-gradient(
    90deg,
    var(--canvas) 0%,
    var(--canvas) 44%,
    rgba(238, 239, 233, 0.9) 53%,
    rgba(238, 239, 233, 0.55) 61%,
    rgba(238, 239, 233, 0.22) 69%,
    rgba(238, 239, 233, 0.06) 77%,
    rgba(238, 239, 233, 0) 85%
  );
}
.hero__chip {
  position: absolute;
  right: 14px;
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
  /* Mobil kein separater Bild-Block und kein Farb-Overlay (Codex-Review
     2026-07-19): Das Medium sitzt als unten verankertes Fenster fester Höhe
     im Hero; seine Oberkante läuft per mask-image ins Transparente aus, das
     Bild blendet sich also selbst ein. Die geringere Höhe verkleinert den
     Cover-Zoom → mehr Motivbreite (Klammern + SemantIC-Etikett sichtbar).
     Gemeinsame Variable hält Copy-Abstand und Medienhöhe synchron. */
  .hero {
    --hero-mobile-media-h: clamp(200px, 30svh, 300px);
    border-bottom-color: var(--line);
  }
  .hero__copy {
    /* Bewusste Überlappung: die letzte Copy-Zeile liegt auf der ausgeblendeten
       Bildoberkante, damit Text und Medium ineinandergreifen statt zu stapeln. */
    padding-block: clamp(48px, 9svh, 96px) calc(var(--hero-mobile-media-h) - 28px);
  }
  .hero__visual {
    /* Breiter als der Viewport + rechts verankert: die leere Wandfläche links
       im Motiv ragt über den Bildschirmrand hinaus (Hero hat overflow:hidden),
       die Print-Reihe füllt die Breite. */
    inset: auto 0 0 auto;
    width: 140%;
    max-width: none;
    height: var(--hero-mobile-media-h);
    object-position: 50% 16%;
    -webkit-mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(0, 0, 0, 0.14) 12%,
      rgba(0, 0, 0, 0.6) 24%,
      #000 36%
    );
    mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(0, 0, 0, 0.14) 12%,
      rgba(0, 0, 0, 0.6) 24%,
      #000 36%
    );
  }
  .hero__fade {
    display: none;
  }
}
@media (max-width: 719px) {
  .lead {
    text-align: center;
  }
  .hero__cta {
    align-items: stretch;
  }
  .hero__cta :deep(a:first-child) {
    width: 100%;
  }
  .hero__how {
    align-self: flex-start;
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
