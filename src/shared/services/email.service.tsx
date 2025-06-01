import envConfig from '@/config/env.config'
import { Injectable } from '@nestjs/common'
import CreateAccountEmail from 'emails/create-account'
import { OTPEmail } from 'emails/otp'
import React from 'react'
import { Resend } from 'resend'

@Injectable()
export class EmailService {
  private resend: Resend
  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY)
  }
  async sendOTP(payload: { email: string; code: string }) {
    const subject = 'Mã OTP'
    return this.resend.emails.send({
      from: 'Scanorderly <no-reply@scanorderly.com>',
      to: [payload.email],
      subject,
      react: <OTPEmail otpCode={payload.code} title={subject} />
    })
  }

  async sendCreateAccountEmail(payload: {
    email: string;
    password: string;
    userName?: string
  }) {
    const subject = 'Tài khoản mới được tạo - Scanorderly'
    return this.resend.emails.send({
      from: 'Scanorderly <no-reply@scanorderly.com>',
      to: [payload.email],
      subject,
      react: (
        <CreateAccountEmail
          email={payload.email}
          password={payload.password}
          title={subject}
        />
      )
    })
  }
}
