import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { IsPublic } from '@/common/decorators/auth.decorator'
import { UserAgent } from '@/common/decorators/user-agent.decorator'
import {
  AccountResDTO,
  ForgotPasswordBodyDTO,
  LoginBodyDTO,
  LoginResDTO,
  LogoutBodyDTO,
  RefreshTokenBodyDTO,
  RefreshTokenResDTO,
  SendOTPBodyDTO,
  UpdateMeBodyDTO
} from '@/routes/auth/auth.dto'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { GetAccountProfileResDTO } from '@/shared/dtos/shared-user.dto'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Put
} from '@nestjs/common'
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

  @Post('login')
  @IsPublic()
  @ZodSerializerDto(LoginResDTO)
  login(@Body() body: LoginBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
    return this.authService.login({
      ...body,
      userAgent,
      ip
    })
  }

  @Post('refresh-token')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(RefreshTokenResDTO)
  refreshToken(
    @Body() body: RefreshTokenBodyDTO,
    @UserAgent() userAgent: string,
    @Ip() ip: string
  ) {
    return this.authService.refreshToken({
      refreshToken: body.refreshToken,
      userAgent,
      ip
    })
  }

  @Post('logout')
  @ZodSerializerDto(MessageResDTO)
  logout(@Body() body: LogoutBodyDTO) {
    return this.authService.logout(body.refreshToken)
  }

  @Post('forgot-password')
  @IsPublic()
  @ZodSerializerDto(MessageResDTO)
  forgotPassword(@Body() body: ForgotPasswordBodyDTO) {
    return this.authService.forgotPassword(body)
  }

  @Get('me')
  @ZodSerializerDto(GetAccountProfileResDTO)
  me(@ActiveUser('userId') userId: number) {
    return this.authService.getMe(userId)
  }

  @Put('me')
  @ZodSerializerDto(AccountResDTO)
  updateMe(@Body() body: UpdateMeBodyDTO, @ActiveUser('userId') userId: number) {
    return this.authService.updateMe({
      userId,
      data: body
    })
  }
}
