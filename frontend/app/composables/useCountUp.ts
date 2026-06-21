// useCountUp (Diagnose-Cockpit, Etappe 2) – animiert einen Score von 0 auf den
// Zielwert. Bewusst hydration-sicher: SSR + initialer Client-Render zeigen bereits
// den Zielwert (kein Hydration-Mismatch / kein Flash von 0); die Animation startet
// erst nach dem Mount auf dem Client. Respektiert prefers-reduced-motion (sofort
// Zielwert), clampt auf >= 0 ganzzahlig, bricht rAF beim Unmount ab und re-animiert
// bei Target-Wechsel. Die Zahl bleibt rein neutraler Messwert – nur die Bewegung ist neu.
import { ref, watch, onMounted, onUnmounted, toRef, type Ref } from 'vue'

interface CountUpOptions {
  duration?: number // ms
  delay?: number // ms vor Zählbeginn
}

export function useCountUp(target: number | Ref<number>, options: CountUpOptions = {}): Ref<number> {
  const { duration = 1000, delay = 0 } = options
  const targetRef = toRef(target)
  const goalOf = () => Math.max(0, Math.round(targetRef.value))

  // Startwert = Zielwert → SSR-HTML und erster Client-Render stimmen überein.
  const display = ref(goalOf())
  let rafId: number | null = null
  let startTs: number | null = null

  function stop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    startTs = null
  }

  function animate() {
    if (typeof window === 'undefined') {
      display.value = goalOf()
      return
    }
    stop()
    const goal = goalOf()
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (reduce) {
      display.value = goal
      return
    }
    display.value = 0
    const step = (now: number) => {
      if (startTs === null) startTs = now
      const elapsed = now - startTs - delay
      if (elapsed < 0) {
        rafId = requestAnimationFrame(step)
        return
      }
      const progress = Math.min(1, elapsed / duration)
      display.value = Math.round(goal * progress)
      if (progress < 1) {
        rafId = requestAnimationFrame(step)
      } else {
        display.value = goal
        rafId = null
      }
    }
    rafId = requestAnimationFrame(step)
  }

  onMounted(animate)
  watch(targetRef, animate)
  onUnmounted(stop)

  return display
}
