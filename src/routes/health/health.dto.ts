import { createZodDto } from 'nestjs-zod'

import { GetHealthResSchema } from './health.model'

export class GGetHealthResDTO extends createZodDto(GetHealthResSchema) {}
