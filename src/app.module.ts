import CustomZodValidationPipe from '@/common/pipes/custom-zod-validation.pipe'
import { RemoveRefreshTokenCronjob } from '@/cronjobs/remove-refresh-token.cronjob'
import { PermissionModule } from '@/routes/permission/permission.module'
import { RoleModule } from '@/routes/role/role.module'
import { HttpExceptionFilter } from '@/shared/filters/http-exception.filter'
import { Module } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ScheduleModule } from '@nestjs/schedule'
import { ZodSerializerInterceptor } from 'nestjs-zod'
import { AccountModule } from './routes/account/account.module'
import { AuthModule } from './routes/auth/auth.module'
import { CategoryModule } from './routes/category/category.module'
import { DishSnapshotModule } from './routes/dish-snapshot/dish-snapshot.module'
import { DishModule } from './routes/dish/dish.module'
import { TableModule } from './routes/table/table.module'
import { SharedModule } from './shared/shared.module'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SharedModule,
    AuthModule,
    RoleModule,
    PermissionModule,
    CategoryModule,
    DishModule,
    DishSnapshotModule,
    TableModule,
    AccountModule
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
    },
    RemoveRefreshTokenCronjob
  ]
})
export class AppModule {}
