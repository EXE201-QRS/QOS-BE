import { DISH_MESSAGE } from '@/common/constants/message'
import { TableStatus } from '@/common/constants/table.constant'
import { checkIdSchema } from '@/shared/utils/id.validation'
import { z } from 'zod'

export const TableSchema = z.object({
  id: z.number(),
  number: z.number().int().positive(),
  capacity: z.number().int().positive(),
  status: z
    .enum([
      TableStatus.AVAILABLE,
      TableStatus.UNAVAILABLE,
      TableStatus.CLEANING,
      TableStatus.OCCUPIED
    ])
    .default(TableStatus.UNAVAILABLE),
  token: z.string().min(1).max(500),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

//list categories
export const GetTablesResSchema = z.object({
  data: z.array(TableSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
})

export const GetTableParamsSchema = z
  .object({
    tableId: checkIdSchema(DISH_MESSAGE.ID_IS_INVALID)
  })
  .strict()

export const GetTableDetailResSchema = z.object({
  data: TableSchema,
  message: z.string()
})

export const CreateTableBodySchema = TableSchema.pick({
  number: true,
  capacity: true,
  status: true,
  token: true
}).strict()

export const UpdateTableBodySchema = CreateTableBodySchema

//Types
export type TableType = z.infer<typeof TableSchema>
export type CreateTableBodyType = z.infer<typeof CreateTableBodySchema>
export type UpdateTableBodyType = z.infer<typeof UpdateTableBodySchema>
export type GetTableParamsType = z.infer<typeof GetTableParamsSchema>
export type GetTableDetailResType = z.infer<typeof GetTableDetailResSchema>
export type GetTablesResType = z.infer<typeof GetTablesResSchema>
