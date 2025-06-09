import { createZodDto } from 'nestjs-zod'
import {
  CreateOrderBodySchema,
  CreateOrderResSchema,
  GetOrderByTableNumberResSchema,
  GetOrderDetailResSchema,
  GetOrderesResSchema,
  GetOrderParamsSchema,
  GetOrderTableNumberParamsSchema,
  UpdateOrderBodySchema
} from 'src/routes/order/order.model'

export class CreateOrderBodyDTO extends createZodDto(CreateOrderBodySchema) {}

export class UpdateOrderBodyDTO extends createZodDto(UpdateOrderBodySchema) {}

export class GetOrderParamsDTO extends createZodDto(GetOrderParamsSchema) {}

export class GetOrderTableNumberParamsDTO extends createZodDto(
  GetOrderTableNumberParamsSchema
) {}

export class GetOrderDetailResDTO extends createZodDto(GetOrderDetailResSchema) {}

export class GetOrderesResDTO extends createZodDto(GetOrderesResSchema) {}

export class GetOrderByTableNumberResDTO extends createZodDto(
  GetOrderByTableNumberResSchema
) {}

export class CreateOrderResDTO extends createZodDto(CreateOrderResSchema) {}
