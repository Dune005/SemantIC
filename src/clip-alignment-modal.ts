// TypeScript-Client fuer den Modal-Service `modal_service/clip_alignment.py`.
// Pattern 1:1 analog zu `src/aesthetic-modal.ts`. Liefert Raw-Cosine-Werte
// zwischen Bild und einer Liste von Texten (typisch: original_prompt,
// usage_context). Caller muss bereits leere/whitespace-only Texte herausfiltern
// — der Service akzeptiert sie zwar, gibt dann aber raw_cosine=null zurueck.

const MODEL_LABEL = 'open-clip-vit-b-32-laion2b_s34b_b79k'
const TIMEOUT_MS = 180_000
const MAX_BASE64_CHARS = 10 * 1024 * 1024

export type ClipTextId = 'prompt' | 'context'

export interface ClipTextEntry {
  id: ClipTextId
  text: string
}

export interface ClipScoreEntry {
  id: ClipTextId
  raw_cosine: number | null
  truncated: boolean
  token_count: number
}

export interface ClipAlignmentResult {
  scores: ClipScoreEntry[]
  model: string
  skipped: boolean
  duration_ms: number
}

// Flache Meta-Form, wie sie im Pipeline-Output unter `meta.clip_alignment`
// landet. Discriminated Union: entweder bewusst geskippt (keine Texte) oder
// mit pro-Text-Cosine + Truncation-Info.
export type ClipAlignmentMeta =
  | { skipped: true; reason: 'no_text_input' }
  | {
      skipped: false
      prompt_cosine: number | null
      context_cosine: number | null
      prompt_truncated: boolean
      context_truncated: boolean
      prompt_token_count: number
      context_token_count: number
      model: string
      duration_ms: number
    }

export function toClipAlignmentMeta(result: ClipAlignmentResult): ClipAlignmentMeta {
  const prompt = result.scores.find(s => s.id === 'prompt')
  const context = result.scores.find(s => s.id === 'context')
  return {
    skipped: false,
    prompt_cosine: prompt?.raw_cosine ?? null,
    context_cosine: context?.raw_cosine ?? null,
    prompt_truncated: prompt?.truncated ?? false,
    context_truncated: context?.truncated ?? false,
    prompt_token_count: prompt?.token_count ?? 0,
    context_token_count: context?.token_count ?? 0,
    model: result.model,
    duration_ms: result.duration_ms,
  }
}

interface ClipServiceResponse {
  scores: Array<{
    id: string
    raw_cosine: number | null
    truncated: boolean
    token_count: number
  }>
  model?: string
  skipped?: boolean
}

const VALID_IDS: ClipTextId[] = ['prompt', 'context']

export async function runClipAlignment(
  imageBase64: string,
  texts: ClipTextEntry[],
): Promise<ClipAlignmentResult> {
  const url = process.env.MODAL_CLIP_URL
  const bearer = process.env.MODAL_CLIP_BEARER
  if (!url) throw new Error('MODAL_CLIP_URL nicht gesetzt')
  if (!bearer) throw new Error('MODAL_CLIP_BEARER nicht gesetzt')
  if (imageBase64.length > MAX_BASE64_CHARS) {
    throw new Error(
      `Bild zu gross (${(imageBase64.length / 1024 / 1024).toFixed(1)} MB Base64, Limit ${MAX_BASE64_CHARS / 1024 / 1024} MB).`,
    )
  }

  const expectedIds = new Set(texts.map(t => t.id))
  if (expectedIds.size !== texts.length) {
    throw new Error(`CLIP-Request: doppelte Text-IDs im Input (${texts.map(t => t.id).join(', ')})`)
  }
  if (expectedIds.size === 0) {
    throw new Error('CLIP-Request: leeres texts-Array — Skip muss im Caller behandelt werden, kein Service-Call.')
  }

  const start = Date.now()
  const body = await postWithTimeout(`${url.replace(/\/$/, '')}/score`, bearer, imageBase64, texts, TIMEOUT_MS)
  const duration_ms = Date.now() - start

  if (!body || typeof body !== 'object' || !Array.isArray(body.scores)) {
    throw new Error(`Unerwartetes CLIP-Response-Format: ${JSON.stringify(body).slice(0, 200)}`)
  }
  if (body.skipped) {
    throw new Error('CLIP-Response: skipped=true, obwohl Texte gesendet wurden')
  }
  if (body.scores.length !== expectedIds.size) {
    throw new Error(
      `CLIP-Response: Score-Anzahl stimmt nicht (erwartet ${expectedIds.size}, erhalten ${body.scores.length})`,
    )
  }

  const scores: ClipScoreEntry[] = []
  const seenIds = new Set<ClipTextId>()
  for (const entry of body.scores) {
    if (!entry || typeof entry !== 'object') {
      throw new Error(`CLIP-Response: Score-Eintrag kein Objekt (${JSON.stringify(entry).slice(0, 80)})`)
    }
    const id = entry.id
    if (typeof id !== 'string' || !(VALID_IDS as readonly string[]).includes(id)) {
      throw new Error(`CLIP-Response: unbekannte Text-ID "${String(id)}"`)
    }
    const typedId = id as ClipTextId
    if (!expectedIds.has(typedId)) {
      throw new Error(`CLIP-Response: ID "${typedId}" wurde nicht angefragt`)
    }
    if (seenIds.has(typedId)) {
      throw new Error(`CLIP-Response: doppelte Text-ID "${typedId}"`)
    }
    seenIds.add(typedId)

    let cosine: number | null
    if (entry.raw_cosine === null) {
      cosine = null
    } else if (typeof entry.raw_cosine === 'number' && Number.isFinite(entry.raw_cosine)) {
      cosine = entry.raw_cosine
    } else {
      throw new Error(`CLIP-Response: raw_cosine fuer "${typedId}" weder Zahl noch null (${String(entry.raw_cosine)})`)
    }

    const tokenCount = entry.token_count
    if (typeof tokenCount !== 'number' || !Number.isInteger(tokenCount) || tokenCount < 0) {
      throw new Error(`CLIP-Response: token_count fuer "${typedId}" kein nicht-negativer Integer (${String(tokenCount)})`)
    }

    scores.push({
      id: typedId,
      raw_cosine: cosine,
      truncated: Boolean(entry.truncated),
      token_count: tokenCount,
    })
  }

  return {
    scores,
    model: body.model ?? MODEL_LABEL,
    skipped: false,
    duration_ms,
  }
}

async function postWithTimeout(
  url: string,
  bearer: string,
  imageBase64: string,
  texts: ClipTextEntry[],
  timeoutMs: number,
): Promise<ClipServiceResponse> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image_base64: imageBase64, texts }),
      signal: controller.signal,
    })
    if (!resp.ok) {
      const text = await resp.text().catch(() => '')
      console.warn(`[modal-clip] HTTP ${resp.status}: ${text.slice(0, 500)}`)
      const code =
        resp.status === 401 ? 'unauthorized'
        : resp.status === 413 ? 'image_too_large'
        : resp.status === 400 ? 'bad_request'
        : resp.status >= 500 ? 'modal_unavailable'
        : 'bad_response'
      throw new Error(`Modal-CLIP-Call: ${code} (HTTP ${resp.status})`)
    }
    return (await resp.json()) as ClipServiceResponse
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Modal-CLIP-Call: timeout (>${timeoutMs / 1000}s, evtl. Cold-Start)`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}
