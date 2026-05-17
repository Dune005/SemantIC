import { z } from 'zod'

export const AestheticSchema = z.object({
  aesthetic_score: z.number(),
  aesthetic_reasoning: z.string(),
})

export type AestheticOutput = z.infer<typeof AestheticSchema>
