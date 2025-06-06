import { DISH_MESSAGE, DISH_SNAPSHOT_MESSAGE } from '@/common/constants/message'
import { checkIdSchema } from '@/shared/utils/id.validation'
import { DishStatus } from '@prisma/client'
import { z } from 'zod'

export const DishSnapshotSchema = z.object({
  id: z.number(),
  dishId: z.number().min(0, DISH_MESSAGE.ID_IS_INVALID),
  name: z.string().trim().min(1, DISH_SNAPSHOT_MESSAGE.NAME_IS_REQUIRED).max(500),
  price: z.number().min(0, DISH_SNAPSHOT_MESSAGE.PRICE_IS_INVALID),
  description: z.string().max(1000),
  image: z.string(),
  status: z.enum([DishStatus.ACTIVE, DishStatus.INACTIVE]).default(DishStatus.INACTIVE),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const CreateDishSnapshotBodySchema = DishSnapshotSchema.pick({
  dishId: true,
  name: true,
  price: true,
  description: true,
  image: true,
  status: true
}).strict()

export const GetDishSnapshotParamsSchema = z
  .object({
    dishSnapshotId: checkIdSchema(DISH_SNAPSHOT_MESSAGE.ID_IS_INVALID)
  })
  .strict()

export const GetDishSnapshotDetailResSchema = DishSnapshotSchema

//list categories
export const GetDishSnapshotesResSchema = z.object({
  data: z.array(DishSnapshotSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
})

export const GetDishSnapshotesQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10)
  })
  .strict()

export type DishSnapshotType = z.infer<typeof DishSnapshotSchema>
export type CreateDishSnapshotBodyType = z.infer<typeof CreateDishSnapshotBodySchema>
export type GetDishSnapshotParamsType = z.infer<typeof GetDishSnapshotParamsSchema>
export type GetDishSnapshotDetailResType = z.infer<typeof GetDishSnapshotDetailResSchema>

export type GetDishSnapshotesQueryType = z.infer<typeof GetDishSnapshotesQuerySchema>
export type GetDishSnapshotesResType = z.infer<typeof GetDishSnapshotesResSchema>
