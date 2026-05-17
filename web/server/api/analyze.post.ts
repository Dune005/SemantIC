import { runSemanticAnalysis } from '@pipeline/analyze'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    imageBase64?: string
    mediaType?: string
    prompt?: string
    context?: string
  }>(event)

  if (!body?.imageBase64) {
    throw createError({ statusCode: 400, statusMessage: 'imageBase64 fehlt' })
  }

  try {
    return await runSemanticAnalysis(body.imageBase64, {
      prompt: body.prompt,
      context: body.context,
      mediaType: body.mediaType,
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
