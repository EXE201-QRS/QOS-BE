import { Module } from '@nestjs/common'
import { DishController } from './dish.controller'
import { DishRepo } from './dish.repo'
import { DishService } from './dish.service'

@Module({
  controllers: [DishController],
  providers: [DishService, DishRepo],
  exports: [DishService]
})
export class DishModule {}
