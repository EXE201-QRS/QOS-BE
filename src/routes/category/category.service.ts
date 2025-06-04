import { CATEGORY_MESSAGE } from '@/common/constants/message'
import { NotFoundRecordException } from '@/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from '@/shared/helpers'
import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'
import { CategoryAlreadyExistsException } from './category.error'
import { CreateCategoryBodyType, UpdateCategoryBodyType } from './category.model'
import { CategoryRepo } from './category.repo'

@Injectable()
export class CategoryService {
  constructor(private categoryRepo: CategoryRepo) {}

  async list(pagination: PaginationQueryType) {
    const data = await this.categoryRepo.list(pagination)
    return data
  }

  async findById(id: number) {
    const category = await this.categoryRepo.findById(id)
    if (!category) {
      throw NotFoundRecordException
    }
    return category
  }

  async create({
    data,
    createdById
  }: {
    data: CreateCategoryBodyType
    createdById: number
  }) {
    try {
      const result = await this.categoryRepo.create({
        createdById,
        data
      })
      return {
        data: result,
        message: CATEGORY_MESSAGE.CREATED_SUCCESS
      }
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw CategoryAlreadyExistsException
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
    data: UpdateCategoryBodyType
    updatedById: number
  }) {
    try {
      const category = await this.categoryRepo.update({
        id,
        updatedById,
        data
      })
      return {
        data: category,
        message: CATEGORY_MESSAGE.UPDATED_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw CategoryAlreadyExistsException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.categoryRepo.delete({
        id,
        deletedById
      })
      return {
        message: CATEGORY_MESSAGE.DELETED_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
