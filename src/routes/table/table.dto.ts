import { createZodDto } from 'nestjs-zod'
import {
  CreateTableBodySchema,
  GetTableDetailResSchema,
  GetTableParamsSchema,
  GetTablesResSchema,
  UpdateTableBodySchema
} from 'src/routes/table/table.model'

export class GetTablesResDTO extends createZodDto(GetTablesResSchema) {}

export class GetTableDetailResDTO extends createZodDto(GetTableDetailResSchema) {}

export class GetTableParamsDTO extends createZodDto(GetTableParamsSchema) {}

export class CreateTableBodyDTO extends createZodDto(CreateTableBodySchema) {}

export class UpdateTableBodyDTO extends createZodDto(UpdateTableBodySchema) {}
