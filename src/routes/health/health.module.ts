import { Module } from '@nestjs/common'
import { OrderModule } from '../order/order.module'
import { TableModule } from '../table/table.module'
import { HealthController } from './health.controller'
import { HealthRepo } from './health.repo'
import { HealthService } from './health.service'

@Module({
  imports: [TableModule, OrderModule],
  controllers: [HealthController],
  providers: [HealthService, HealthRepo]
})
export class HealthModule {}
