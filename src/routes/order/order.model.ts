import { ORDER_MESSAGE } from '@/common/constants/message'
import { OrderStatus } from '@/common/constants/order.constant'

import { checkIdSchema } from '@/shared/utils/id.validation'
import { z } from 'zod'
import { DishSnapshotSchema } from '../dish-snapshot/dish-snapshot.model'
import { DishSchema } from '../dish/dish.model'
import { GuestSchema } from '../guest/guest.model'

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
      OrderStatus.DELIVERED,
      OrderStatus.COMPLETED,
      OrderStatus.CANCELLED
    ])
    .default(OrderStatus.PENDING),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const OrderDetaiWithFullDataSchema = OrderSchema.extend({
  guest: GuestSchema.pick({
    id: true,
    name: true,
    tableNumber: true
  }),
  dishSnapshot: DishSnapshotSchema.pick({
    id: true,
    name: true,
    price: true,
    image: true
  })
})

//list categories
export const GetOrderesResSchema = z.object({
  data: z.array(OrderSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
})

export const GetChefOrderesResSchema = z.object({
  data: z.array(OrderDetaiWithFullDataSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  message: z.string()
})

export const GetOrderByTableNumberSchema = z.object({
  ...OrderSchema.pick({
    id: true,
    guestId: true,
    tableNumber: true,
    dishSnapshotId: true,
    quantity: true,
    status: true,
    description: true
  }).shape,
  dish: DishSchema.pick({
    id: true,
    categoryId: true,
    name: true,
    price: true,
    image: true,
    description: true
  }).extend({
    category: z.object({
      id: z.number(),
      name: z.string()
    })
  })
})
export const GetOrderByTableNumberResSchema = z.object({
  data: z.array(GetOrderByTableNumberSchema),
  message: z.string()
})

export const GetOrderParamsSchema = z
  .object({
    orderId: checkIdSchema(ORDER_MESSAGE.ID_IS_INVALID)
  })
  .strict()

export const GetOrderTableNumberParamsSchema = z
  .object({
    tableNumber: z.coerce.number().int()
  })
  .strict()

export const GetOrderDetailResSchema = z.object({
  data: OrderSchema,
  // .extend({
  //   guest: GuestSchema.pick({
  //     id: true,
  //     name: true,
  //     tableNumber: true
  //   }).optional(),
  //   dishSnapshot: DishSnapshotSchema.pick({
  //     id: true,
  //     name: true,
  //     price: true,
  //     image: true
  //   }).optional()
  // }),
  message: z.string()
})

export const GetOrderDetailResWithFullDataSchema = z.object({
  data: OrderDetaiWithFullDataSchema,
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

export const UpdateOrderStatusSchema = z.object({
  status: z
    .enum([
      OrderStatus.CONFIRMED,
      OrderStatus.PENDING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
      OrderStatus.COMPLETED,
      OrderStatus.CANCELLED
    ])
})

export type OrderType = z.infer<typeof OrderSchema>
export type OrderTableNumberType = z.infer<typeof GetOrderByTableNumberSchema>
export type CreateOrderBodyType = z.infer<typeof CreateOrderBodySchema>
export type CreateOrderItemType = z.infer<typeof CreateOrderItemSchema>
export type CreateOrderResType = z.infer<typeof CreateOrderResSchema>
export type UpdateOrderBodyType = z.infer<typeof UpdateOrderBodySchema>
export type UpdateOrderStatusType = z.infer<typeof UpdateOrderStatusSchema>
export type GetOrderParamsType = z.infer<typeof GetOrderParamsSchema>
export type GetOrderDetailResType = z.infer<typeof GetOrderDetailResSchema>
export type GetOrderDetailResWithFullDataType = z.infer<
  typeof GetOrderDetailResWithFullDataSchema
>
export type GetOrderesResType = z.infer<typeof GetOrderesResSchema>
export type GetChefOrderesResType = z.infer<typeof GetChefOrderesResSchema>

export type GetOrderTableNumberParamsType = z.infer<
  typeof GetOrderTableNumberParamsSchema
>
export type OrderDetaiWithFullDataType = z.infer<typeof OrderDetaiWithFullDataSchema>

export type GetOrderTableNumberResType = z.infer<typeof GetOrderByTableNumberResSchema>
