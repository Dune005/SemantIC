<script setup lang="ts">
// Custom-Cursor «08 Dual-State» (Frontend 1.5, L3) — Produktisierung aus
// Konzept_Frontend/umsetzung-1.5/cursor-konzepte.html.
//
// Zwei getrennte Signal-Kanäle (Erweiterung 1.11):
// - Farbe/Zeichen = SEMANTIK: was ist das hier? ✓ (ok) / ✕ (crit) / · neutral,
//   gesteuert über [data-verdict]-Zonen.
// - Form/Grösse   = AFFORDANZ: was kann ich damit tun? Über klickbaren Elementen
//   zieht sich der Ring zum roten Punkt zusammen (30 → 18px), über Fliesstext
//   wird er zum Strich (I-Beam-Äquivalent).
// Beide Kanäle überschreiben einander NICHT: eine klickbare Verdikt-Zone füllt
// sich in --safe/--crit statt in --ink und behält ihr ✓/✕.
//
// Vorher kannte der Kreis nur den Semantik-Kanal — und weil [data-verdict] nur
// auf den Landing-Dimensionskarten sitzt, war er auf allen anderen Seiten
// konstant derselbe graue Punkt, während `cursor: none` gleichzeitig jedes
// `cursor: pointer` im Projekt neutralisierte.
//
// Leitplanken:
// - Nur auf hover+fine-Geräten initialisiert (Touch/Coarse: nativer Cursor, kein Loop).
// - elementFromPoint NUR bei Pointer-Bewegung (Dirty-Flag), nicht pro Frame.
// - Formularfelder behalten den nativen Cursor (CSS-Ausnahme), der Kreis blendet aus.
// - prefers-reduced-motion: keine Scale/Farb-Transition (Position ist nutzergesteuert).
// - Abschalten/Austauschen = eine Zeile in layouts/default.vue (User-Vorbehalt).
const root = ref<HTMLElement | null>(null)
const dot = ref<HTMLElement | null>(null)

let raf = 0
let framePending = false
let px = -100
let py = -100
let active = false
let onMove: ((e: PointerEvent) => void) | null = null
let onDown: (() => void) | null = null
let onUp: (() => void) | null = null

// Über diesen Elementen gilt der native Cursor (Text-Eingabe-Affordanz) —
// muss zur CSS-Ausnahme unten passen. `[data-cursor="native"]` ist das
// allgemeine Opt-out für Flächen, auf denen der Kreis stört statt hilft
// (z. B. das Hero-Medium: dort soll das Bild wirken, nicht der Zeiger).
const NATIVE_CURSOR_SELECTOR =
  'input, textarea, select, [contenteditable="true"], [contenteditable=""], [data-cursor="native"]'

// Klickbar. Deckt die reka-ui-Primitives mit ab, die ihre Rolle über role=
// statt über das Tag deklarieren.
const INTERACTIVE_SELECTOR =
  'a[href], button, summary, label[for], [role="button"], [role="link"], [role="tab"], [role="menuitem"], [tabindex]:not([tabindex="-1"])'

// Markierbarer Fliesstext. Bewusst NUR echte Textcontainer und nicht jedes
// span/div — sonst wäre der Kreis auf Textseiten dauerhaft ein Strich.
const TEXT_SELECTOR = 'p, li, blockquote, dd, dt, figcaption, td, th, h1, h2, h3, h4, h5, h6'

onMounted(() => {
  const el = root.value
  const d = dot.value
  if (!el || !d) return
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

  active = true
  document.documentElement.classList.add('verdict-cursor-active')

  // Frames werden NUR aus pointermove angefordert (Codex-Review 2026-06-11):
  // keine Leerlauf-rAF-Schleife über die ganze Sitzung; pro Frame höchstens
  // ein Update + ein elementFromPoint, egal wie viele move-Events feuern.
  const process = () => {
    framePending = false
    // Position trägt der Anker (.vc), die Zentrierung übernimmt translate(-50%,-50%)
    // im CSS des Punkts — dadurch bleibt die Mitte beim Grössenwechsel exakt stehen,
    // ohne dass hier Margins nachgerechnet werden müssen.
    el.style.transform = `translate(${px}px, ${py}px)`

    const target = document.elementFromPoint(px, py)
    const overNative = !!target?.closest(NATIVE_CURSOR_SELECTOR)

    // Die Upload-Fläche ist selbst role="button" und damit vom Link-Zustand
    // abgedeckt — sie braucht kein eigenes Zeichen.
    const isLink = !!target?.closest(INTERACTIVE_SELECTOR)
    const isText = !isLink && !!target?.closest(TEXT_SELECTOR)

    const verdict = target?.closest('[data-verdict]')?.getAttribute('data-verdict') ?? null

    el.classList.toggle('is-hidden', overNative)
    el.classList.toggle('is-link', isLink)
    el.classList.toggle('is-text', isText)
    el.classList.toggle('ok', verdict === 'ok')
    el.classList.toggle('crit', verdict === 'crit')

    // Im Link-Zustand bleibt der Punkt zeichenlos: bei 18px wird jeder Glyph
    // unleserlich, und die Farbe trägt die Aussage bereits.
    d.textContent = isText || isLink
      ? ''
      : verdict === 'ok'
        ? '✓'
        : verdict === 'crit'
          ? '✕'
          : '·'
  }

  onMove = (e: PointerEvent) => {
    px = e.clientX
    py = e.clientY
    if (!framePending) {
      framePending = true
      raf = requestAnimationFrame(process)
    }
  }
  // Klick-Feedback: rein visuell, kein elementFromPoint nötig.
  onDown = () => el.classList.add('is-down')
  onUp = () => el.classList.remove('is-down')

  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerdown', onDown, { passive: true })
  window.addEventListener('pointerup', onUp, { passive: true })
  // Ohne pointercancel bliebe der gedrückte Zustand hängen, wenn der Browser
  // die Geste übernimmt (Drag-Start, Kontextmenü, Tab-Wechsel).
  window.addEventListener('pointercancel', onUp, { passive: true })
  window.addEventListener('blur', onUp)
})

