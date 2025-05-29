import { CATEGORY_MESSAGE } from '@/common/constants/message'
import { checkIdSchema } from '@/shared/utils/id.validation'
import { z } from 'zod'

export const CategorySchema = z.object({
  id: z.number(),
  name: z
    .string()
    .trim()
    .regex(/^[A-Za-z].*$/, { message: CATEGORY_MESSAGE.NAME_IS_INVALID })
    .min(1, CATEGORY_MESSAGE.NAME_IS_REQUIRED)
    .max(500),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const CreateCategoryBodySchema = CategorySchema.pick({
  name: true
}).strict()

export const UpdateCategoryBodySchema = CreateCategoryBodySchema

export const GetCategoryParamsSchema = z
  .object({
    categoryId: checkIdSchema(CATEGORY_MESSAGE.ID_IS_INVALID)
  })
  .strict()

export const GetCategoryDetailResSchema = CategorySchema

//list categories
export const GetCategoriesResSchema = z.object({
  data: z.array(CategorySchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
})

export const GetCategoriesQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10)
  })
  .strict()

export type CategoryType = z.infer<typeof CategorySchema>
export type CreateCategoryBodyType = z.infer<typeof CreateCategoryBodySchema>
export type UpdateCategoryBodyType = z.infer<typeof UpdateCategoryBodySchema>
export type GetCategoryParamsType = z.infer<typeof GetCategoryParamsSchema>
export type GetCategoryDetailResType = z.infer<typeof GetCategoryDetailResSchema>

export type GetCategoriesQueryType = z.infer<typeof GetCategoriesQuerySchema>
export type GetCategoriesResType = z.infer<typeof GetCategoriesResSchema>
