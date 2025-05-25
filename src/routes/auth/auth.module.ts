import { AuthRepository } from '@/routes/auth/auth.repo'
import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthRepository]
})
export class AuthModule {}
