// Zaehlerstand des Tageslimits – nur lesen, nie verbrauchen.
// Damit kann die Analyse-Seite den Stand schon beim Oeffnen anzeigen und nicht
// erst nach der ersten Analyse (die ihn ueber die Response-Header mitliefert).
//
// Bewusst NICHT rate-limitiert: die Middleware greift ausschliesslich bei
// POST /api/analyze. Ein Limit auf diesem Endpunkt wuerde die Anzeige und die
// Analyse gegenseitig blockieren.

import { getLimiters, isLocalDev } from '../utils/ratelimit'
import { getBypassConfig, verifyBypassCookie, BYPASS_COOKIE_NAME } from '../utils/bypass'

export interface QuotaResponse {
  /**
   * bypass      – gueltiges Bypass-Cookie, kein Limit aktiv
   * ok          – Zaehlerstand verfuegbar (remaining/limit/reset gesetzt)
   * unlimited   – lokale Entwicklung ohne Upstash-ENV (Limit ist fail-open)
   * unavailable – Upstash-ENV fehlt in Produktion (Analyse waere ohnehin dicht)
   */
  state: 'bypass' | 'ok' | 'unlimited' | 'unavailable'
  remaining?: number
  limit?: number
  reset?: number
}

export default defineEventHandler(async (event): Promise<QuotaResponse> => {
  // Reihenfolge wie in der Rate-Limit-Middleware: Bypass schlaegt das Limit.
  const bypassCfg = getBypassConfig()
  if (bypassCfg) {
    const cookie = getCookie(event, BYPASS_COOKIE_NAME)
    if (verifyBypassCookie(cookie, bypassCfg.secret, Date.now())) {
      return { state: 'bypass' }
    }
  }

  const limiters = getLimiters()
  if (!limiters) return { state: isLocalDev() ? 'unlimited' : 'unavailable' }

  // Identifier identisch zur Middleware, sonst zeigt die Anzeige einen fremden Bucket.
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'anonymous'
  const { remaining, limit, reset } = await limiters.analyze.getRemaining(ip)
  return { state: 'ok', remaining: Math.max(0, remaining), limit, reset }
})
