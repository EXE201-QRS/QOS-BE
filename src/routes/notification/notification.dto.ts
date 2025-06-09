import { createZodDto } from 'nestjs-zod'
import {
  GetNotificationnDetailResSchema,
  GetNotificationnParamsSchema,
  GetNotificationnsResSchema,
  UpdateNotificationnBodySchema
} from './notification.model'

export class UpdateNotificationBodyDTO extends createZodDto(
  UpdateNotificationnBodySchema
) {}

export class GetNotificationParamsDTO extends createZodDto(
  GetNotificationnParamsSchema
) {}

export class GetNotificationDetailResDTO extends createZodDto(
  GetNotificationnDetailResSchema
) {}

export class GetNotificationsResDTO extends createZodDto(GetNotificationnsResSchema) {}
