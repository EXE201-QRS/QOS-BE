import { BILL_MESSAGE } from '@/common/constants/message'
import { PaymentMethod, PaymentStatus } from '@/common/constants/payment.constant'
import { OrderSchema } from '@/routes/order/order.model'
import { checkIdSchema } from '@/shared/utils/id.validation'
import { z } from 'zod'

export const BillSchema = z.object({
  id: z.number(),
  billNumber: z.string(),
  tableNumber: z.number().int().min(1, BILL_MESSAGE.TABLE_NUMBER_IS_INVALID),
  guestId: z.number().nullable(),
  subtotal: z.number().min(0, BILL_MESSAGE.SUBTOTAL_IS_INVALID),
  taxAmount: z.number().min(0, BILL_MESSAGE.TAX_AMOUNT_IS_INVALID),
  discountAmount: z.number().min(0, BILL_MESSAGE.DISCOUNT_AMOUNT_IS_INVALID),
  totalAmount: z.number().min(0, BILL_MESSAGE.TOTAL_AMOUNT_IS_INVALID),
  paymentMethod: z
    .enum([PaymentMethod.CASH, PaymentMethod.PAYOS])
    .default(PaymentMethod.CASH),
  paymentStatus: z
    .enum([
      PaymentStatus.PENDING,
      PaymentStatus.PROCESSING,
      PaymentStatus.COMPLETED,
      PaymentStatus.FAILED,
      PaymentStatus.REFUNDED
    ])
    .default(PaymentStatus.PENDING),
  paymentId: z.string().nullable(),
  paidAt: z.date().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const BillWithRelationsSchema = BillSchema.extend({
  orders: z.array(OrderSchema).optional(),
  guest: z
    .object({
      id: z.number(),
      name: z.string(),
      tableNumber: z.number()
    })
    .nullable()
    .optional(),
  createdBy: z
    .object({
      id: z.number(),
      name: z.string(),
      email: z.string(),
      avatar: z.string().nullable()
    })
    .nullable()
    .optional()
})

// GET Bills List
export const GetBillsResSchema = z.object({
  data: z.array(BillWithRelationsSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
})

// GET Bill Params
export const GetBillParamsSchema = z
  .object({
    billId: checkIdSchema(BILL_MESSAGE.ID_IS_INVALID)
  })
  .strict()

export const GetBillByTableParamsSchema = z
  .object({
    tableNumber: z.coerce.number().int().min(1, BILL_MESSAGE.TABLE_NUMBER_IS_INVALID)
  })
  .strict()

export const CreateBillParamsSchema = z
  .object({
    tableNumber: z.coerce.number().int().min(1, BILL_MESSAGE.TABLE_NUMBER_IS_INVALID)
  })
  .strict()

// GET Bill Detail Response
export const GetBillDetailResSchema = z.object({
  data: BillWithRelationsSchema,
  message: z.string()
})

// Bill Preview (before creating)
export const BillPreviewSchema = z.object({
  tableNumber: z.number().int(),
  orders: z.array(
    z.object({
      id: z.number(),
      dishName: z.string(),
      quantity: z.number().int(),
      price: z.number(),
      total: z.number(),
      status: z.string()
    })
  ),
  subtotal: z.number(),
  taxAmount: z.number(),
  totalAmount: z.number(),
  orderCount: z.number().int()
})

export const GetBillPreviewResSchema = z.object({
  data: BillPreviewSchema,
  message: z.string()
})

// CREATE Bill
export const CreateBillResSchema = z.object({
  data: BillWithRelationsSchema,
  message: z.string()
})

// Payment Process
export const ProcessPaymentBodySchema = z.object({
  paymentMethod: z.enum([PaymentMethod.CASH, PaymentMethod.PAYOS])
})

export const ProcessPaymentResSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  paymentUrl: z.string().optional(),
  data: BillWithRelationsSchema.optional()
})

// Query filters for listing bills
export const GetBillQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(1000),
  tableNumber: z.coerce.number().int().positive().optional(),
  paymentStatus: z
    .enum([
      PaymentStatus.PENDING,
      PaymentStatus.PROCESSING,
      PaymentStatus.COMPLETED,
      PaymentStatus.FAILED,
      PaymentStatus.REFUNDED
    ])
    .optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
})

// Types
export type BillType = z.infer<typeof BillSchema>
export type BillWithRelationsType = z.infer<typeof BillWithRelationsSchema>
export type GetBillParamsType = z.infer<typeof GetBillParamsSchema>
export type GetBillByTableParamsType = z.infer<typeof GetBillByTableParamsSchema>
export type CreateBillParamsType = z.infer<typeof CreateBillParamsSchema>
export type GetBillDetailResType = z.infer<typeof GetBillDetailResSchema>
export type BillPreviewType = z.infer<typeof BillPreviewSchema>
export type GetBillPreviewResType = z.infer<typeof GetBillPreviewResSchema>
export type CreateBillResType = z.infer<typeof CreateBillResSchema>
export type ProcessPaymentBodyType = z.infer<typeof ProcessPaymentBodySchema>
export type ProcessPaymentResType = z.infer<typeof ProcessPaymentResSchema>
export type GetBillQueryType = z.infer<typeof GetBillQuerySchema>
export type GetBillsResType = z.infer<typeof GetBillsResSchema>

// Database operation types
export type CreateBillType = {
  tableNumber: number
  guestId?: number
  subtotal: number
  taxAmount: number
  totalAmount: number
  billNumber: string
  createdById?: number
}

export type UpdateBillType = {
  paymentMethod?: PaymentMethod
  paymentStatus?: PaymentStatus
  paymentId?: string
  paidAt?: Date
  updatedById?: number
}
