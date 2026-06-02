// Bypass-Cookie: HMAC-signiertes, server-seitig verifizierbares Demo-Token
// (Etappe 6, IMPLEMENTATION-PLAN §6.3). Cookie-Wert: "<exp>.<hmacHex>",
// hmac = HMAC_SHA256(SEMANTIC_BYPASS_SECRET, exp). exp = Unix-ms-Ablauf.
// SEMANTIC_BYPASS_SECRET verlaesst NIE den Server.

import { createHmac, timingSafeEqual } from 'node:crypto'

export const BYPASS_COOKIE_NAME = 'bypass'
export const BYPASS_MAX_AGE_SECONDS = 2_592_000 // 30 Tage

export interface BypassConfig {
  code: string
  secret: string
}

// {code, secret} aus process.env oder null, wenn unkonfiguriert. Der Aufrufer
// entscheidet damit den Fail-Modus (kein Bypass moeglich -> 401).
export function getBypassConfig(): BypassConfig | null {
  const code = process.env.SEMANTIC_BYPASS_CODE
  const secret = process.env.SEMANTIC_BYPASS_SECRET
  if (!code || !secret) return null
  return { code, secret }
}

function hmacHex(value: string, secret: string): string {
  return createHmac('sha256', secret).update(value).digest('hex')
}

// Laengenrobuster, timing-sicherer Vergleich (Codex-Plan-Review B5):
// crypto.timingSafeEqual wirft bei ungleicher Buffer-Laenge. Beide Seiten erst
// auf konstante Laenge hashen (SHA-256-Digest), dann konstantzeitig vergleichen.
export function safeEqual(a: string, b: string): boolean {
  const ha = createHmac('sha256', 'cmp').update(a).digest()
  const hb = createHmac('sha256', 'cmp').update(b).digest()
  return timingSafeEqual(ha, hb)
}

// Cookie-Wert fuer einen frischen 30-Tage-Bypass. `now` = Date.now() (ms).
export function signBypassCookie(secret: string, now: number): string {
  const exp = now + BYPASS_MAX_AGE_SECONDS * 1000
  return `${exp}.${hmacHex(String(exp), secret)}`
}

// Gueltig, wenn HMAC stimmt UND exp in der Zukunft liegt.
export function verifyBypassCookie(value: string | undefined, secret: string, now: number): boolean {
  if (!value) return false
  const dot = value.indexOf('.')
  if (dot < 1) return false
  const exp = value.slice(0, dot)
  const sig = value.slice(dot + 1)
  if (!safeEqual(sig, hmacHex(exp, secret))) return false
  const expMs = Number(exp)
  return Number.isFinite(expMs) && expMs > now
}
