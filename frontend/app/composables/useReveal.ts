// «Sanftes Eintreten» (Frontend 1.5, Landing F): ein gestaffeltes Einmal-Fade
// pro Tafel via IntersectionObserver. Reines Enhancement — die Versteck-Styles
// greifen erst, wenn JS dem Container die Klasse `reveal-ready` gibt; ohne JS
// (SSR, alte Browser) ist alles sofort sichtbar. prefers-reduced-motion wird
// im CSS der nutzenden Komponente überschrieben (opacity:1 !important).
import { onBeforeUnmount, onMounted, type Ref } from 'vue'

export function useReveal(rootRef: Ref<HTMLElement | null>, selector = '.reveal') {
  let obs: IntersectionObserver | null = null

  onMounted(() => {
    const root = rootRef.value
    if (!root) return
    const els = Array.from(root.querySelectorAll(selector))
    if (els.length === 0) return

    if (!('IntersectionObserver' in window)) return // Styles bleiben aus → alles sichtbar
    root.classList.add('reveal-ready')

    obs = new IntersectionObserver(
      (entries, o) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            o.unobserve(e.target)
          }
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
    )
    els.forEach(el => obs!.observe(el))
  })

  onBeforeUnmount(() => {
    obs?.disconnect()
    obs = null
  })
}
