import { IsPublic } from '@/common/decorators/auth.decorator'
import { Body, Controller, Post } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'

import { RefreshTokenBodyDTO, RefreshTokenResDTO } from '@/routes/auth/auth.dto'
import { LogoutBodyType } from '@/routes/auth/auth.model'
import { GuestLoginBodyDTO, GuestLoginResDTO } from '@/routes/guest/guest.dto'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { GuestService } from './guest.service'
@Controller('guest')
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Post('/login')
  @IsPublic()
  @ZodSerializerDto(GuestLoginResDTO)
  login(@Body() body: GuestLoginBodyDTO) {
    return this.guestService.login({
      data: body
    })
  }

  @Post('/logout')
  @IsPublic()
  @ZodSerializerDto(MessageResDTO)
  logout(@Body() body: LogoutBodyType) {
    return this.guestService.logout(body.refreshToken)
  }

  @Post('refresh-token')
  @IsPublic()
  @ZodSerializerDto(RefreshTokenResDTO)
  refreshToken(@Body() body: RefreshTokenBodyDTO) {
    return this.guestService.refreshToken(body.refreshToken)
  }
}
