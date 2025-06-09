import { GUEST_MESSAGE } from '@/common/constants/message'
import { RoleName } from '@/common/constants/role.constant'
import { z } from 'zod'

export const GuestSchema = z
  .object({
    id: z.number(),
    name: z.string().trim().min(1, GUEST_MESSAGE.NAME_IS_REQUIRED).max(500),
    tableNumber: z.number().min(0, GUEST_MESSAGE.TABLE_NUMBER_IS_INVALID),
    refreshToken: z.string().nullable(),
    refreshTokenExpiresAt: z.date().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date()
  })
  .strict()

//create
export const GuestCreateBodySchema = GuestSchema.pick({
  name: true,
  tableNumber: true
}).strict()

//Login
export const GuestLoginBodySchema = GuestCreateBodySchema.extend({
  token: z.string()
}).strict()

export const GuestLoginResSchema = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    guest: z.object({
      id: z.number(),
      name: z.string(),
      role: z.enum([RoleName.Guest]),
      tableNumber: z.number().nullable(),
      createdAt: z.date(),
      updatedAt: z.date()
    })
  }),
  message: z.string()
})

//types
export type GuestType = z.infer<typeof GuestSchema>
export type GuestCreateBodyType = z.infer<typeof GuestCreateBodySchema>
export type GuestCreateResType = z.infer<typeof GuestSchema>
export type GuestLoginBodyType = z.infer<typeof GuestLoginBodySchema>
export type GuestLoginResType = z.infer<typeof GuestLoginResSchema>
