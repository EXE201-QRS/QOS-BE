import { DishStatus } from '@/common/constants/dish.constant'
import { ORDER_MESSAGE } from '@/common/constants/message'
import { TableStatus } from '@/common/constants/table.constant'
import { NotFoundRecordException } from '@/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from '@/shared/helpers'
import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'
import { OrderStatus } from '@prisma/client'
import { DishSnapshotService } from '../dish-snapshot/dish-snapshot.service'
import { GuestService } from '../guest/guest.service'
import { TableService } from '../table/table.service'
import {
  GuestNotExistsException,
  OrderAlreadyExistsException,
  TableNotReadyException
} from './order.error'
import {
  CreateOrderBodyType,
  CreateOrderItemType,
  UpdateOrderBodyType
} from './order.model'
import { OrderRepo } from './order.repo'

@Injectable()
export class OrderService {
  constructor(
    private orderRepo: OrderRepo,
    private readonly tableService: TableService,
    private readonly guestService: GuestService,
    private readonly dishSnapshotService: DishSnapshotService
  ) {}

  async create({
    data,
    createdById
  }: {
    data: CreateOrderBodyType
    createdById: number
  }) {
    try {
      const [existTable, existGuest] = await Promise.all([
        this.tableService.findByNumber(data.tableNumber),
        this.guestService.findById(data.guestId)
      ])
      // check table co khong, status hop le khong
      if (
        !existTable ||
        existTable.status === TableStatus.CLEANING ||
        existTable.status === TableStatus.UNAVAILABLE
      ) {
        throw TableNotReadyException
      }
      // check guest co khong
      if (!existGuest) {
        throw GuestNotExistsException
      }

      // tao dishsnapshots xong push orderListData
      const orderListData = [] as CreateOrderItemType[]
      for (const item of data.orderItems) {
        const dishSnapshot = await this.dishSnapshotService.create({
          dishId: item.dishId
        })
        orderListData.push({
          guestId: data.guestId,
          tableNumber: data.tableNumber,
          dishSnapshotId: dishSnapshot.id,
          quantity: item.quantity,
          description: item.description,
          status:
            dishSnapshot.status === DishStatus.ACTIVE
              ? OrderStatus.CONFIRMED
              : OrderStatus.CANCELLED
        })
      }

      //create Many orders:
      const result = await this.orderRepo.createMany({ createdById, data: orderListData })

      return {
        data: result,
        message: ORDER_MESSAGE.CREATED_SUCCESS
      }
    } catch (error) {
      console.error('Create Order Error:', error)
      // Hanlde not found fn (categoryIdcategoryId)
      // if (isForeignKeyConstraintPrismaError(error)) {
      //   throw CategoryNotExistsException
      // }
      // Handle unique constraint error (name)
      if (isUniqueConstraintPrismaError(error)) {
        throw OrderAlreadyExistsException
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
    data: UpdateOrderBodyType
    updatedById: number
  }) {
    try {
      const order = await this.orderRepo.update({
        id,
        updatedById,
        data
      })
      return {
        data: order,
        message: ORDER_MESSAGE.UPDATED_SUCCESS
      }
    } catch (error) {
      // Handle not found pn (id)
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      // Hanlde not found fn (categoryIdcategoryId)
      // if (isForeignKeyConstraintPrismaError(error)) {
      //   throw CategoryNotExistsException
      // }
      if (isUniqueConstraintPrismaError(error)) {
        throw OrderAlreadyExistsException
      }
      throw error
    }
  }

  async list(pagination: PaginationQueryType) {
    const data = await this.orderRepo.list(pagination)
    return data
  }

  async findById(id: number) {
    const order = await this.orderRepo.findById(id)
    if (!order) {
      throw NotFoundRecordException
    }
    return order
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.orderRepo.delete({
        id,
        deletedById
      })
      return {
        message: ORDER_MESSAGE.DELETED_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
