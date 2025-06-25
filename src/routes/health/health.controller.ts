import { IsPublic } from '@/common/decorators/auth.decorator'
import { APIKeyGuard } from '@/common/guards/api-key.guard'
import { Controller, Get, UseGuards } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { GGetHealthResDTO } from './health.dto'
import { HealthService } from './health.service'

@Controller('health')
@UseGuards(APIKeyGuard)
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('/info')
  @IsPublic()
  @ZodSerializerDto(GGetHealthResDTO)
  getInfoHealth() {
    return this.healthService.getInfoHealth()
  }
}
