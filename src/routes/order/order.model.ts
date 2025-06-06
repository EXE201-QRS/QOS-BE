import { ORDER_MESSAGE } from '@/common/constants/message'
import { OrderStatus } from '@/common/constants/order.constant'

import { checkIdSchema } from '@/shared/utils/id.validation'
import { z } from 'zod'

export const OrderSchema = z.object({
  id: z.number(),
  guestId: z.number().int().min(0, ORDER_MESSAGE.GUEST_ID_IS_INVALID),
  tableNumber: z.number().int().min(1, ORDER_MESSAGE.TABLE_NUMBER_IS_INVALID),
  dishSnapshotId: z.number().int().min(0, ORDER_MESSAGE.DISH_SNAPSHOT_ID_IS_INVALID),
  quantity: z.number().int().min(0, ORDER_MESSAGE.QUANTITY_IS_INVALID),
  description: z.string().max(500, ORDER_MESSAGE.DESCRIPTION_IS_TOO_LONG).optional(),
  status: z
    .enum([
      OrderStatus.CONFIRMED,
      OrderStatus.PENDING,
      OrderStatus.SHIPPED,
      OrderStatus.COMPLETED,
      OrderStatus.CANCELLED
    ])
    .default(OrderStatus.CONFIRMED),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

//list categories
export const GetOrderesResSchema = z.object({
  data: z.array(OrderSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
})

export const GetOrderParamsSchema = z
  .object({
    OrderId: checkIdSchema(ORDER_MESSAGE.ID_IS_INVALID)
  })
  .strict()

export const GetOrderDetailResSchema = z.object({
  data: OrderSchema,
  message: z.string()
})

export const CreateOrderBodySchema = z
  .object({
    ...OrderSchema.pick({
      guestId: true,
      tableNumber: true
    }).shape
  })
  .extend({
    orderItems: z.array(
      z.object({
        dishId: checkIdSchema(ORDER_MESSAGE.DISH_ID_IS_INVALID),
        quantity: z.number().int().min(1, ORDER_MESSAGE.QUANTITY_IS_INVALID),
        description: z.string().max(500, ORDER_MESSAGE.DESCRIPTION_IS_TOO_LONG).optional()
      })
    )
  })

export const CreateOrderItemSchema = CreateOrderBodySchema.pick({
  guestId: true,
  tableNumber: true
}).extend({
  ...OrderSchema.pick({
    dishSnapshotId: true,
    quantity: true,
    description: true,
    status: true
  }).shape
})

export const CreateOrderResSchema = z.object({
  data: z.array(OrderSchema),
  message: z.string()
})

export const UpdateOrderBodySchema = CreateOrderItemSchema

export type OrderType = z.infer<typeof OrderSchema>
export type CreateOrderBodyType = z.infer<typeof CreateOrderBodySchema>
export type CreateOrderItemType = z.infer<typeof CreateOrderItemSchema>
export type CreateOrderResType = z.infer<typeof CreateOrderResSchema>
export type UpdateOrderBodyType = z.infer<typeof UpdateOrderBodySchema>
export type GetOrderParamsType = z.infer<typeof GetOrderParamsSchema>

export type GetOrderesResType = z.infer<typeof GetOrderesResSchema>
