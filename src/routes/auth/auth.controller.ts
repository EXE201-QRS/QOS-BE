import { IsPublic } from '@/common/decorators/auth.decorator'
import { SendOTPBodyDTO } from '@/routes/auth/auth.dto'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { Body, Controller, Post } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp')
  @IsPublic()
  @ZodSerializerDto(MessageResDTO)
  sendOTP(@Body() body: SendOTPBodyDTO) {
    return this.authService.sendOTP(body)
  }

  // @Post('login')
  // @IsPublic()
  // @ZodSerializerDto(LoginResDTO)
  // login(@Body() body: LoginBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
  //   return this.authService.login({
  //     ...body,
  //     userAgent,
  //     ip
  //   })
  // }

  // @Post('refresh-token')
  // @IsPublic()
  // @HttpCode(HttpStatus.OK)
  // @ZodSerializerDto(RefreshTokenResDTO)
  // refreshToken(
  //   @Body() body: RefreshTokenBodyDTO,
  //   @UserAgent() userAgent: string,
  //   @Ip() ip: string
  // ) {
  //   return this.authService.refreshToken({
  //     refreshToken: body.refreshToken,
  //     userAgent,
  //     ip
  //   })
  // }

  // @Post('logout')
  // @ZodSerializerDto(MessageResDTO)
  // logout(@Body() body: LogoutBodyDTO) {
  //   return this.authService.logout(body.refreshToken)
  // }
}
