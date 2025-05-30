import { TABLE_MESSAGE } from '@/common/constants/message'
import { NotFoundRecordException } from '@/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from '@/shared/helpers'
import { Injectable } from '@nestjs/common'
import { TableAlreadyExistsException, TokenAlreadyExistsException } from './table.error'
import {
  CreateTableBodyType,
  GetTablesQueryType,
  UpdateTableBodyType
} from './table.model'
import { TableRepo } from './table.repo'

@Injectable()
export class TableService {
  constructor(private tableRepo: TableRepo) {}

  async create({
    data,
    createdById
  }: {
    data: CreateTableBodyType
    createdById: number
  }) {
    try {
      // Check if the table with the same name already exists
      const existingTable = await this.tableRepo.findByNumber(data.number)
      if (existingTable) {
        throw TableAlreadyExistsException
      }
      return await this.tableRepo.create({
        createdById,
        data
      })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw TokenAlreadyExistsException
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
    data: UpdateTableBodyType
    updatedById: number
  }) {
    try {
      // Check if the table with the same number already exists, excluding the current table
      const existingTable = await this.tableRepo.findByNumberExcludeSelf(data.number, id)
      if (existingTable) {
        throw TableAlreadyExistsException
      }
      const table = await this.tableRepo.update({
        id,
        updatedById,
        data
      })
      return table
    } catch (error) {
      // Handle not found pn (id)
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      // Handle unique constraint error
      if (isUniqueConstraintPrismaError(error)) {
        throw TokenAlreadyExistsException
      }
      throw error
    }
  }

  async list(pagination: GetTablesQueryType) {
    const data = await this.tableRepo.list(pagination)
    return data
  }

  async findById(id: number) {
    const table = await this.tableRepo.findById(id)
    if (!table) {
      throw NotFoundRecordException
    }
    return table
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.tableRepo.delete({
        id,
        deletedById
      })
      return {
        message: TABLE_MESSAGE.DELETED_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
