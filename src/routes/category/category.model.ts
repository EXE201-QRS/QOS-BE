import { CATEGORY_MESSAGE } from '@/common/constants/message'
import { checkIdSchema } from '@/shared/utils/id.validation'
import { z } from 'zod'

export const CategorySchema = z
  .object({
    id: z.number(),
    name: z
      .string()
      .trim()
      .regex(/^[A-Za-z].*$/, { message: CATEGORY_MESSAGE.NAME_IS_INVALID })
      .min(1, CATEGORY_MESSAGE.NAME_IS_REQUIRED)
      .max(500),
    image: z.string().trim().nullable(),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date()
  })
  .strict()

//list categories
export const GetCategoriesResSchema = z.object({
  data: z.array(CategorySchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
})

export const GetCategoryParamsSchema = z
  .object({
    categoryId: checkIdSchema(CATEGORY_MESSAGE.ID_IS_INVALID)
  })
  .strict()

export const GetCategoryDetailResSchema = z.object({
  data: CategorySchema,
  message: z.string()
})

export const CreateCategoryBodySchema = CategorySchema.pick({
  name: true,
  image: true
}).strict()

export const UpdateCategoryBodySchema = CreateCategoryBodySchema

export type CategoryType = z.infer<typeof CategorySchema>
export type GetCategoriesResType = z.infer<typeof GetCategoriesResSchema>
export type GetCategoryParamsType = z.infer<typeof GetCategoryParamsSchema>
export type GetCategoryDetailResType = z.infer<typeof GetCategoryDetailResSchema>
export type CreateCategoryBodyType = z.infer<typeof CreateCategoryBodySchema>
export type UpdateCategoryBodyType = z.infer<typeof UpdateCategoryBodySchema>
