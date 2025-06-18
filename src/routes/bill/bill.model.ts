import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

// Base Bill schema
const BillSchema = z.object({
  id: z.number().int().positive(),
  billNumber: z.string().min(1).max(50),
  tableNumber: z.number().int().positive(),
  subtotal: z.number().min(0),
  taxAmount: z.number().min(0),
  discountAmount: z.number().min(0),
  serviceCharge: z.number().min(0),
  totalAmount: z.number().min(0),
  status: z.enum(['PENDING', 'CONFIRMED', 'PAID', 'CANCELLED']),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER']).optional(),
  notes: z.string().max(1000).default(''),
  createdById: z.number().int().positive().optional(),
  updatedById: z.number().int().positive().optional(),
  deletedById: z.number().int().positive().optional(),
  deletedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
})

// Create Bill DTO
const CreateBillSchema = z.object({
  tableNumber: z.number().int().positive(),
  discountAmount: z.number().min(0).default(0),
  notes: z.string().max(1000).default(''),
  orderIds: z.array(z.number().int().positive()).min(1, 'Phải có ít nhất 1 order')
})

export class CreateBillDto extends createZodDto(CreateBillSchema) {}

// Update Bill DTO
const UpdateBillSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PAID', 'CANCELLED']).optional(),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER']).optional(),
  discountAmount: z.number().min(0).optional(),
  notes: z.string().max(1000).optional()
})

export class UpdateBillDto extends createZodDto(UpdateBillSchema) {}

// Bill Preview DTO (for preview before creating bill)
const BillPreviewSchema = z.object({
  tableNumber: z.number().int().positive(),
  discountAmount: z.number().min(0).default(0),
  orderIds: z.array(z.number().int().positive()).min(1)
})

export class BillPreviewDto extends createZodDto(BillPreviewSchema) {}

// Bill Response DTO
const BillResponseSchema = BillSchema.extend({
  orders: z
    .array(
      z.object({
        id: z.number(),
        quantity: z.number(),
        dishSnapshot: z.object({
          id: z.number(),
          name: z.string(),
          price: z.number(),
          image: z.string().optional()
        })
      })
    )
    .optional(),
  payments: z
    .array(
      z.object({
        id: z.number(),
        paymentMethod: z.enum(['CASH', 'BANK_TRANSFER']),
        amount: z.number(),
        status: z.enum([
          'PENDING',
          'PROCESSING',
          'PAID',
          'FAILED',
          'CANCELLED',
          'EXPIRED',
          'REFUNDED'
        ]),
        paidAt: z.date().optional()
      })
    )
    .optional(),
  createdBy: z
    .object({
      id: z.number(),
      name: z.string(),
      email: z.string()
    })
    .optional()
})

export class BillResponseDto extends createZodDto(BillResponseSchema) {}

// Bill List Query DTO
const BillListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['PENDING', 'CONFIRMED', 'PAID', 'CANCELLED']).optional(),
  tableNumber: z.coerce.number().int().positive().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  search: z.string().optional() // Search by bill number
})

export class BillListQueryDto extends createZodDto(BillListQuerySchema) {}

// Occupied Tables Response DTO
const OccupiedTableSchema = z.object({
  tableNumber: z.number(),
  deliveredOrdersCount: z.number(),
  totalAmount: z.number(),
  orders: z.array(
    z.object({
      id: z.number(),
      quantity: z.number(),
      status: z.string(),
      dishSnapshot: z.object({
        id: z.number(),
        name: z.string(),
        price: z.number(),
        image: z.string().optional()
      })
    })
  )
})

export class OccupiedTableDto extends createZodDto(OccupiedTableSchema) {}

// Bill Summary DTO (for notifications and reports)
const BillSummarySchema = z.object({
  billNumber: z.string(),
  tableNumber: z.number(),
  totalAmount: z.number(),
  orderCount: z.number(),
  status: z.enum(['PENDING', 'CONFIRMED', 'PAID', 'CANCELLED']),
  createdAt: z.date()
})

export class BillSummaryDto extends createZodDto(BillSummarySchema) {}

// Payment DTOs
// Base Payment schema
const PaymentSchema = z.object({
  id: z.number().int().positive(),
  billId: z.number().int().positive(),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER']),
  amount: z.number().min(0),
  status: z.enum([
    'PENDING',
    'PROCESSING',
    'PAID',
    'FAILED',
    'CANCELLED',
    'EXPIRED',
    'REFUNDED'
  ]),
  payosOrderId: z.string().optional(),
  payosPaymentLinkId: z.string().optional(),
  payosTransactionId: z.string().optional(),
  payosQrCode: z.string().optional(),
  payosCheckoutUrl: z.string().url().optional(),
  receivedAmount: z.number().min(0).optional(),
  changeAmount: z.number().min(0).optional(),
  gatewayResponse: z.any().optional(),
  failureReason: z.string().max(1000).optional(),
  paidAt: z.date().optional(),
  expiredAt: z.date().optional(),
  processedById: z.number().int().positive().optional(),
  deletedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
})

// Create Cash Payment DTO
const CreateCashPaymentSchema = z.object({
  billId: z.number().int().positive(),
  receivedAmount: z.number().min(0)
})

export class CreateCashPaymentDto extends createZodDto(CreateCashPaymentSchema) {}

// Create PayOS Payment DTO
const CreatePayOSPaymentSchema = z.object({
  billId: z.number().int().positive(),
  buyerName: z.string().max(255).optional(),
  buyerEmail: z.string().email().optional(),
  buyerPhone: z.string().max(20).optional(),
  buyerAddress: z.string().max(500).optional(),
  returnUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional()
})

export class CreatePayOSPaymentDto extends createZodDto(CreatePayOSPaymentSchema) {}

// Payment Response DTO
const PaymentResponseSchema = PaymentSchema.extend({
  bill: z
    .object({
      id: z.number(),
      billNumber: z.string(),
      tableNumber: z.number(),
      totalAmount: z.number(),
      status: z.enum(['PENDING', 'CONFIRMED', 'PAID', 'CANCELLED'])
    })
    .optional(),
  processedBy: z
    .object({
      id: z.number(),
      name: z.string(),
      email: z.string()
    })
    .optional()
})

export class PaymentResponseDto extends createZodDto(PaymentResponseSchema) {}

// PayOS Webhook DTO
const PayOSWebhookSchema = z.object({
  code: z.string(),
  desc: z.string(),
  data: z.object({
    orderCode: z.number(),
    amount: z.number(),
    description: z.string(),
    accountNumber: z.string().optional(),
    reference: z.string().optional(),
    transactionDateTime: z.string(),
    currency: z.string().default('VND'),
    paymentLinkId: z.string(),
    code: z.string(),
    desc: z.string(),
    counterAccountBankId: z.string().optional(),
    counterAccountBankName: z.string().optional(),
    counterAccountName: z.string().optional(),
    counterAccountNumber: z.string().optional(),
    virtualAccountName: z.string().optional(),
    virtualAccountNumber: z.string().optional()
  }),
  signature: z.string()
})

export class PayOSWebhookDto extends createZodDto(PayOSWebhookSchema) {}

// Types for better TypeScript support
export interface PaymentWithBill {
  id: number
  billId: number
  paymentMethod: string
  amount: number
  status: string
  payosOrderId?: string
  bill?: {
    id: number
    billNumber: string
    tableNumber: number
    totalAmount: number
    status: string
  }
}
