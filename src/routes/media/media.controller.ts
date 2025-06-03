import { IsPublic } from '@/common/decorators/auth.decorator'
import { Controller, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { ZodSerializerDto } from 'nestjs-zod'
import { GetFolderFileQueryDTO, UploadFileResDTO } from './media.dto'
import { MediaService } from './media.service'
import { ParseFilesPipeWithUnlink } from './parse-files-pipe-with-unlink.pipe'
import { QueryValidationInterceptor } from './validate-query-file-interceptor'

@Controller('media')
export class MediaController {
  constructor(private readonly mediaSerice: MediaService) {}

  @Post('images/upload')
  @ZodSerializerDto(UploadFileResDTO)
  @IsPublic()
  @UseInterceptors(
    FilesInterceptor('files', 1, {
      limits: {
        fileSize: 3 * 1024 * 1024 // 3MB
      }
    }),
    QueryValidationInterceptor
  )
  uploadFile(
    @Query() query: GetFolderFileQueryDTO,
    @UploadedFiles(new ParseFilesPipeWithUnlink())
    files: Array<Express.Multer.File>
  ) {
    return this.mediaSerice.uploadFiles({ files, query })
  }
}
