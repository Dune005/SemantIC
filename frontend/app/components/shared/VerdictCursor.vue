<script setup lang="ts">
// Custom-Cursor «08 Dual-State» (Frontend 1.5, L3) — Produktisierung aus
// Konzept_Frontend/umsetzung-1.5/cursor-konzepte.html. Ein 30px-Kreis folgt dem
// Zeiger 1:1 (direktes translate, kein Lerp); über [data-verdict]-Zonen wird er
// zum Verdikt: ✓ (ok) / ✕ (crit), sonst neutraler Punkt.
//
// Leitplanken:
// - Nur auf hover+fine-Geräten initialisiert (Touch/Coarse: nativer Cursor, kein Loop).
// - elementFromPoint NUR bei Pointer-Bewegung (Dirty-Flag), nicht pro Frame.
// - Formularfelder behalten den nativen Cursor (CSS-Ausnahme), der Kreis blendet aus.
// - prefers-reduced-motion: keine Scale/Farb-Transition (Position ist nutzergesteuert).
// - Abschalten/Austauschen = eine Zeile in layouts/default.vue (User-Vorbehalt).
const circle = ref<HTMLElement | null>(null)

let raf = 0
let framePending = false
let px = -100
let py = -100
let active = false
let onMove: ((e: PointerEvent) => void) | null = null

// Über diesen Elementen gilt der native Cursor (Text-Eingabe-Affordanz) —
// muss zur CSS-Ausnahme unten passen.
const NATIVE_CURSOR_SELECTOR = 'input, textarea, select, [contenteditable="true"], [contenteditable=""]'

onMounted(() => {
  const el = circle.value
  if (!el) return
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

  active = true
  document.documentElement.classList.add('verdict-cursor-active')

  // Frames werden NUR aus pointermove angefordert (Codex-Review 2026-06-11):
  // keine Leerlauf-rAF-Schleife über die ganze Sitzung; pro Frame höchstens
  // ein Update + ein elementFromPoint, egal wie viele move-Events feuern.
  const process = () => {
    framePending = false
    el.style.transform = `translate(${px}px, ${py}px)`
    const target = document.elementFromPoint(px, py)
    const overNative = !!target?.closest(NATIVE_CURSOR_SELECTOR)
    const zone = target?.closest('[data-verdict]')
    const verdict = zone?.getAttribute('data-verdict') ?? null
    el.classList.toggle('is-hidden', overNative)
    el.classList.toggle('ok', verdict === 'ok')
    el.classList.toggle('crit', verdict === 'crit')
    el.textContent = verdict === 'ok' ? '✓' : verdict === 'crit' ? '✕' : '·'
  }
  onMove = (e: PointerEvent) => {
    px = e.clientX
    py = e.clientY
    if (!framePending) {
      framePending = true
      raf = requestAnimationFrame(process)
    }
  }
  window.addEventListener('pointermove', onMove, { passive: true })
})

onBeforeUnmount(() => {
  if (!active) return
  cancelAnimationFrame(raf)
  if (onMove) window.removeEventListener('pointermove', onMove)
  document.documentElement.classList.remove('verdict-cursor-active')
})
</script>

<template>
  <div ref="circle" class="vc" aria-hidden="true">·</div>
</template>

<style>
/* Bewusst UN-scoped: die cursor:none-Regeln müssen global auf html/Elemente wirken.
   Aktiv nur unter html.verdict-cursor-active (gesetzt von dieser Komponente,
   ausschliesslich auf hover+fine-Geräten). */
html.verdict-cursor-active,
html.verdict-cursor-active * {
  cursor: none !important;
}
/* Text-Eingabe-Affordanz bleibt nativ (Bypass-Feld, analyze-Formulare). */
html.verdict-cursor-active input,
html.verdict-cursor-active textarea,
html.verdict-cursor-active select,
html.verdict-cursor-active [contenteditable='true'],
html.verdict-cursor-active [contenteditable=''] {
  cursor: auto !important;
}

.vc {
  position: fixed;
  left: 0;
  top: 0;
  width: 30px;
  height: 30px;
  margin: -15px 0 0 -15px;
  border-radius: 50%;
  border: 2px solid var(--line-strong);
  background: rgba(255, 255, 255, 0.85);
  display: none;
  align-items: center;
  justify-content: center;
  font: 700 15px/1 'IBM Plex Sans', system-ui, sans-serif;
  color: var(--muted);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.4);
  /* KEINE transform-Transition: sichtbare Position und elementFromPoint-Hit-Test
     müssen synchron bleiben (Codex-Review 2026-06-11). */
  transition: border-color 0.12s, color 0.12s, opacity 0.12s;
  pointer-events: none;
  z-index: 9999;
  will-change: transform;
  /* Start ausserhalb des Viewports, bis die erste Pointer-Bewegung positioniert. */
  transform: translate(-100px, -100px);
}
html.verdict-cursor-active .vc {
  display: flex;
}
.vc.ok {
  border-color: var(--safe);
  color: var(--safe);
}
.vc.crit {
  border-color: var(--crit);
  color: var(--crit);
}
.vc.is-hidden {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .vc {
    transition: none;
  }
}
@media print {
  .vc {
    display: none !important;
  }
}
</style>
