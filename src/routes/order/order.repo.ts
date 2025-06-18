import { OrderStatus } from '@/common/constants/order.constant'
import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'
import {
  CreateOrderItemType,
  GetOrderesResType,
  OrderDetaiWithFullDataType,
  OrderType,
  UpdateOrderBodyType
} from 'src/routes/order/order.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class OrderRepo {
  constructor(private prismaService: PrismaService) {}

  createMany({
    createdById,
    data
  }: {
    createdById: number
    data: CreateOrderItemType[]
  }) {
    // $transaction: neu co bug thi se rollback tat ca cac transaction
    return this.prismaService.$transaction(
      data.map((order) =>
        this.prismaService.order.create({
          data: {
            ...order,
            createdById
          }
        })
      )
    )
  }

  update({
    id,
    updatedById,
    data
  }: {
    id: number
    updatedById: number
    data: UpdateOrderBodyType
  }): Promise<OrderType> {
    return this.prismaService.order.update({
      where: {
        id,
        deletedAt: null
      },
      data: {
        ...data,
        updatedById
      }
    })
  }

  updateStatus({
    id,
    status,
    updatedById
  }: {
    id: number
    status: string
    updatedById: number
  }): Promise<OrderType> {
    return this.prismaService.order.update({
      where: {
        id,
        deletedAt: null
      },
      data: {
        status: status as any,
        updatedById
      }
    })
  }

  delete(
    {
      id,
      deletedById
    }: {
      id: number
      deletedById: number
    },
    isHard?: boolean
  ): Promise<OrderType> {
    return isHard
      ? this.prismaService.order.delete({
          where: {
            id
          }
        })
      : this.prismaService.order.update({
          where: {
            id,
            deletedAt: null
          },
          data: {
            deletedAt: new Date(),
            deletedById
          }
        })
  }

  async list(pagination: PaginationQueryType): Promise<GetOrderesResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.order.count({
        where: {
          deletedAt: null
        }
      }),
      this.prismaService.order.findMany({
        where: {
          deletedAt: null
        },
        skip,
        take
      })
    ])
    return {
      data,
      totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit)
    }
  }

  async chefList(pagination: PaginationQueryType): Promise<any> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit

    // Filter orders for chef - exclude DELIVERED, COMPLETED, CANCELLED
    const chefRelevantStatuses = [
      'PENDING' as const,
      'CONFIRMED' as const,
      'SHIPPED' as const
    ]

    const [totalItems, data] = await Promise.all([
      this.prismaService.order.count({
        where: {
          deletedAt: null,
          status: {
            in: chefRelevantStatuses
          }
        }
      }),
      this.prismaService.order.findMany({
        where: {
          deletedAt: null,
          status: {
            in: chefRelevantStatuses
          }
        },
        include: {
          guest: {
            select: {
              id: true,
              name: true,
              tableNumber: true
            }
          },
          dishSnapshot: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true
            }
          }
        },
        orderBy: [
          {
            status: 'asc' // PENDING first, then CONFIRMED, then SHIPPED
          },
          {
            createdAt: 'asc' // Oldest first within same status
          }
        ],
        skip,
        take
      })
    ])

    return {
      data,
      totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit)
    }
  }

  findById(id: number): Promise<OrderType | null> {
    return this.prismaService.order.findUnique({
      where: {
        id,
        deletedAt: null
      }
    })
  }

  findByIdWithFullData(id: number): Promise<OrderType | null> {
    return this.prismaService.order.findUnique({
      where: {
        id,
        deletedAt: null
      },
      include: {
        guest: {
          select: {
            id: true,
            name: true,
            tableNumber: true
          }
        },
        dishSnapshot: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true
          }
        }
      }
    })
  }

  findByTableNumber(tableNumber: number): Promise<any[]> {
    return this.prismaService.order.findMany({
      where: {
        tableNumber,
        deletedAt: null,
        status: {
          not: OrderStatus.COMPLETED
        }
      },
      include: {
        dishSnapshot: {
          include: {
            dish: {
              include: {
                category: true
              }
            }
          }
        }
      }
    })
  }

  async staffDeliveryList(pagination: PaginationQueryType): Promise<any> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit

    // Filter orders for staff delivery - only SHIPPED orders
    const [totalItems, data] = await Promise.all([
      this.prismaService.order.count({
        where: {
          deletedAt: null,
          status: 'SHIPPED'
        }
      }),
      this.prismaService.order.findMany({
        where: {
          deletedAt: null,
          status: 'SHIPPED'
        },
        include: {
          guest: {
            select: {
              id: true,
              name: true,
              tableNumber: true
            }
          },
          dishSnapshot: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true,
              description: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc' // Oldest first for delivery priority
        },
        skip,
        take
      })
    ])

    return {
      data,
      totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit)
    }
  }

  findWithGuestDishSnapshot(
    orderIdList: number[]
  ): Promise<OrderDetaiWithFullDataType[]> {
    const fullOrders = this.prismaService.order.findMany({
      where: {
        id: { in: orderIdList }
      },
      include: {
        guest: true,
        dishSnapshot: true
      }
    })

    return fullOrders
  }
}
