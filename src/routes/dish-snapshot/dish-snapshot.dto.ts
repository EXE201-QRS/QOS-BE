import { createZodDto } from 'nestjs-zod'
import {
  GetDishSnapshotDetailResSchema,
  GetDishSnapshotesQuerySchema,
  GetDishSnapshotesResSchema,
  GetDishSnapshotParamsSchema
} from 'src/routes/dish-snapshot/dish-snapshot.model'

export class GetDishSnapshotParamsDTO extends createZodDto(GetDishSnapshotParamsSchema) {}

export class GetDishSnapshotDetailResDTO extends createZodDto(
  GetDishSnapshotDetailResSchema
) {}

export class GetDishSnapshotesQueryDTO extends createZodDto(
  GetDishSnapshotesQuerySchema
) {}

export class GetDishSnapshotesResDTO extends createZodDto(GetDishSnapshotesResSchema) {}
