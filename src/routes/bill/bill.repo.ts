import { PaymentStatus } from '@/common/constants/payment.constant'
import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { CreateBillType, UpdateBillType } from './bill.model'

@Injectable()
export class BillRepo {
  constructor(private readonly prisma: PrismaService) {}

  async create({ data }: { data: CreateBillType }) {
    return this.prisma.bill.create({
      data,
      include: {
        orders: {
          include: {
            dishSnapshot: true
          }
        },
        guest: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    })
  }

  async findById(id: number) {
    return this.prisma.bill.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: {
        orders: {
          include: {
            dishSnapshot: true,
            guest: true
          }
        },
        guest: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    })
  }

  async findByBillNumber(billNumber: string) {
    return this.prisma.bill.findFirst({
      where: {
        billNumber,
        deletedAt: null
      },
      include: {
        orders: {
          include: {
            dishSnapshot: true
          }
        },
        guest: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    })
  }

  async findByTableNumber(tableNumber: number) {
    return this.prisma.bill.findMany({
      where: {
        tableNumber,
        deletedAt: null
      },
      include: {
        orders: {
          include: {
            dishSnapshot: true
          }
        },
        guest: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async list({
    page,
    limit,
    tableNumber,
    paymentStatus,
    startDate,
    endDate
  }: {
    page: number
    limit: number
    tableNumber?: number
    paymentStatus?: PaymentStatus
    startDate?: string
    endDate?: string
  }) {
    const skip = (page - 1) * limit

    const where: Prisma.BillWhereInput = {
      deletedAt: null,
      ...(tableNumber && { tableNumber }),
      ...(paymentStatus && { paymentStatus }),
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        })
    }

    const [data, total] = await Promise.all([
      this.prisma.bill.findMany({
        where,
        skip,
        take: limit,
        include: {
          orders: {
            include: {
              dishSnapshot: true
            }
          },
          guest: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.prisma.bill.count({ where })
    ])

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async update({ id, data }: { id: number; data: UpdateBillType }) {
    return this.prisma.bill.update({
      where: { id },
      data,
      include: {
        orders: {
          include: {
            dishSnapshot: true
          }
        },
        guest: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    })
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    return this.prisma.bill.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById
      }
    })
  }

  async linkOrdersToBill({ billId, orderIds }: { billId: number; orderIds: number[] }) {
    return this.prisma.order.updateMany({
      where: {
        id: { in: orderIds }
      },
      data: {
        billId
      }
    })
  }

  async getBillableOrdersByTable(tableNumber: number) {
    return this.prisma.order.findMany({
      where: {
        tableNumber,
        status: 'DELIVERED',
        billId: null, // Chưa có trong bill nào
        deletedAt: null
      },
      include: {
        dishSnapshot: true,
        guest: true
      }
    })
  }

  async getLastBillNumber() {
    const lastBill = await this.prisma.bill.findFirst({
      select: { billNumber: true },
      orderBy: { createdAt: 'desc' }
    })
    return lastBill?.billNumber
  }

  async updatePaymentStatus({
    id,
    paymentStatus,
    paymentId,
    paidAt
  }: {
    id: number
    paymentStatus: PaymentStatus
    paymentId?: string
    paidAt?: Date
  }) {
    return this.prisma.bill.update({
      where: { id },
      data: {
        paymentStatus,
        ...(paymentId && { paymentId }),
        ...(paidAt && { paidAt })
      }
    })
  }
}
