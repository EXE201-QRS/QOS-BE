import { DISH_MESSAGE } from '@/common/constants/message'
import { NotFoundRecordException } from '@/shared/error'
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError
} from '@/shared/helpers'
import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'
import { CategoryNotExistsException, DishAlreadyExistsException } from './dish.error'
import { CreateDishBodyType, UpdateDishBodyType } from './dish.model'
import { DishRepo } from './dish.repo'

@Injectable()
export class DishService {
  constructor(private dishRepo: DishRepo) {}

  async create({ data, createdById }: { data: CreateDishBodyType; createdById: number }) {
    try {
      const result = await this.dishRepo.create({
        createdById,
        data
      })
      return {
        data: result,
        message: 'Tạo món ăn thành công'
      }
    } catch (error) {
      // Hanlde not found fn (categoryIdcategoryId)
      if (isForeignKeyConstraintPrismaError(error)) {
        throw CategoryNotExistsException
      }
      // Handle unique constraint error (name)
      if (isUniqueConstraintPrismaError(error)) {
        throw DishAlreadyExistsException
      }
      throw error
    }
  }

  async update({
    id,
    data,
    updatedById
  }: {
    id: number
    data: UpdateDishBodyType
    updatedById: number
  }) {
    try {
      const dish = await this.dishRepo.update({
        id,
        updatedById,
        data
      })
      return {
        data: dish,
        message: 'Cập nhật món ăn thành công'
      }
    } catch (error) {
      // Handle not found pn (id)
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      // Hanlde not found fn (categoryIdcategoryId)
      if (isForeignKeyConstraintPrismaError(error)) {
        throw CategoryNotExistsException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw DishAlreadyExistsException
      }
      throw error
    }
  }

  async list(pagination: PaginationQueryType) {
    const data = await this.dishRepo.list(pagination)
    return data
  }

  async findById(id: number) {
    const dish = await this.dishRepo.findWithCategoryById(id)
    if (!dish) {
      throw NotFoundRecordException
    }
    return dish
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.dishRepo.delete({
        id,
        deletedById
      })
      return {
        message: DISH_MESSAGE.DELETED_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
