import { GUEST_MESSAGE } from '@/common/constants/message'
import { checkIdSchema } from '@/shared/utils/id.validation'
import { z } from 'zod'

export const GuestSchema = z.object({
  id: z.number(),
  name: z
    .string()
    .trim()
    .regex(/^[A-Za-z].*$/, { message: GUEST_MESSAGE.NAME_IS_INVALID })
    .min(1, GUEST_MESSAGE.NAME_IS_REQUIRED)
    .max(500),
  tableNumber: z.number().min(0, GUEST_MESSAGE.TABLE_NUMBER_IS_INVALID),
  refreshToken: z.string().nullable(),
  refreshTokenExpiresAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const CreateGuestBodySchema = GuestSchema.pick({
  name: true,
  tableNumber: true
}).extend({
  token: z.string().optional()
})

export const UpdateGuestBodySchema = GuestSchema.pick({
  name: true,
  tableNumber: true,
  refreshToken: true,
  refreshTokenExpiresAt: true
}).strict()

export const GetGuestParamsSchema = z
  .object({
    guestId: checkIdSchema(GUEST_MESSAGE.ID_IS_INVALID)
  })
  .strict()

export const GetGuestDetailResSchema = z.object({
  ...GuestSchema.shape
})

//list categories
export const GetGuestsResSchema = z.object({
  data: z.array(GuestSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
})

export const GetGuestsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10)
  })
  .strict()

export type GuestType = z.infer<typeof GuestSchema>
export type CreateGuestBodyType = z.infer<typeof CreateGuestBodySchema>
export type UpdateGuestBodyType = z.infer<typeof UpdateGuestBodySchema>
export type GetGuestParamsType = z.infer<typeof GetGuestParamsSchema>
export type GetGuestDetailResType = z.infer<typeof GetGuestDetailResSchema>

export type GetGuestsQueryType = z.infer<typeof GetGuestsQuerySchema>
export type GetGuestsResType = z.infer<typeof GetGuestsResSchema>
