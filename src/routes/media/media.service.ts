import { S3Service } from '@/shared/services/S3.service'
import { Injectable } from '@nestjs/common'
import { unlink } from 'fs/promises'
import { GetFolderFileQuerySchemaType } from './media.model'

@Injectable()
export class MediaService {
  constructor(private readonly s3Service: S3Service) {}

  async uploadFiles({
    files,
    query
  }: {
    files: Array<Express.Multer.File>
    query: GetFolderFileQuerySchemaType
  }) {
    const result = await Promise.all(
      files.map((file) => {
        return this.s3Service
          .uploadFile({
            fileName: `${query.folderName}/${file.filename}`,
            filePath: file.path,
            contentType: file.mimetype
          })
          .then((res) => {
            return { url: res.Location }
          })
          .catch((error) => {
            console.error('Error uploading file to S3:', error)
          })
      })
    )

    // xoa file sau khi upload len S3
    await Promise.all(
      files.map((file) => {
        return unlink(file.path)
      })
    )

    return { data: result }
  }
}
