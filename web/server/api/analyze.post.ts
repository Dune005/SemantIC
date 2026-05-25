import { runSemanticAnalysis } from '@pipeline/analyze'
import type { DeclaredIntent } from '@pipeline/schemas/analysis'

const ALLOWED_INTENTS: readonly DeclaredIntent[] = ['affirmative', 'critical', 'illustrative', 'unspecified']

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    imageBase64?: string
    mediaType?: string
    prompt?: string
    context?: string
    declaredIntent?: string
  }>(event)

  if (!body?.imageBase64) {
    throw createError({ statusCode: 400, statusMessage: 'imageBase64 fehlt' })
  }

  let declaredIntent: DeclaredIntent | undefined
  if (typeof body.declaredIntent === 'string' && body.declaredIntent.length > 0) {
    if (!(ALLOWED_INTENTS as readonly string[]).includes(body.declaredIntent)) {
      throw createError({
        statusCode: 400,
        statusMessage: `declaredIntent muss einer dieser Werte sein: ${ALLOWED_INTENTS.join(', ')}`,
      })
    }
    declaredIntent = body.declaredIntent as DeclaredIntent
  }

  try {
    return await runSemanticAnalysis(body.imageBase64, {
      prompt: body.prompt,
      context: body.context,
      mediaType: body.mediaType,
      ...(declaredIntent !== undefined ? { declaredIntent } : {}),
    })
  } catch (err: any) {
    console.error('[analyze.post] Fehler:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Pipeline-Fehler',
      data: { message: err?.message ?? String(err) },
    })
  }
})
