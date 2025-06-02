import { IsPublic } from '@/common/decorators/auth.decorator'
import { Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { MediaService } from './media.service'
import { ParseFilesPipeWithUnlink } from './parse-files-pipe-with-unlink.pipe'

@Controller('media')
export class MediaController {
  constructor(private readonly mediaSerice: MediaService) {}

  @Post('images/upload')
  @IsPublic()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: {
        fileSize: 3 * 1024 * 1024 // 3MB
      }
    })
  )
  uploadFile(
    @UploadedFiles(new ParseFilesPipeWithUnlink())
    files: Array<Express.Multer.File>
  ) {
    return this.mediaSerice.uploadFiles(files)
  }
}
