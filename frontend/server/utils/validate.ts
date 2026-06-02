// Server-seitige Eingabe-Validierung fuer /api/analyze (Etappe 6).
// Quelle der Schwellen: error-taxonomy.md §0 + IMPLEMENTATION-PLAN §6.4.
//
// Konstanten bewusst getrennt von den CLIENT-Downscale-Konstanten (die im
// Frontend leben). Die error-taxonomy nennt fuer den Client MAX_BASE64_CHARS
// = 5 000 000, aber Vercel killt einen Body > ~4.5 MB Base64 (Server-Body-Limit
// "≤ 4 MB Base64"). Der Server arbeitet daher konservativ am Vercel-Limit; der
// Client (analyze.vue) drueckt sein Budget bewusst DARUNTER.

import { z } from 'zod'
import { imageSize } from 'image-size'

// Content-Length-Hardstop (vor Body-Parse) – knapp unter Vercels ~4.5 MB-Kill.
export const MAX_REQUEST_BYTES = 4_500_000
// imageBase64-Stringlaenge (Zod .max) – schuetzt Buffer.from bei fehlendem oder
// gefaelschtem Content-Length (Codex-Plan-Review B3). Am selben Vercel-Limit.
export const MAX_IMAGE_BASE64_CHARS = 4_500_000
// Pixel pro Kante (IMPLEMENTATION-PLAN §6.4.3).
export const MAX_IMAGE_EDGE = 4000
// prompt/context Zeichenlimit (analyze-input-spec; clientseitig maxlength=2000).
export const MAX_TEXT_CHARS = 2000

export const ACCEPTED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export type AcceptedMediaType = (typeof ACCEPTED_MEDIA_TYPES)[number]

// image-size meldet Kurztypen ('jpg'|'png'|'webp'); Mapping auf MIME fuer den
// Magic-Byte-Abgleich (nicht dem mediaType-Feld des Clients trauen).
const SNIFF_TYPE_TO_MEDIA: Record<string, AcceptedMediaType> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

// Body-Schema – KEIN usage_form (frontend-only, geht nie an die Pipeline).
export const AnalyzeBodySchema = z.object({
  imageBase64: z.string().min(1).max(MAX_IMAGE_BASE64_CHARS),
  mediaType: z.enum(ACCEPTED_MEDIA_TYPES).optional(),
  prompt: z.string().max(MAX_TEXT_CHARS).optional(),
  context: z.string().max(MAX_TEXT_CHARS).optional(),
  declaredIntent: z.enum(['unspecified', 'affirmative', 'critical', 'illustrative']).optional(),
}).strict() // unbekannte Keys hart ablehnen (Datenkontrakt-Disziplin: kein usage_form etc.)
export type AnalyzeBody = z.infer<typeof AnalyzeBodySchema>

// data:image/...;base64,XXXX -> { base64, mediaType }. Defensiv: der Client
// strippt den Prefix bereits (runSemanticAnalysis erwartet reines Base64), der
// Server faengt es nochmal ab.
export function stripBase64(raw: string): { base64: string; mediaType?: AcceptedMediaType } {
  const m = raw.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/s)
  const payload = m?.[2]
  if (!m || payload == null) return { base64: raw }
  const declared = (m[1] ?? '').toLowerCase()
  const mediaType = (ACCEPTED_MEDIA_TYPES as readonly string[]).includes(declared)
    ? (declared as AcceptedMediaType)
    : undefined
  return { base64: payload, mediaType }
}

// Magic-Byte + Pixel-Sniff. Wirft NICHT – die Route mappt das Resultat auf den
// HTTP-Status (unsupported_type -> 415, too_large -> 413).
export type SniffResult =
  | { ok: true; mediaType: AcceptedMediaType; width: number; height: number }
  | { ok: false; reason: 'unsupported_type' | 'too_large' | 'unreadable' }

export function sniffImage(buffer: Buffer): SniffResult {
  let dim: ReturnType<typeof imageSize>
  try {
    dim = imageSize(buffer)
  } catch {
    return { ok: false, reason: 'unreadable' }
  }
  const media = dim.type ? SNIFF_TYPE_TO_MEDIA[dim.type.toLowerCase()] : undefined
  if (!media) return { ok: false, reason: 'unsupported_type' }
  if (!dim.width || !dim.height) return { ok: false, reason: 'unreadable' }
  if (dim.width > MAX_IMAGE_EDGE || dim.height > MAX_IMAGE_EDGE) {
    return { ok: false, reason: 'too_large' }
  }
  return { ok: true, mediaType: media, width: dim.width, height: dim.height }
}
