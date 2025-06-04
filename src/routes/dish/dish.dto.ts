import { createZodDto } from 'nestjs-zod'
import {
  CreateDishBodySchema,
  GetDishDetailResSchema,
  GetDishDetailResWithCategorySchema,
  GetDishesResSchema,
  GetDishParamsSchema,
  UpdateDishBodySchema
} from 'src/routes/dish/dish.model'

export class CreateDishBodyDTO extends createZodDto(CreateDishBodySchema) {}

export class UpdateDishBodyDTO extends createZodDto(UpdateDishBodySchema) {}

export class GetDishParamsDTO extends createZodDto(GetDishParamsSchema) {}

export class GetDishDetailResDTO extends createZodDto(GetDishDetailResSchema) {}

export class GetDishDetailResWithCategoryDTO extends createZodDto(
  GetDishDetailResWithCategorySchema
) {}

export class GetDishesResDTO extends createZodDto(GetDishesResSchema) {}
