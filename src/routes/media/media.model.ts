import { MEDIA_FOLDER_NAME } from '@/common/constants/other.constant'
import { z } from 'zod'

export const PresignedUploadFileBodySchema = z
  .object({
    extension: z.string()
  })
  .strict()

export const UploadFileResSchema = z.object({
  data: z.array(
    z.object({
      url: z.string()
    })
  )
})

export const GetFolderFileQuerySchema = z
  .object({
    folderName: z.enum([
      MEDIA_FOLDER_NAME.AVATAR,
      MEDIA_FOLDER_NAME.DISH,
      MEDIA_FOLDER_NAME.CATEGORY,
      MEDIA_FOLDER_NAME.DISH_SNAPSHOT,
      MEDIA_FOLDER_NAME.IMAGE,
      MEDIA_FOLDER_NAME.FILE
    ])
  })
  .strict()

export type GetFolderFileQuerySchemaType = z.infer<typeof GetFolderFileQuerySchema>
