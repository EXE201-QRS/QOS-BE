import { S3Service } from '@/shared/services/S3.service'
import { Injectable } from '@nestjs/common'
import { unlink } from 'fs/promises'

@Injectable()
export class MediaService {
  constructor(private readonly s3Service: S3Service) {}

  async uploadFiles(files: Array<Express.Multer.File>) {
    const result = await Promise.all(
      files.map((file) => {
        return this.s3Service
          .uploadFile({
            fileName: `images/${file.filename}`,
            filePath: file.path,
            contentType: file.mimetype
          })
          .then((res) => {
            return { url: res.Location }
          })
      })
    )

    // xoa file sau khi upload len S3
    await Promise.all(
      files.map((file) => {
        return unlink(file.path)
      })
    )

    return result
  }
}
