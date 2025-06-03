import {
  CreateAccountBodySchema,
  GetAccountParamsSchema,
  GetAccountsResSchema,
  UpdateAccountBodySchema
} from '@/routes/account/account.model'
import { UpdateProfileResDTO } from '@/shared/dtos/shared-user.dto'
import { createZodDto } from 'nestjs-zod'
import { ChangePasswordBodySchema } from './account.model'

export class GetAccountsResDTO extends createZodDto(GetAccountsResSchema) {}

export class GetAccountParamsDTO extends createZodDto(GetAccountParamsSchema) {}

export class CreateAccountBodyDTO extends createZodDto(CreateAccountBodySchema) {}

export class UpdateAccountBodyDTO extends createZodDto(UpdateAccountBodySchema) {}

export class CreateAccountResDTO extends UpdateProfileResDTO {}

export class ChangePasswordBodyDTO extends createZodDto(ChangePasswordBodySchema) {}
