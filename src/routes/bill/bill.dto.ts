import { createZodDto } from 'nestjs-zod'
import {
  BillWithRelationsSchema,
  CreateBillParamsSchema,
  CreateBillResSchema,
  GetBillByTableParamsSchema,
  GetBillDetailResSchema,
  GetBillParamsSchema,
  GetBillPreviewResSchema,
  GetBillQuerySchema,
  GetBillsResSchema,
  ProcessPaymentBodySchema,
  ProcessPaymentResSchema
} from './bill.model'

// Request DTOs
export class CreateBillParamsDTO extends createZodDto(CreateBillParamsSchema) {}

export class GetBillParamsDTO extends createZodDto(GetBillParamsSchema) {}

export class GetBillByTableParamsDTO extends createZodDto(GetBillByTableParamsSchema) {}

export class ProcessPaymentBodyDTO extends createZodDto(ProcessPaymentBodySchema) {}

export class GetBillQueryDTO extends createZodDto(GetBillQuerySchema) {}

// Response DTOs
export class CreateBillResDTO extends createZodDto(CreateBillResSchema) {}

export class BillResDTO extends createZodDto(BillWithRelationsSchema) {}

export class GetBillDetailResDTO extends createZodDto(GetBillDetailResSchema) {}

export class GetBillPreviewResDTO extends createZodDto(GetBillPreviewResSchema) {}

export class GetBillsResDTO extends createZodDto(GetBillsResSchema) {}

export class ProcessPaymentResDTO extends createZodDto(ProcessPaymentResSchema) {}
