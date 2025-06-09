import { IsPublic } from '@/common/decorators/auth.decorator'
import { PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { Body, Controller, Delete, Get, Param, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  GetNotificationDetailResDTO,
  GetNotificationParamsDTO,
  GetNotificationsResDTO,
  UpdateNotificationBodyDTO
} from './notification.dto'
import { NotificationService } from './notification.service'

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @IsPublic()
  @ZodSerializerDto(GetNotificationsResDTO)
  list(@Query() query: PaginationQueryDTO) {
    return this.notificationService.list({
      page: query.page,
      limit: query.limit
    })
  }

  @Get(':notificationId')
  @IsPublic()
  @ZodSerializerDto(GetNotificationDetailResDTO)
  findById(@Param() params: GetNotificationParamsDTO) {
    return this.notificationService.findById(params.notificationId)
  }

  @Put(':notificationId')
  @ZodSerializerDto(GetNotificationDetailResDTO)
  update(
    @Body() body: UpdateNotificationBodyDTO,
    @Param() params: GetNotificationParamsDTO
  ) {
    return this.notificationService.update({
      data: body,
      id: params.notificationId
    })
  }

  @Delete(':notificationId')
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetNotificationParamsDTO) {
    return this.notificationService.delete({
      id: params.notificationId
    })
  }
}
