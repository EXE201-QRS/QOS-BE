import { createZodDto } from 'nestjs-zod'
import {
  CreateGuestBodySchema,
  GetGuestDetailResSchema,
  GetGuestParamsSchema,
  GetGuestsQuerySchema,
  GetGuestsResSchema,
  UpdateGuestBodySchema
} from 'src/routes/guest/guest.model'

export class CreateGuestBodyDTO extends createZodDto(CreateGuestBodySchema) {}

export class UpdateGuestBodyDTO extends createZodDto(UpdateGuestBodySchema) {}

export class GetGuestParamsDTO extends createZodDto(GetGuestParamsSchema) {}

export class GetGuestDetailResDTO extends createZodDto(GetGuestDetailResSchema) {}

export class GetGuestsQueryDTO extends createZodDto(GetGuestsQuerySchema) {}

export class GetGuestsResDTO extends createZodDto(GetGuestsResSchema) {}
