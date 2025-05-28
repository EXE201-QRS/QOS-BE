import { createZodDto } from 'nestjs-zod'
import {
  CreateCategoryBodySchema,
  GetCategoriesQuerySchema,
  GetCategoriesResSchema,
  GetCategoryDetailResSchema,
  GetCategoryParamsSchema,
  UpdateCategoryBodySchema
} from 'src/routes/category/category.model'

export class CreateCategoryBodyDTO extends createZodDto(CreateCategoryBodySchema) {}

export class UpdateCategoryBodyDTO extends createZodDto(UpdateCategoryBodySchema) {}

export class GetCategoryParamsDTO extends createZodDto(GetCategoryParamsSchema) {}

export class GetCategoryDetailResDTO extends createZodDto(GetCategoryDetailResSchema) {}

export class GetCategoriesQueryDTO extends createZodDto(GetCategoriesQuerySchema) {}

export class GetCategoriesResDTO extends createZodDto(GetCategoriesResSchema) {}
