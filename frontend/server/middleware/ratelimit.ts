// IP-Rate-Limit + Bypass-Check (Etappe 6, IMPLEMENTATION-PLAN §6.1/§6.2).
// Reihenfolge: Pfad-Guard -> Bypass-Cookie -> IP-Limit (5/24h Sliding).
// Nur POST /api/analyze wird limitiert; /api/bypass/redeem, GET und statische
// Routen laufen frei durch (redeem hat einen eigenen Brute-Force-Bucket).

import { getLimiters, isLocalDev } from '../utils/ratelimit'
import { getBypassConfig, verifyBypassCookie, BYPASS_COOKIE_NAME } from '../utils/bypass'

export default defineEventHandler(async (event) => {
  if (event.method !== 'POST') return
  if (getRequestURL(event).pathname !== '/api/analyze') return

  // 1. Bypass-Cookie zuerst – gueltig => Limit ueberspringen.
  const bypassCfg = getBypassConfig()
  if (bypassCfg) {
    const cookie = getCookie(event, BYPASS_COOKIE_NAME)
    if (verifyBypassCookie(cookie, bypassCfg.secret, Date.now())) {
      setHeader(event, 'X-RateLimit-Bypass', '1')
      return
    }
  }

  // 2. IP-Limit. ENV fehlt => Fail-Modus (Dev offen / Prod dicht).
  const limiters = getLimiters()
  if (!limiters) {
    if (isLocalDev()) {
      console.warn('[ratelimit] Upstash-ENV fehlt – Limit im Dev deaktiviert (fail-open).')
      return
    }
    throw createError({ statusCode: 503, statusMessage: 'rate_limit_unconfigured' })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'anonymous'
  const { success, limit, remaining, reset } = await limiters.analyze.limit(ip)
  setHeader(event, 'X-RateLimit-Limit', String(limit))
  setHeader(event, 'X-RateLimit-Remaining', String(Math.max(0, remaining)))
  setHeader(event, 'X-RateLimit-Reset', String(reset))

  if (!success) {
    throw createError({
      statusCode: 429,
      statusMessage: 'rate_limit_exceeded',
      data: { remaining: 0, resetsAt: reset },
    })
  }
})
