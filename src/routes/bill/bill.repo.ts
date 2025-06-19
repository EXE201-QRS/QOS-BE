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

  async findBillsWithSimpleFilters(
    whereConditions: Prisma.BillWhereInput
  ): Promise<Bill[]> {
    return this.prisma.bill.findMany({
      where: whereConditions,
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
    })
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

  // Bill Analytics Methods
  async getBillAnalytics(params: {
    period: 'day' | 'week' | 'month'
    startDate?: Date
    endDate?: Date
  }) {
    const { period, startDate, endDate } = params

    // Default date range - last 30 days for day, 12 weeks for week, 12 months for month
    let defaultStartDate: Date
    const defaultEndDate = new Date()

    switch (period) {
      case 'day':
        defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        break
      case 'week':
        defaultStartDate = new Date(Date.now() - 84 * 24 * 60 * 60 * 1000) // 12 weeks ago
        break
      case 'month':
        defaultStartDate = new Date()
        defaultStartDate.setMonth(defaultStartDate.getMonth() - 12) // 12 months ago
        break
    }

    const fromDate = startDate || defaultStartDate
    const toDate = endDate || defaultEndDate

    // Build date truncation based on period
    let dateTrunc: string
    let dateFormat: string

    switch (period) {
      case 'day':
        dateTrunc = 'DATE_TRUNC(\'day\', "createdAt")'
        dateFormat = 'YYYY-MM-DD'
        break
      case 'week':
        dateTrunc = 'DATE_TRUNC(\'week\', "createdAt")'
        dateFormat = 'YYYY-"W"WW'
        break
      case 'month':
        dateTrunc = 'DATE_TRUNC(\'month\', "createdAt")'
        dateFormat = 'YYYY-MM'
        break
    }

    const analytics = await this.prisma.$queryRaw`
      SELECT
        ${Prisma.raw(dateTrunc)} as period,
        TO_CHAR(${Prisma.raw(dateTrunc)}, ${dateFormat}) as date,
        COUNT(*)::INTEGER as "billCount",
        COALESCE(SUM("totalAmount"), 0)::FLOAT as "totalRevenue",
        COALESCE(AVG("totalAmount"), 0)::FLOAT as "avgBillValue",
        COUNT(CASE WHEN status = 'PAID' THEN 1 END)::INTEGER as "paidCount",
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END)::INTEGER as "pendingCount",
        COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END)::INTEGER as "confirmedCount",
        COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END)::INTEGER as "cancelledCount"
      FROM "Bill"
      WHERE "deletedAt" IS NULL
        AND "createdAt" >= ${fromDate}
        AND "createdAt" <= ${toDate}
      GROUP BY ${Prisma.raw(dateTrunc)}
      ORDER BY period ASC
    `

    // Transform the result to match our interface
    return (analytics as any[]).map((item) => ({
      period: item.period,
      date: item.date,
      totalRevenue: parseFloat(item.totalRevenue) || 0,
      billCount: parseInt(item.billCount) || 0,
      avgBillValue: parseFloat(item.avgBillValue) || 0,
      statusBreakdown: {
        PAID: parseInt(item.paidCount) || 0,
        PENDING: parseInt(item.pendingCount) || 0,
        CONFIRMED: parseInt(item.confirmedCount) || 0,
        CANCELLED: parseInt(item.cancelledCount) || 0
      }
    }))
  }

  async getBillSummary(period: 'day' | 'week' | 'month') {
    // Calculate current period dates
    const now = new Date()
    let currentStart: Date
    let currentEnd: Date
    let previousStart: Date
    let previousEnd: Date

    switch (period) {
      case 'day':
        // Today vs Yesterday
        currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        previousStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        previousEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        const currentWeekStart = new Date(now)
        currentWeekStart.setDate(now.getDate() - now.getDay())
        currentStart = new Date(
          currentWeekStart.getFullYear(),
          currentWeekStart.getMonth(),
          currentWeekStart.getDate()
        )
        currentEnd = new Date(currentStart.getTime() + 7 * 24 * 60 * 60 * 1000)
        previousStart = new Date(currentStart.getTime() - 7 * 24 * 60 * 60 * 1000)
        previousEnd = currentStart
        break
      case 'month':
        // This month vs Last month
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1)
        currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

        previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        previousEnd = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }

    // Get current period data
    const currentPeriodQuery = await this.prisma.bill.aggregate({
      where: {
        deletedAt: null,
        createdAt: {
          gte: currentStart,
          lt: currentEnd
        }
      },
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      },
      _avg: {
        totalAmount: true
      }
    })

    // Get status breakdown for current period
    const currentStatusBreakdown = await this.prisma.bill.groupBy({
      by: ['status'],
      where: {
        deletedAt: null,
        createdAt: {
          gte: currentStart,
          lt: currentEnd
        }
      },
      _count: {
        id: true
      }
    })

    // Get previous period data
    const previousPeriodQuery = await this.prisma.bill.aggregate({
      where: {
        deletedAt: null,
        createdAt: {
          gte: previousStart,
          lt: previousEnd
        }
      },
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      },
      _avg: {
        totalAmount: true
      }
    })

    // Build status breakdown object
    const statusCounts = {
      PAID: 0,
      PENDING: 0,
      CONFIRMED: 0,
      CANCELLED: 0
    }

    currentStatusBreakdown.forEach((item) => {
      statusCounts[item.status] = item._count.id
    })

    // Calculate current period metrics
    const currentPeriod = {
      totalRevenue: currentPeriodQuery._sum.totalAmount || 0,
      totalBills: currentPeriodQuery._count.id || 0,
      avgBillValue: currentPeriodQuery._avg.totalAmount || 0,
      paidBills: statusCounts.PAID,
      pendingBills: statusCounts.PENDING + statusCounts.CONFIRMED, // Combine pending statuses
      cancelledBills: statusCounts.CANCELLED
    }

    // Calculate previous period metrics
    const previousPeriod = {
      totalRevenue: previousPeriodQuery._sum.totalAmount || 0,
      totalBills: previousPeriodQuery._count.id || 0,
      avgBillValue: previousPeriodQuery._avg.totalAmount || 0
    }

    // Calculate growth rates
    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    const growth = {
      revenueGrowth: calculateGrowth(
        currentPeriod.totalRevenue,
        previousPeriod.totalRevenue
      ),
      billCountGrowth: calculateGrowth(
        currentPeriod.totalBills,
        previousPeriod.totalBills
      ),
      avgBillValueGrowth: calculateGrowth(
        currentPeriod.avgBillValue,
        previousPeriod.avgBillValue
      )
    }

    // Determine trends
    const getTrend = (growthRate: number): 'up' | 'down' | 'stable' => {
      if (growthRate > 5) return 'up'
      if (growthRate < -5) return 'down'
      return 'stable'
    }

    const trends = {
      revenueChange: getTrend(growth.revenueGrowth),
      billCountChange: getTrend(growth.billCountGrowth),
      avgBillValueChange: getTrend(growth.avgBillValueGrowth)
    }

    return {
      currentPeriod,
      previousPeriod,
      growth,
      trends
    }
  }
}
