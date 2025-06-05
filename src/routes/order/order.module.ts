import { Module } from '@nestjs/common'
import { DishSnapshotModule } from '../dish-snapshot/dish-snapshot.module'
import { GuestModule } from '../guest/guest.module'
import { TableModule } from '../table/table.module'
import { OrderController } from './order.controller'
import { OrderRepo } from './order.repo'
import { OrderService } from './order.service'

@Module({
  imports: [TableModule, GuestModule, DishSnapshotModule],
  controllers: [OrderController],
  providers: [OrderService, OrderRepo]
})
export class OrderModule {}
