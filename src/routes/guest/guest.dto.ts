import { GuestLoginBodySchema, GuestLoginResSchema } from '@/routes/guest/guest.model'
import { createZodDto } from 'nestjs-zod'

export class GuestLoginBodyDTO extends createZodDto(GuestLoginBodySchema) {}
export class GuestLoginResDTO extends createZodDto(GuestLoginResSchema) {}
