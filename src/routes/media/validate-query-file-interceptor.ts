import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common'
import { unlinkSync } from 'fs'
import { unlink } from 'fs/promises'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { GetFolderFileQuerySchema } from './media.model'

@Injectable()
export class QueryValidationInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest()
    const files: Express.Multer.File[] = request.files

    try {
      // Thủ công validate query bằng zod
      GetFolderFileQuerySchema.parse(request.query)
    } catch (err) {
      // Nếu lỗi validation thì xóa hết file đã upload
      if (files && files.length) {
        await Promise.all(files.map((file) => unlink(file.path).catch(() => {})))
      }
      throw new BadRequestException(err.errors || err.message)
    }

    return next.handle().pipe(
      catchError((error) => {
        // Nếu có lỗi khác cũng xóa file
        if (files && files.length) {
          files.forEach((file) => unlinkSync(file.path))
        }
        return throwError(() => error)
      })
    )
  }
}
