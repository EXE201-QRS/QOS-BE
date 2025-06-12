import { createZodDto } from 'nestjs-zod'
import {
  CreateOrderBodySchema,
  CreateOrderResSchema,
  GetChefOrderesResSchema,
  GetOrderByTableNumberResSchema,
  GetOrderDetailResSchema,
  GetOrderesResSchema,
  GetOrderParamsSchema,
  GetOrderTableNumberParamsSchema,
  UpdateOrderBodySchema,
  UpdateOrderStatusSchema
} from 'src/routes/order/order.model'

export class CreateOrderBodyDTO extends createZodDto(CreateOrderBodySchema) {}

export class UpdateOrderBodyDTO extends createZodDto(UpdateOrderBodySchema) {}

export class UpdateOrderStatusDTO extends createZodDto(UpdateOrderStatusSchema) {}

export class GetOrderParamsDTO extends createZodDto(GetOrderParamsSchema) {}

export class GetOrderTableNumberParamsDTO extends createZodDto(
  GetOrderTableNumberParamsSchema
) {}

export class GetOrderDetailResDTO extends createZodDto(GetOrderDetailResSchema) {}

export class GetOrderesResDTO extends createZodDto(GetOrderesResSchema) {}

export class GetChefOrderesResDTO extends createZodDto(GetChefOrderesResSchema) {}

export class GetOrderByTableNumberResDTO extends createZodDto(
  GetOrderByTableNumberResSchema
) {}

export class CreateOrderResDTO extends createZodDto(CreateOrderResSchema) {}
