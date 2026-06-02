// Rate-Limit-Infrastruktur (Etappe 6, IMPLEMENTATION-PLAN §6.2).
// Lazy Singleton: zwei Sliding-Window-Limiter auf einer Upstash-Redis-Instanz.
//   - analyze: 3 Analysen / 24 h pro IP (Kostenschutz fuer /api/analyze)
//   - bypass:  Brute-Force-Bremse fuer /api/bypass/redeem (5 Versuche / 10 min)
//
// getLimiters() gibt null zurueck, wenn die Upstash-ENV fehlt – der Aufrufer
// entscheidet dann den Fail-Modus (Dev offen / Prod dicht). Die EU-Region (O-4)
// wird Upstash-seitig ueber die REST-URL der EU-Instanz gewaehlt, nicht im Code.

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export interface Limiters {
  analyze: Ratelimit
  bypass: Ratelimit
}

// undefined = noch nicht initialisiert; null = ENV fehlt (bewusst gecached,
// damit nicht bei jedem Request erneut geprueft wird).
let cached: Limiters | null | undefined

export function getLimiters(): Limiters | null {
  if (cached !== undefined) return cached
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    cached = null
    return null
  }
  const redis = new Redis({ url, token })
  cached = {
    analyze: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '24 h'),
      prefix: 'semantic:analyze',
      analytics: false,
    }),
    bypass: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '10 m'),
      prefix: 'semantic:bypass',
      analytics: false,
    }),
  }
  return cached
}

// Zentraler Fail-Modus-Schalter (Codex-Plan-Review B6): lokal/Dev offen,
// Produktion dicht. import.meta.dev wird von Nitro statisch ersetzt; das
// zusaetzliche VERCEL-Guard schliesst einen faelschlich als dev erkannten
// Prod-Build aus.
export function isLocalDev(): boolean {
  return import.meta.dev === true && process.env.VERCEL !== '1'
}
