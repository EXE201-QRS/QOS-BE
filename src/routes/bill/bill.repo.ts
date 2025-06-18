import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'
import { Bill, BillStatus, Payment, Prisma } from '@prisma/client'

@Injectable()
export class BillRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Bill CRUD operations
  async createBill(data: Prisma.BillCreateInput): Promise<Bill> {
    return this.prisma.bill.create({
      data,
      include: {
        orders: {
          include: {
            dishSnapshot: true
          }
        },
        payments: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  }

  async findBillById(id: number): Promise<any> {
    return this.prisma.bill.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: {
        orders: {
          include: {
            dishSnapshot: true
          }
        },
        payments: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  }

  async findBillByNumber(billNumber: string): Promise<Bill | null> {
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
        payments: true
      }
    })
  }

  async findBillsByTableNumber(tableNumber: number): Promise<Bill[]> {
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
        payments: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async findBillsWithFilters(filters: {
    page?: number
    limit?: number
    status?: BillStatus
    tableNumber?: number
    fromDate?: Date
    toDate?: Date
    search?: string
  }) {
    const {
      page = 1,
      limit = 10,
      status,
      tableNumber,
      fromDate,
      toDate,
      search
    } = filters
    const skip = (page - 1) * limit

    const where: Prisma.BillWhereInput = {
      deletedAt: null,
      ...(status && { status }),
      ...(tableNumber && { tableNumber }),
      ...(fromDate &&
        toDate && {
          createdAt: {
            gte: fromDate,
            lte: toDate
          }
        }),
      ...(search && {
        billNumber: {
          contains: search,
          mode: 'insensitive'
        }
      })
    }

    const [bills, total] = await Promise.all([
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
          payments: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
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
      data: bills,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  async updateBill(id: number, data: Prisma.BillUpdateInput): Promise<Bill> {
    return this.prisma.bill.update({
      where: { id },
      data,
      include: {
        orders: {
          include: {
            dishSnapshot: true
          }
        },
        payments: true
      }
    })
  }

  async deleteBill(id: number, deletedById: number): Promise<Bill> {
    return this.prisma.bill.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: { connect: { id: deletedById } }
      }
    })
  }

  // Payment CRUD operations
  async createPayment(data: Prisma.PaymentCreateInput): Promise<Payment> {
    return this.prisma.payment.create({
      data,
      include: {
        bill: {
          select: {
            id: true,
            billNumber: true,
            tableNumber: true,
            totalAmount: true,
            status: true
          }
        },
        processedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  }

  async findPaymentById(id: number): Promise<Payment | null> {
    return this.prisma.payment.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: {
        bill: {
          select: {
            id: true,
            billNumber: true,
            tableNumber: true,
            totalAmount: true,
            status: true
          }
        },
        processedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  }

  async findPaymentByPayOSOrderId(payosOrderId: string): Promise<Payment | null> {
    return this.prisma.payment.findFirst({
      where: {
        payosOrderId,
        deletedAt: null
      },
      include: {
        bill: {
          select: {
            id: true,
            billNumber: true,
            tableNumber: true,
            totalAmount: true,
            status: true
          }
        }
      }
    })
  }

  async findPaymentsByBillId(billId: number): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      where: {
        billId,
        deletedAt: null
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async updatePayment(id: number, data: Prisma.PaymentUpdateInput): Promise<Payment> {
    return this.prisma.payment.update({
      where: { id },
      data,
      include: {
        bill: true,
        processedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  }

  // Special queries for bill creation
  async findOccupiedTablesWithDeliveredOrders() {
    const tables = await this.prisma.$queryRaw`
      SELECT DISTINCT 
        o."tableNumber",
        COUNT(CASE WHEN o.status = 'DELIVERED' THEN 1 END) as "deliveredOrdersCount",
        SUM(CASE WHEN o.status = 'DELIVERED' THEN ds.price * o.quantity ELSE 0 END) as "totalAmount"
      FROM "Order" o
      INNER JOIN "DishSnapshot" ds ON o."dishSnapshotId" = ds.id
      INNER JOIN "Table" t ON o."tableNumber" = t.number
      WHERE o."deletedAt" IS NULL 
        AND o."billId" IS NULL
        AND t.status = 'OCCUPIED'
        AND o.status = 'DELIVERED'
      GROUP BY o."tableNumber"
      HAVING COUNT(CASE WHEN o.status = 'DELIVERED' THEN 1 END) > 0
      ORDER BY o."tableNumber"
    `

    return tables
  }

  async findDeliveredOrdersByTableNumber(tableNumber: number) {
    return this.prisma.order.findMany({
      where: {
        tableNumber,
        status: 'DELIVERED',
        billId: null,
        deletedAt: null
      },
      include: {
        dishSnapshot: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
  }

  // Transaction operations
  async createBillWithOrders(billData: Prisma.BillCreateInput, orderIds: number[]) {
    return this.prisma.$transaction(async (tx) => {
      // Create the bill
      const bill = await tx.bill.create({
        data: billData,
        include: {
          orders: {
            include: {
              dishSnapshot: true
            }
          }
        }
      })

      // Update orders to link them to the bill
      await tx.order.updateMany({
        where: {
          id: {
            in: orderIds
          }
        },
        data: {
          billId: bill.id
        }
      })

      return bill
    })
  }

  async completeBillPayment(billId: number, paymentId: number, tableNumber: number) {
    return this.prisma.$transaction(async (tx) => {
      // Update payment status to PAID
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'PAID',
          paidAt: new Date()
        }
      })

      // Update bill status to PAID
      await tx.bill.update({
        where: { id: billId },
        data: {
          status: 'PAID'
        }
      })

      // Update all orders in the bill to COMPLETED
      await tx.order.updateMany({
        where: {
          billId: billId
        },
        data: {
          status: 'COMPLETED'
        }
      })

      // Update table status to CLEANING
      await tx.table.updateMany({
        where: {
          number: tableNumber
        },
        data: {
          status: 'CLEANING'
        }
      })

      return true
    })
  }
}