onBeforeUnmount(() => {
  if (!active) return
  cancelAnimationFrame(raf)
  if (onMove) window.removeEventListener('pointermove', onMove)
  if (onDown) window.removeEventListener('pointerdown', onDown)
  if (onUp) {
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onUp)
    window.removeEventListener('blur', onUp)
  }
  document.documentElement.classList.remove('verdict-cursor-active')
})
</script>

<template>
  <div ref="root" class="vc" aria-hidden="true">
    <span ref="dot" class="vc__dot">·</span>
  </div>
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
/* Opt-out-Flächen: nativer Zeiger statt Kreis, inkl. aller Kinder. */
html.verdict-cursor-active [data-cursor='native'],
html.verdict-cursor-active [data-cursor='native'] * {
  cursor: auto !important;
}

/* Anker: trägt AUSSCHLIESSLICH die Position. Bewusst ohne eigene Ausdehnung und
   ohne transform-Transition — sichtbare Position und elementFromPoint-Hit-Test
   müssen synchron bleiben (Codex-Review 2026-06-11). Alles Visuelle passiert in
   .vc__dot, das dadurch gefahrlos animieren darf. */
.vc {
  position: fixed;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
  display: none;
  pointer-events: none;
  z-index: 9999;
  will-change: transform;
  /* Start ausserhalb des Viewports, bis die erste Pointer-Bewegung positioniert. */
  transform: translate(-100px, -100px);
}
html.verdict-cursor-active .vc {
  display: block;
}

.vc__dot {
  position: absolute;
  left: 0;
  top: 0;
  /* Zentriert sich selbst — unabhängig von der aktuellen Grösse, deshalb bleibt
     die Mitte auch während der Wachstums-Transition auf dem Zeiger. */
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
  box-sizing: border-box;
  border-radius: 50%;
  border: 2px solid var(--line-strong);
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  font: 700 15px/1 'IBM Plex Sans', system-ui, sans-serif;
  color: var(--muted);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.4);
  transition:
    width 0.12s ease,
    height 0.12s ease,
    border-radius 0.12s ease,
    border-color 0.12s,
    background-color 0.12s,
    color 0.12s,
    font-size 0.12s,
    opacity 0.12s,
    transform 0.09s ease;
}

/* SEMANTIK-Kanal: Verdikt-Zonen färben Rand und Zeichen. */
.vc.ok .vc__dot {
  border-color: var(--safe);
  color: var(--safe);
}
.vc.crit .vc__dot {
  border-color: var(--crit);
  color: var(--crit);
}

/* AFFORDANZ-Kanal: klickbar = der Ring zieht sich zu einem satten roten Punkt
   zusammen. Bewusst KLEINER statt grösser — der grosse gefüllte Kreis legte sich
   über den Inhalt, den man gerade anklicken will. Der Punkt greift ausserdem ein
   bestehendes Motiv des Design-Systems auf (.header-cta__dot, .kicker .dot: 7px
   in --crit), statt eine neue Form einzuführen. */
.vc.is-link .vc__dot {
  width: 18px;
  height: 18px;
  font-size: 0;
  background: var(--crit);
  border-color: var(--crit);
  box-shadow: 0 0 0 1.5px rgba(255, 255, 255, 0.55);
}
/* Klickbare Verdikt-Zone: der Punkt übernimmt die Verdikt-Farbe, damit Affordanz
   und Semantik gleichzeitig lesbar bleiben. */
.vc.is-link.ok .vc__dot {
  background: var(--safe);
  border-color: var(--safe);
}

/* Markierbarer Text: schmaler Strich statt Kreis. */
.vc.is-text .vc__dot {
  width: 2px;
  height: 22px;
  border-radius: 1px;
  border-width: 0;
  background: var(--ink);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.55);
}

/* Klick-Moment: kurzes Einfedern — ersetzt das taktile Feedback, das der
   native Zeiger beim Drücken gibt. */
.vc.is-down .vc__dot {
  transform: translate(-50%, -50%) scale(0.85);
}

.vc.is-hidden .vc__dot {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .vc__dot {
    transition: none;
  }
  /* Grössensprung beim Drücken entfällt, die Zustandsfarben bleiben. */
  .vc.is-down .vc__dot {
    transform: translate(-50%, -50%);
  }
}
@media print {
  .vc {
    display: none !important;
  }
}
</style>
