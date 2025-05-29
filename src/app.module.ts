import CustomZodValidationPipe from '@/common/pipes/custom-zod-validation.pipe'
import { PermissionModule } from '@/routes/permission/permission.module'
import { RoleModule } from '@/routes/role/role.module'
import { HttpExceptionFilter } from '@/shared/filters/http-exception.filter'
import { Module } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ZodSerializerInterceptor } from 'nestjs-zod'
import { AuthModule } from './routes/auth/auth.module'
import { CategoryModule } from './routes/category/category.module'
import { DishModule } from './routes/dish/dish.module'
import { SharedModule } from './shared/shared.module'

@Module({
  imports: [
    SharedModule,
    AuthModule,
    RoleModule,
    PermissionModule,
    CategoryModule,
    DishModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe
    },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    }
  ]
})
export class AppModule {}
