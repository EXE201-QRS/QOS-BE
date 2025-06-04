import { createZodDto } from 'nestjs-zod'
import {
  CreateCategoryBodySchema,
  GetCategoriesResSchema,
  GetCategoryDetailResSchema,
  GetCategoryParamsSchema,
  UpdateCategoryBodySchema
} from 'src/routes/category/category.model'

export class GetCategoryDetailResDTO extends createZodDto(GetCategoryDetailResSchema) {}

export class GetCategoryParamsDTO extends createZodDto(GetCategoryParamsSchema) {}
export class GetCategoriesResDTO extends createZodDto(GetCategoriesResSchema) {}

export class CreateCategoryBodyDTO extends createZodDto(CreateCategoryBodySchema) {}

export class UpdateCategoryBodyDTO extends createZodDto(UpdateCategoryBodySchema) {}
