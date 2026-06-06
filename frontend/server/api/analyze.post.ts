// Bruecke /api/analyze -> @pipeline/analyze mit Defense-in-Depth (Etappe 6,
// IMPLEMENTATION-PLAN §6.4). Das IP-Rate-Limit + der Bypass-Check laufen davor
// in server/middleware/ratelimit.ts. usage_form ist NICHT Teil des Bodys und
// geht nie an die Pipeline (frontend-only).

import { runSemanticAnalysis } from '@pipeline/analyze'
import {
  AnalyzeBodySchema,
  stripBase64,
  sniffImage,
  MAX_REQUEST_BYTES,
} from '../utils/validate'

export default defineEventHandler(async (event) => {
  // 1. Content-Length-Hardstop VOR dem Body-Parse.
  const contentLength = Number(getHeader(event, 'content-length') || 0)
  if (contentLength > MAX_REQUEST_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'too_large' })
  }

  // 2. Body lesen + Zod (imageBase64 .max() begrenzt auch ohne Content-Length;
  //    schuetzt Buffer.from vor uebergrossem Input – Codex-Plan-Review B3).
  const parsed = AnalyzeBodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 422, statusMessage: 'invalid_body' })
  }
  const body = parsed.data

  // 3. Base64-Prefix defensiv strippen (Client liefert i.d.R. schon reines Base64).
  const { base64 } = stripBase64(body.imageBase64)
  const buffer = Buffer.from(base64, 'base64')

  // 4./5. Magic-Byte + MIME-Whitelist + Pixel-Limit (nicht dem mediaType-Feld trauen).
  const sniff = sniffImage(buffer)
  if (!sniff.ok) {
    if (sniff.reason === 'too_large') {
      throw createError({ statusCode: 413, statusMessage: 'too_large' })
    }
    throw createError({ statusCode: 415, statusMessage: 'unsupported_type' })
  }

  // 6. Server-AbortController: Timeout (< 300s maxDuration) + Client-Disconnect.
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 280_000)
  // Client-Disconnect waehrend der Verarbeitung → Pipeline abbrechen (Kostenschutz).
  // res.close ist robuster als req.close (feuert auch bei abgebrochener Antwort).
  event.node.res.on('close', () => controller.abort())

  try {
    // 7. Pipeline-Call. Magic-Byte-verifizierter mediaType (nicht das Client-Feld).
    const result = await runSemanticAnalysis(base64, {
      prompt: body.prompt,
      context: body.context,
      declaredIntent: body.declaredIntent,
      mediaType: sniff.mediaType,
      signal: controller.signal,
    })
    return result
  } catch (err) {
    // Log-Filter (Codex-Review A): NUR die Fehlerklasse loggen. AI-SDK-Fehler
    // (z.B. NoObjectGeneratedError) tragen rohen LLM-Text in .text/.responseBody
    // – niemals err.message/das Objekt loggen.
    if (controller.signal.aborted) {
      console.warn('[analyze] abgebrochen (Timeout/Client-Disconnect).')
      throw createError({ statusCode: 504, statusMessage: 'timeout' })
    }
    console.error(`[analyze] Pipeline-Fehler: ${err instanceof Error ? err.name : 'UnknownError'}`)
    throw createError({ statusCode: 502, statusMessage: 'provider_error' })
  } finally {
    clearTimeout(timeout)
  }
})
