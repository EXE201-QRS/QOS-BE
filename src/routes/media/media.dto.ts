import { createZodDto } from 'nestjs-zod'
import { GetFolderFileQuerySchema, UploadFileResSchema } from './media.model'

export class UploadFileResDTO extends createZodDto(UploadFileResSchema) {}
export class GetFolderFileQueryDTO extends createZodDto(GetFolderFileQuerySchema) {}
