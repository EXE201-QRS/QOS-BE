import { createZodDto } from 'nestjs-zod'
import {
  CreateTableBodySchema,
  GetTableDetailResSchema,
  GetTableesQuerySchema,
  GetTableesResSchema,
  GetTableParamsSchema,
  UpdateTableBodySchema
} from 'src/routes/table/table.model'

export class CreateTableBodyDTO extends createZodDto(CreateTableBodySchema) {}

export class UpdateTableBodyDTO extends createZodDto(UpdateTableBodySchema) {}

export class GetTableParamsDTO extends createZodDto(GetTableParamsSchema) {}

export class GetTableDetailResDTO extends createZodDto(GetTableDetailResSchema) {}

export class GetTableesQueryDTO extends createZodDto(GetTableesQuerySchema) {}

export class GetTableesResDTO extends createZodDto(GetTableesResSchema) {}
