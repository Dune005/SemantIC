const MODEL_LABEL = 'aesthetic-predictor-v2-5'
const LAION_MIN = 1
const LAION_MAX = 10
const TIMEOUT_MS = 180_000
const MAX_BASE64_CHARS = 10 * 1024 * 1024

export interface ModalAestheticResult {
  raw_score: number
  normalized: number
  duration_ms: number
  model: string
  out_of_range?: boolean
}

interface ModalScoreResponse {
  score: number
  model?: string
}

export async function runModalAesthetic(
  imageBase64: string,
): Promise<ModalAestheticResult> {
  const url = process.env.MODAL_AESTHETIC_URL
  const bearer = process.env.MODAL_AESTHETIC_BEARER
  if (!url) throw new Error('MODAL_AESTHETIC_URL nicht gesetzt')
  if (!bearer) throw new Error('MODAL_AESTHETIC_BEARER nicht gesetzt')
  if (imageBase64.length > MAX_BASE64_CHARS) {
    throw new Error(
      `Bild zu gross (${(imageBase64.length / 1024 / 1024).toFixed(1)} MB Base64, Limit ${MAX_BASE64_CHARS / 1024 / 1024} MB).`,
    )
  }

  const start = Date.now()
  const body = await postWithTimeout(`${url.replace(/\/$/, '')}/score`, bearer, imageBase64, TIMEOUT_MS)
  const duration_ms = Date.now() - start

  const raw = body.score
  if (typeof raw !== 'number' || !Number.isFinite(raw)) {
    throw new Error(`Unerwartetes Score-Format: ${JSON.stringify(body).slice(0, 200)}`)
  }

  const clamped = Math.min(LAION_MAX, Math.max(LAION_MIN, raw))
  const normalized = Math.round(((clamped - LAION_MIN) / (LAION_MAX - LAION_MIN)) * 100)
  const out_of_range = raw < LAION_MIN || raw > LAION_MAX

  return {
    raw_score: raw,
    normalized,
    duration_ms,
    model: body.model ?? MODEL_LABEL,
    ...(out_of_range ? { out_of_range: true } : {}),
  }
}

async function postWithTimeout(
  url: string,
  bearer: string,
  imageBase64: string,
  timeoutMs: number,
): Promise<ModalScoreResponse> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image_base64: imageBase64 }),
      signal: controller.signal,
    })
    if (!resp.ok) {
      const text = await resp.text().catch(() => '')
      console.warn(`[modal-aesthetic] HTTP ${resp.status}: ${text.slice(0, 500)}`)
      const code =
        resp.status === 401 ? 'unauthorized'
        : resp.status === 413 ? 'image_too_large'
        : resp.status >= 500 ? 'modal_unavailable'
        : 'bad_response'
      throw new Error(`Modal-Call: ${code} (HTTP ${resp.status})`)
    }
    return (await resp.json()) as ModalScoreResponse
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Modal-Call: timeout (>${timeoutMs / 1000}s, evtl. Cold-Start)`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}
