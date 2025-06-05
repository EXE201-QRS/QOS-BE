import { Module } from '@nestjs/common'
import { DishModule } from '../dish/dish.module'
import { DishSnapshotController } from './dish-snapshot.controller'
import { DishSnapshotRepo } from './dish-snapshot.repo'
import { DishSnapshotService } from './dish-snapshot.service'

@Module({
  imports: [DishModule],
  controllers: [DishSnapshotController],
  providers: [DishSnapshotService, DishSnapshotRepo],
  exports: [DishSnapshotService]
})
export class DishSnapshotModule {}
