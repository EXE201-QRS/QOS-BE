import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { unlink } from 'fs/promises'

@Injectable()
export class ParseFilesPipeWithUnlink implements PipeTransform {
  async transform(files: Express.Multer.File[]): Promise<Express.Multer.File[]> {
    const maxSize = 3 * 1024 * 1024
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ]

    const invalidFiles: string[] = []

    for (const file of files) {
      const errors: string[] = []

      if (file.size > maxSize) {
        errors.push('File too large')
      }

      if (!allowedTypes.includes(file.mimetype)) {
        errors.push(`Invalid type: ${file.mimetype}`)
      }

      if (errors.length > 0) {
        //  Nếu 1 file lỗi → xoá toàn bộ file
        await Promise.all(
          files.map((f) => unlink(f.path).catch(() => {})) // tránh crash nếu file đã xoá
        )
        throw new BadRequestException(
          ` File "${file.originalname}" invalid: ${errors.join(', ')}`
        )
      }
    }

    return files
  }
}
