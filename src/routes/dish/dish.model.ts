import { DishStatus } from '@/common/constants/dish.constant'
import { CATEGORY_MESSAGE, DISH_MESSAGE } from '@/common/constants/message'
import { CategorySchema } from '@/routes/category/category.model'
import { checkIdSchema } from '@/shared/utils/id.validation'
import { z } from 'zod'

export const DishSchema = z.object({
  id: z.number(),
  categoryId: z.number().min(0, CATEGORY_MESSAGE.ID_IS_INVALID),
  name: z
    .string()
    .trim()
    .regex(/^[A-Za-z].*$/, { message: DISH_MESSAGE.NAME_IS_INVALID })
    .min(1, DISH_MESSAGE.NAME_IS_REQUIRED)
    .max(500),
  price: z.number().min(0, DISH_MESSAGE.PRICE_IS_INVALID),
  description: z.string().max(1000),
  image: z.string(),
  status: z.enum([DishStatus.ACTIVE, DishStatus.INACTIVE]).default(DishStatus.INACTIVE),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const DishWithCategorySchema = DishSchema.extend({
  category: CategorySchema.pick({
    id: true,
    name: true
  })
})

//GET
export const GetDishesResSchema = z.object({
  data: z.array(DishWithCategorySchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
})

export const GetDishParamsSchema = z
  .object({
    dishId: checkIdSchema(DISH_MESSAGE.ID_IS_INVALID)
  })
  .strict()

export const GetDishDetailResSchema = z.object({
  data: DishSchema,
  message: z.string()
})

export const GetDishDetailResWithCategorySchema = z.object({
  data: DishWithCategorySchema,
  message: z.string()
})

export const CreateDishBodySchema = DishSchema.pick({
  categoryId: true,
  name: true,
  price: true,
  description: true,
  image: true,
  status: true
}).strict()
export const UpdateDishBodySchema = CreateDishBodySchema

//types
export type DishType = z.infer<typeof DishSchema>
export type CreateDishBodyType = z.infer<typeof CreateDishBodySchema>
export type UpdateDishBodyType = z.infer<typeof UpdateDishBodySchema>
export type GetDishParamsType = z.infer<typeof GetDishParamsSchema>
export type GetDishDetailResType = z.infer<typeof GetDishDetailResSchema>
export type GetDishDetailResWithCategoryType = z.infer<
  typeof GetDishDetailResWithCategorySchema
>
export type GetDishesResType = z.infer<typeof GetDishesResSchema>
