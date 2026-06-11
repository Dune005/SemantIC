<script setup lang="ts">
// Produkt-Hero «Mess-Raster» (Frontend 1.5, L1): getrackte Produktisierung der
// Hero-Lab-Variante HeroDotGrid. NICHT aus herolab/ importieren — der Ordner ist
// bewusst untracked (Spielwiese), ein Import würde den Vercel-Build brechen.
// Monochromes Punktraster auf Canvas, reagiert dezent auf die Maus (Mess-/
// Laborfeld-Anmutung); Akzentfarbe nur im unmittelbaren Cursor-Radius.
// Dekorativ → aria-hidden. Reduced-Motion ODER Touch/Coarse-Pointer: statisches
// Raster, kein rAF-Loop.
import Button from '~/components/ui/Button.vue'

// Kicker: «Validator» bewusst abgeschwächt (F4-Entscheid 2026-06-10) — keine
// garantie-suggerierende Selbstbezeichnung. Finale Wortwahl trifft der
// Bearbeiter im Browser-Review; Alternativen werden dort vorgelegt.
const KICKER = 'AI Visual Integrity Check'

const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let raf = 0
let ro: ResizeObserver | null = null
let parentEl: HTMLElement | null = null
let onMove: ((e: PointerEvent) => void) | null = null
let onLeave: (() => void) | null = null
const pointer = { x: -9999, y: -9999, active: false }

const GAP = 30
const RADIUS = 130 // Einflussradius des Cursors

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
  // Touch-/Coarse-Geräte: kein Pointer-Tracking, statisches Raster (kein Loop).
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const animate = !reduce && finePointer
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  let w = 0
  let h = 0

  const dotBase = colorVar('--line')
  const dotInk = colorVar('--ink-soft')
  const accent = colorVar('--crit')

  const resize = () => {
    const rect = el.getBoundingClientRect()
    w = rect.width
    h = rect.height
    el.width = w * dpr
    el.height = h * dpr
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
    draw(w, h, dotBase, dotInk, accent, animate)
  }

  ro = new ResizeObserver(resize)
  ro.observe(el)
  resize()

  if (!animate) return

  // Kein Dauer-rAF-Loop (Codex-Review 2026-06-11): Das Raster ist rein
  // pointer-getrieben — neu gezeichnet wird nur bei Pointer-Bewegung (max. 1×
  // pro Frame) und einmal beim Verlassen (Reset auf den Grundzustand). Ohne
  // Bewegung oder ausserhalb des Viewports fällt damit keine Arbeit an.
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
    const rect = el.getBoundingClientRect()
    pointer.x = e.clientX - rect.left
    pointer.y = e.clientY - rect.top
    pointer.active = true
    scheduleDraw()
  }
  onLeave = () => {
    pointer.active = false
    scheduleDraw()
  }
  parentEl = el.parentElement
  parentEl?.addEventListener('pointermove', onMove)
  parentEl?.addEventListener('pointerleave', onLeave)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  ro?.disconnect()
  if (onMove) parentEl?.removeEventListener('pointermove', onMove)
  if (onLeave) parentEl?.removeEventListener('pointerleave', onLeave)
})
</script>

<template>
  <section class="grid-hero" aria-labelledby="hero-headline">
    <canvas ref="canvas" class="grid-hero__canvas" aria-hidden="true" />
    <div class="grid-hero__inner">
      <p class="kicker"><span class="dot" aria-hidden="true" />{{ KICKER }}</p>
      <h1 id="hero-headline" class="grid-hero__head">
        Überzeugend ist <span class="nowrap">nicht genug<span class="end">.</span></span>
      </h1>
      <p class="grid-hero__sub">
        SemantIC prüft KI-generierte Bilder vor der Veröffentlichung auf physikalische
        Kohärenz, semantische Konsistenz und Bias – und markiert dir die Stellen,
        die du vor der Publikation selbst prüfen solltest.
      </p>
      <div class="grid-hero__cta">
        <Button as="a" href="/analyze" variant="primary" size="md">
          Bild prüfen <span aria-hidden="true">→</span>
        </Button>
        <Button as="a" href="/how-it-works" variant="ghost" size="md" class="ghost-link">
          Wie das funktioniert
        </Button>
      </div>
      <p class="grid-hero__micro">
        Research Preview · entstanden in der Bachelorarbeit ‹Visual Bias im
        KI-generierten Bild›, FH Graubünden
      </p>
    </div>
  </section>
</template>

<style scoped>
.grid-hero {
  position: relative;
  background: var(--canvas);
  overflow: hidden;
}
.grid-hero__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
.grid-hero__inner {
  position: relative;
  max-width: var(--container);
  margin-inline: auto;
  padding: clamp(64px, 12vh, 132px) var(--gutter);
  pointer-events: none;
}
.grid-hero__inner :deep(a) { pointer-events: auto; }
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
  pointer-events: auto;
}
.kicker .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--ink); }
.grid-hero__head {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(40px, 6.2vw, 68px);
  line-height: 0.98;
  letter-spacing: -0.035em;
  color: var(--ink);
  pointer-events: auto;
}
.grid-hero__head .nowrap { white-space: nowrap; }
.grid-hero__head .end { color: var(--accent); }
.grid-hero__sub {
  margin-top: 22px;
  font-size: clamp(15px, 1.5vw, 17px);
  line-height: 1.55;
  color: var(--ink-soft);
  max-width: 46ch;
  pointer-events: auto;
}
.grid-hero__cta {
  margin-top: 30px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
}
.ghost-link {
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: var(--line-strong);
}
.ghost-link:hover {
  text-decoration-color: var(--ink);
}
.grid-hero__micro {
  margin-top: 22px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11.5px;
  letter-spacing: 0.03em;
  color: var(--muted);
  line-height: 1.6;
  max-width: 52ch;
  pointer-events: auto;
}
@media (max-width: 719px) {
  .grid-hero__cta { flex-direction: column; align-items: stretch; }
  .grid-hero__cta :deep(a) { width: 100%; }
}
</style>
