import { z } from 'zod'

export const HealthSchema = z
  .object({
    amountUser: z.number().nullable(),
    amountTable: z.number().nullable(),
    amountOrder: z.number().nullable(),
    usedStorage: z.string().nullable()
  })
  .strict()
export const GetHealthResSchema = z.object({
  data: HealthSchema,
  message: z.string()
})

export type HealthType = z.infer<typeof HealthSchema>
export type GetHealthResType = z.infer<typeof GetHealthResSchema>
