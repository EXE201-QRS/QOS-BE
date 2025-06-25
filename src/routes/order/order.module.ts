import { WebsocketsModule } from '@/websockets/websockets.module'
import { Module } from '@nestjs/common'
import { DishSnapshotModule } from '../dish-snapshot/dish-snapshot.module'
import { GuestRepo } from '../guest/guest.repo'
import { TableRepo } from '../table/table.repo'
import { OrderController } from './order.controller'
import { OrderRepo } from './order.repo'
import { OrderService } from './order.service'

@Module({
  imports: [DishSnapshotModule, WebsocketsModule],
  controllers: [OrderController],
  providers: [OrderService, OrderRepo, GuestRepo, TableRepo],
  exports: [OrderService, OrderRepo]
})
export class OrderModule {}
