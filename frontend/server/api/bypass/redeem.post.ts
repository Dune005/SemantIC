// Bypass-Code einloesen (Etappe 6, IMPLEMENTATION-PLAN §6.3).
// Erfolg => HMAC-signiertes 30-Tage-Cookie. Falscher Code => 401 {ok:false}
// (kein Hinweis, welcher Teil falsch ist). Eigener Brute-Force-Bucket pro IP.

import { getLimiters, isLocalDev } from '../../utils/ratelimit'
import {
  getBypassConfig,
  signBypassCookie,
  safeEqual,
  BYPASS_COOKIE_NAME,
  BYPASS_MAX_AGE_SECONDS,
} from '../../utils/bypass'

export default defineEventHandler(async (event) => {
  // Brute-Force-Bremse (5/10 min pro IP). ENV fehlt: Dev offen, Prod dicht.
  const limiters = getLimiters()
  if (limiters) {
    const ip = getRequestIP(event, { xForwardedFor: true }) || 'anonymous'
    const { success } = await limiters.bypass.limit(`redeem:${ip}`)
    if (!success) throw createError({ statusCode: 429, statusMessage: 'too_many_attempts' })
  } else if (!isLocalDev()) {
    throw createError({ statusCode: 503, statusMessage: 'bypass_unconfigured' })
  }

  const body = await readBody<{ code?: unknown }>(event)
  const code = typeof body?.code === 'string' ? body.code : ''

  const cfg = getBypassConfig()
  if (!cfg || !safeEqual(code, cfg.code)) {
    throw createError({ statusCode: 401, statusMessage: 'invalid_code', data: { ok: false } })
  }

  setCookie(event, BYPASS_COOKIE_NAME, signBypassCookie(cfg.secret, Date.now()), {
    httpOnly: true,
    // lokales HTTP: kein Secure (sonst greift das Cookie nicht); Prod: Secure.
    secure: !isLocalDev(),
    sameSite: 'lax',
    path: '/',
    maxAge: BYPASS_MAX_AGE_SECONDS,
  })
  return { ok: true }
})
