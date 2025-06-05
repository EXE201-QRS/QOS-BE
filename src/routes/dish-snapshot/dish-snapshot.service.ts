import { DishStatus } from '@/common/constants/dish.constant'
import { NotFoundRecordException } from '@/shared/error'
import {
  isForeignKeyConstraintPrismaError,
  isUniqueConstraintPrismaError
} from '@/shared/helpers'
import { Injectable } from '@nestjs/common'
import { DishService } from '../dish/dish.service'
import {
  CategoryNotExistsException,
  DishSnapshotAlreadyExistsException
} from './dish-snapshot.error'
import { GetDishSnapshotesQueryType } from './dish-snapshot.model'
import { DishSnapshotRepo } from './dish-snapshot.repo'

@Injectable()
export class DishSnapshotService {
  constructor(
    private dishSnapshotRepo: DishSnapshotRepo,
    private readonly dishService: DishService
  ) {}

  async create({ dishId }: { dishId: number }) {
    try {
      //get data from dish service
      const dish = await this.dishService.findById(dishId)

      const snapshotData = {
        dishId: dish.id,
        name: dish.name,
        price: dish.price,
        description: dish.description,
        image: dish.image,
        status:
          dish.status === DishStatus.ACTIVE ? DishStatus.ACTIVE : DishStatus.INACTIVE
      }
      // create dish snapshot
      return await this.dishSnapshotRepo.create({
        data: snapshotData
      })
    } catch (error) {
      // Hanlde not found fn (categoryIdcategoryId)
      if (isForeignKeyConstraintPrismaError(error)) {
        throw CategoryNotExistsException
      }
      // Handle unique constraint error (name)
      if (isUniqueConstraintPrismaError(error)) {
        throw DishSnapshotAlreadyExistsException
      }
      throw error
    }
  }

  async list(pagination: GetDishSnapshotesQueryType) {
    const data = await this.dishSnapshotRepo.list(pagination)
    return data
  }

  async findById(id: number) {
    const dishSnapshot = await this.dishSnapshotRepo.findById(id)
    if (!dishSnapshot) {
      throw NotFoundRecordException
    }
    return dishSnapshot
  }

  async createMany(dishIds: number[]) {
    const dishSnapshots = await Promise.all(
      dishIds.map(async (dishId) => {
        return this.create({ dishId })
      })
    )
    return dishSnapshots
  }
}
