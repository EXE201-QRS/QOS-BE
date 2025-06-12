import { DishStatus } from '@/common/constants/dish.constant'
import { ORDER_MESSAGE } from '@/common/constants/message'
import { RoleName } from '@/common/constants/role.constant'
import { TableStatus } from '@/common/constants/table.constant'
import { NotFoundRecordException } from '@/shared/error'
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueConstraintPrismaError
} from '@/shared/helpers'
import { PaginationQueryType } from '@/shared/models/request.model'
import { ChefGateway } from '@/websockets/chef.gateway'
import { GuestGateway } from '@/websockets/guest.gateway'
import { StaffGateway } from '@/websockets/staff.gateway'
import { Injectable } from '@nestjs/common'
import { OrderStatus } from '@prisma/client'
import { DishSnapshotService } from '../dish-snapshot/dish-snapshot.service'
import { GuestRepo } from '../guest/guest.repo'
import { TableRepo } from '../table/table.repo'
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
    private readonly tableRepo: TableRepo,
    private readonly guestRepo: GuestRepo,
    private readonly dishSnapshotService: DishSnapshotService,
    private readonly guestSocket: GuestGateway,
    private readonly staffSocket: StaffGateway,
    private readonly chefSocket: ChefGateway
  ) {}

  async create({ data }: { data: CreateOrderBodyType }) {
    try {
      const [existTable, existGuest] = await Promise.all([
        this.tableRepo.findByNumber(data.tableNumber),
        this.guestRepo.findById(data.guestId)
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

      if (existTable.status !== TableStatus.OCCUPIED) {
        await this.tableRepo.updateStatus({
          id: existTable.id,
          data: {
            status: TableStatus.OCCUPIED
          }
        })
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
              ? OrderStatus.PENDING
              : OrderStatus.CANCELLED
        })
      }
      //create Many orders:
      const result = await this.orderRepo.createMany({
        createdById: data.guestId,
        data: orderListData
      })

      // call socket send order qua chef
      const orderIds = result.map((order) => order.id)
      this.sendOrderToChef(orderIds)

      return {
        data: result,
        message: ORDER_MESSAGE.CREATED_SUCCESS
      }
    } catch (error) {
      // Hanlde not found
      if (isForeignKeyConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
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
    updatedById,
    roleName
  }: {
    id: number
    data: UpdateOrderBodyType
    updatedById: number
    roleName: string
  }) {
    try {
      const order = await this.orderRepo.update({
        id,
        updatedById,
        data
      })
      if (roleName === RoleName.Chef) {
        this.sendOrderToStaffGuestByChef(order.id, order.tableNumber)
      } else if (roleName === RoleName.Staff) {
        this.sendOrderToGuestByStaff(order.tableNumber)
      }
      return {
        data: order,
        message: ORDER_MESSAGE.UPDATED_SUCCESS
      }
    } catch (error) {
      // Handle not found pn (id)
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      // Hanlde not found
      if (isForeignKeyConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw OrderAlreadyExistsException
      }
      throw error
    }
  }

  async updateStatus({
    id,
    status,
    updatedById,
    roleName
  }: {
    id: number
    status: string
    updatedById: number
    roleName: string
  }) {
    try {
      const order = await this.orderRepo.updateStatus({
        id,
        status,
        updatedById
      })
      if (roleName === RoleName.Chef) {
        this.sendOrderToStaffGuestByChef(order.id, order.tableNumber)
      } else if (roleName === RoleName.Staff) {
        this.sendOrderToGuestByStaff(order.tableNumber)
      }
      return {
        data: order,
        message: ORDER_MESSAGE.UPDATED_SUCCESS
      }
    } catch (error) {
      // Handle not found pn (id)
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async list(pagination: PaginationQueryType) {
    const data = await this.orderRepo.list(pagination)
    return data
  }

  async chefList(pagination: PaginationQueryType) {
    const data = await this.orderRepo.chefList(pagination)
    return {
      ...data,
      message: ORDER_MESSAGE.GET_SUCCESS
    }
  }

  async getListByTableNumber(tableNumber: number) {
    const orderList = await this.orderRepo.findByTableNumber(tableNumber)

    const result = orderList.map((order) => {
      const { dishSnapshot, ...rest } = order
      return {
        id: rest.id,
        guestId: rest.guestId,
        tableNumber: rest.tableNumber,
        dishSnapshotId: rest.dishSnapshotId,
        quantity: rest.quantity,
        description: rest.description,
        status: rest.status,
        dish: {
          id: dishSnapshot.dish.id,
          name: dishSnapshot.dish.name,
          price: dishSnapshot.dish.price,
          image: dishSnapshot.dish.image,
          categoryId: dishSnapshot.dish.categoryId,
          description: dishSnapshot.dish.description,
          category: {
            id: dishSnapshot.dish.category.id,
            name: dishSnapshot.dish.category.name
          }
        }
      }
    })

    return {
      data: result,
      message: ORDER_MESSAGE.GET_SUCCESS
    }
  }

  async findById(id: number) {
    const order = await this.orderRepo.findByIdWithFullData(id)
    if (!order) {
      throw NotFoundRecordException
    }
    return {
      data: order,
      message: ORDER_MESSAGE.GET_SUCCESS
    }
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

  async sendOrderToChef(orderIdList: number[]) {
    const orderListDataToChef =
      await this.orderRepo.findWithGuestDishSnapshot(orderIdList)
    this.guestSocket.sendOrderToChef(orderListDataToChef)
  }

  async sendOrderToStaffGuestByChef(orderId: number, tableNumber) {
    const orderInfo = await this.orderRepo.findByIdWithFullData(orderId)
    this.chefSocket.handleUpdateOrder({
      order: orderInfo,
      tableNumber
    })
  }
  sendOrderToGuestByStaff(tableNumber: number) {
    this.staffSocket.sendOrderToGuest(tableNumber)
  }
}
