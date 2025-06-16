import { BILL_MESSAGE } from '@/common/constants/message'
import { PaymentStatus } from '@/common/constants/payment.constant'
import { PrismaService } from '@/shared/services/prisma.service'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { TableStatus } from '@prisma/client'
import { format } from 'date-fns'
import { BillRepo } from './bill.repo'

@Injectable()
export class BillService {
  constructor(
    private readonly billRepo: BillRepo,
    private readonly prisma: PrismaService
  ) {}

  async createBill({
    tableNumber,
    createdById
  }: {
    tableNumber: number
    createdById?: number
  }) {
    // 1. Validate table status
    await this.validateTableForBilling(tableNumber)

    // 2. Get billable orders (DELIVERED only, not in any bill)
    const orders = await this.billRepo.getBillableOrdersByTable(tableNumber)

    if (orders.length === 0) {
      throw new BadRequestException(BILL_MESSAGE.NO_DELIVERED_ORDERS)
    }

    // 3. Calculate amounts
    const subtotal = orders.reduce((sum, order) => {
      return sum + order.dishSnapshot.price * order.quantity
    }, 0)

    const taxAmount = subtotal * 0.1 // 10% VAT
    const totalAmount = subtotal + taxAmount

    // 4. Generate bill number
    const billNumber = await this.generateBillNumber()

    // 5. Create bill in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create bill
      const bill = await tx.bill.create({
        data: {
          billNumber,
          tableNumber,
          guestId: orders[0].guestId,
          subtotal,
          taxAmount,
          totalAmount,
          createdById
        }
      })

      // Link orders to bill
      await tx.order.updateMany({
        where: {
          id: { in: orders.map((order) => order.id) }
        },
        data: {
          billId: bill.id
        }
      })

      return bill
    })

    // 6. Return bill with full data
    const fullBill = await this.billRepo.findById(result.id)

    return {
      success: true,
      message: BILL_MESSAGE.CREATED_SUCCESS,
      data: fullBill
    }
  }

  async previewBill(tableNumber: number) {
    // Validate table exists and has orders
    const table = await this.prisma.table.findFirst({
      where: { number: tableNumber, deletedAt: null }
    })

    if (!table) {
      throw new NotFoundException(BILL_MESSAGE.NOT_FOUND)
    }

    // Get billable orders
    const orders = await this.billRepo.getBillableOrdersByTable(tableNumber)

    if (orders.length === 0) {
      throw new BadRequestException(BILL_MESSAGE.NO_DELIVERED_ORDERS)
    }

    // Calculate totals
    const subtotal = orders.reduce((sum, order) => {
      return sum + order.dishSnapshot.price * order.quantity
    }, 0)

    const taxAmount = subtotal * 0.1
    const totalAmount = subtotal + taxAmount

    return {
      tableNumber,
      orders: orders.map((order) => ({
        id: order.id,
        dishName: order.dishSnapshot.name,
        quantity: order.quantity,
        price: order.dishSnapshot.price,
        total: order.dishSnapshot.price * order.quantity,
        status: order.status
      })),
      subtotal,
      taxAmount,
      totalAmount,
      orderCount: orders.length
    }
  }

  async findById(id: number) {
    const bill = await this.billRepo.findById(id)

    if (!bill) {
      throw new NotFoundException(BILL_MESSAGE.NOT_FOUND)
    }

    return bill
  }

  async findByTableNumber(tableNumber: number) {
    const bills = await this.billRepo.findByTableNumber(tableNumber)
    return bills
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
    const result = await this.billRepo.list({
      page,
      limit,
      tableNumber,
      paymentStatus,
      startDate,
      endDate
    })

    return {
      data: result.data,
      totalItems: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
      totalPages: result.pagination.totalPages
    }
  }

  async updatePaymentStatus({
    billId,
    paymentStatus,
    paymentId,
    paidAt
  }: {
    billId: number
    paymentStatus: PaymentStatus
    paymentId?: string
    paidAt?: Date
  }) {
    const bill = await this.findById(billId)

    return this.billRepo.updatePaymentStatus({
      id: billId,
      paymentStatus,
      paymentId,
      paidAt
    })
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    const bill = await this.findById(id)

    if (bill.paymentStatus === PaymentStatus.COMPLETED) {
      throw new BadRequestException(BILL_MESSAGE.CANNOT_DELETE_PAID_BILL)
    }

    await this.billRepo.delete({ id, deletedById })

    return {
      success: true,
      message: BILL_MESSAGE.DELETED_SUCCESS
    }
  }

  private async validateTableForBilling(tableNumber: number) {
    const table = await this.prisma.table.findFirst({
      where: {
        number: tableNumber,
        deletedAt: null
      }
    })

    if (!table) {
      throw new NotFoundException(BILL_MESSAGE.NOT_FOUND)
    }

    if (table.status !== TableStatus.OCCUPIED) {
      throw new BadRequestException(
        `${BILL_MESSAGE.TABLE_NOT_OCCUPIED}. Trạng thái hiện tại: ${table.status}`
      )
    }

    return table
  }

  private async generateBillNumber(): Promise<string> {
    const now = new Date()
    const year = now.getFullYear()
    const month = format(now, 'MM')
    const day = format(now, 'dd')

    // Get last bill number to generate sequence
    const lastBillNumber = await this.billRepo.getLastBillNumber()

    let sequence = 1
    if (lastBillNumber) {
      // Extract sequence from last bill number (QOS-2025-0101-001)
      const parts = lastBillNumber.split('-')
      if (parts.length === 4) {
        const lastSequence = parseInt(parts[3])
        const lastDate = parts[2]
        const currentDate = `${month}${day}`

        // If same date, increment sequence, otherwise reset to 1
        if (lastDate === currentDate) {
          sequence = lastSequence + 1
        }
      }
    }

    // Format: QOS-YYYY-MMDD-XXX
    return `QOS-${year}-${month}${day}-${sequence.toString().padStart(3, '0')}`
  }
}
