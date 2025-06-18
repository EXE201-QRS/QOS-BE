import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import {
  BILL_ERROR_MESSAGES,
  BILL_STATUS,
  BILL_SUCCESS_MESSAGES,
  PAYMENT_METHOD,
  PAYMENT_STATUS
} from './bill.constants'
import {
  BillPreviewDto,
  CreateBillDto,
  CreateCashPaymentDto,
  CreatePayOSPaymentDto,
  PaymentWithBill
} from './bill.model'
import { BillRepository } from './bill.repo'
import {
  calculateBillTotals,
  calculateChange,
  generateBillNumber,
  generatePayOSOrderId,
  validatePaymentAmount
} from './bill.utils'

@Injectable()
export class BillService {
  constructor(private readonly billRepository: BillRepository) {}

  // Get occupied tables with delivered orders
  async getOccupiedTablesWithDeliveredOrders() {
    try {
      const tables = await this.billRepository.findOccupiedTablesWithDeliveredOrders()

      // Get detailed orders for each table
      const tablesWithOrders = await Promise.all(
        (tables as any[]).map(async (table: any) => {
          const orders = await this.billRepository.findDeliveredOrdersByTableNumber(
            table.tableNumber
          )

          return {
            tableNumber: table.tableNumber,
            deliveredOrdersCount: parseInt(table.deliveredOrdersCount),
            totalAmount: parseFloat(table.totalAmount) || 0,
            orders: orders.map((order) => ({
              id: order.id,
              quantity: order.quantity,
              status: order.status,
              dishSnapshot: {
                id: order.dishSnapshot.id,
                name: order.dishSnapshot.name,
                price: order.dishSnapshot.price,
                image: order.dishSnapshot.image
              }
            }))
          }
        })
      )

      return {
        success: true,
        message: 'Lấy danh sách bàn thành công',
        data: tablesWithOrders
      }
    } catch (error) {
      throw new BadRequestException('Lỗi khi lấy danh sách bàn')
    }
  }

  // Preview bill before creating
  async previewBill(previewData: BillPreviewDto, userId: number) {
    try {
      const { tableNumber, discountAmount, orderIds } = previewData

      // Get orders by IDs
      const orders =
        await this.billRepository.findDeliveredOrdersByTableNumber(tableNumber)
      const filteredOrders = orders.filter((order) => orderIds.includes(order.id))

      if (filteredOrders.length !== orderIds.length) {
        throw new BadRequestException(
          'Một số order không tồn tại hoặc không ở trạng thái DELIVERED'
        )
      }

      // Calculate subtotal
      const subtotal = filteredOrders.reduce((sum, order) => {
        return sum + order.dishSnapshot.price * order.quantity
      }, 0)

      // Calculate bill totals
      const billCalculation = calculateBillTotals({
        subtotal,
        discountAmount
      })

      return {
        success: true,
        message: 'Preview hóa đơn thành công',
        data: {
          tableNumber,
          orders: filteredOrders.map((order) => ({
            id: order.id,
            quantity: order.quantity,
            dishSnapshot: {
              id: order.dishSnapshot.id,
              name: order.dishSnapshot.name,
              price: order.dishSnapshot.price,
              image: order.dishSnapshot.image
            },
            lineTotal: order.dishSnapshot.price * order.quantity
          })),
          calculation: billCalculation
        }
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new BadRequestException('Lỗi khi tạo preview hóa đơn')
    }
  }

  // Create bill
  async createBill(createBillData: CreateBillDto, userId: number) {
    try {
      const { tableNumber, discountAmount, notes, orderIds } = createBillData

      // Validate orders exist and are DELIVERED
      const orders =
        await this.billRepository.findDeliveredOrdersByTableNumber(tableNumber)
      const validOrders = orders.filter((order) => orderIds.includes(order.id))

      if (validOrders.length !== orderIds.length) {
        throw new BadRequestException(BILL_ERROR_MESSAGES.NO_DELIVERED_ORDERS)
      }

      // Calculate subtotal
      const subtotal = validOrders.reduce((sum, order) => {
        return sum + order.dishSnapshot.price * order.quantity
      }, 0)

      // Calculate bill totals
      const billCalculation = calculateBillTotals({
        subtotal,
        discountAmount
      })

      // Generate bill number
      const billNumber = generateBillNumber()

      // Create bill data
      const billData = {
        billNumber,
        tableNumber,
        subtotal: billCalculation.subtotal,
        taxAmount: billCalculation.taxAmount,
        discountAmount: billCalculation.discountAmount,
        serviceCharge: billCalculation.serviceCharge,
        totalAmount: billCalculation.totalAmount,
        status: BILL_STATUS.PENDING,
        notes,
        createdById: userId
      }

      // Create bill with orders
      const bill = await this.billRepository.createBillWithOrders(billData, orderIds)

      return {
        success: true,
        message: BILL_SUCCESS_MESSAGES.BILL_CREATED,
        data: bill
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new BadRequestException('Lỗi khi tạo hóa đơn')
    }
  }

  // Get bill by ID
  async getBillById(id: number) {
    try {
      const bill = await this.billRepository.findBillById(id)

      if (!bill) {
        throw new NotFoundException(BILL_ERROR_MESSAGES.BILL_NOT_FOUND)
      }

      return {
        success: true,
        message: 'Lấy thông tin hóa đơn thành công',
        data: bill
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException('Lỗi khi lấy thông tin hóa đơn')
    }
  }

  // Confirm bill
  async confirmBill(id: number, userId: number) {
    try {
      const bill = await this.billRepository.findBillById(id)

      if (!bill) {
        throw new NotFoundException(BILL_ERROR_MESSAGES.BILL_NOT_FOUND)
      }

      if (bill.status !== BILL_STATUS.PENDING) {
        throw new ConflictException('Chỉ có thể xác nhận hóa đơn ở trạng thái PENDING')
      }

      const confirmedBill = await this.billRepository.updateBill(id, {
        status: BILL_STATUS.CONFIRMED,
        updatedBy: { connect: { id: userId } }
      })

      return {
        success: true,
        message: BILL_SUCCESS_MESSAGES.BILL_CONFIRMED,
        data: confirmedBill
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error
      }
      throw new BadRequestException('Lỗi khi xác nhận hóa đơn')
    }
  }

  // Create cash payment
  async createCashPayment(paymentData: CreateCashPaymentDto, userId: number) {
    try {
      const { billId, receivedAmount } = paymentData

      const bill = await this.billRepository.findBillById(billId)
      if (!bill) {
        throw new NotFoundException(BILL_ERROR_MESSAGES.BILL_NOT_FOUND)
      }

      if (bill.status !== BILL_STATUS.CONFIRMED) {
        throw new ConflictException('Hóa đơn phải ở trạng thái CONFIRMED để thanh toán')
      }

      // Validate payment amount
      const validation = validatePaymentAmount(
        bill.totalAmount,
        receivedAmount,
        PAYMENT_METHOD.CASH
      )
      if (!validation.isValid) {
        throw new BadRequestException(validation.error)
      }

      // Calculate change
      const changeAmount = calculateChange(bill.totalAmount, receivedAmount)

      // Create payment
      const payment = await this.billRepository.createPayment({
        bill: { connect: { id: billId } },
        paymentMethod: PAYMENT_METHOD.CASH,
        amount: bill.totalAmount,
        status: PAYMENT_STATUS.PAID,
        receivedAmount,
        changeAmount,
        paidAt: new Date(),
        processedBy: { connect: { id: userId } }
      })

      // Complete payment (update bill, orders, table status)
      await this.billRepository.completeBillPayment(billId, payment.id, bill.tableNumber)

      return {
        success: true,
        message: BILL_SUCCESS_MESSAGES.PAYMENT_SUCCESS,
        data: {
          payment,
          changeAmount
        }
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error
      }
      throw new BadRequestException('Lỗi khi xử lý thanh toán tiền mặt')
    }
  }

  // Create PayOS payment
  async createPayOSPayment(paymentData: CreatePayOSPaymentDto, userId: number) {
    try {
      const { billId } = paymentData

      const bill = await this.billRepository.findBillById(billId)
      if (!bill) {
        throw new NotFoundException(BILL_ERROR_MESSAGES.BILL_NOT_FOUND)
      }

      if (bill.status !== BILL_STATUS.CONFIRMED) {
        throw new ConflictException('Hóa đơn phải ở trạng thái CONFIRMED để thanh toán')
      }

      // Generate PayOS order ID
      const payosOrderId = generatePayOSOrderId()

      // TODO: Integrate with PayOS API
      // This is a placeholder - actual PayOS integration would go here
      const payosResponse = {
        orderCode: parseInt(payosOrderId.replace(/\D/g, '').slice(-8)),
        amount: bill.totalAmount,
        description: `Thanh toán hóa đơn ${bill.billNumber}`,
        paymentLinkId: `payos_${Date.now()}`,
        checkoutUrl: `https://pay.payos.vn/web/${payosOrderId}`,
        qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`
      }

      // Create payment record
      const payment = await this.billRepository.createPayment({
        bill: { connect: { id: billId } },
        paymentMethod: PAYMENT_METHOD.BANK_TRANSFER,
        amount: bill.totalAmount,
        status: PAYMENT_STATUS.PENDING,
        payosOrderId,
        payosPaymentLinkId: payosResponse.paymentLinkId,
        payosCheckoutUrl: payosResponse.checkoutUrl,
        payosQrCode: payosResponse.qrCode,
        expiredAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        processedBy: { connect: { id: userId } }
      })

      return {
        success: true,
        message: 'Tạo link thanh toán thành công',
        data: {
          payment,
          payosData: {
            checkoutUrl: payosResponse.checkoutUrl,
            qrCode: payosResponse.qrCode,
            paymentLinkId: payosResponse.paymentLinkId
          }
        }
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error
      }
      throw new BadRequestException('Lỗi khi tạo thanh toán PayOS')
    }
  }

  // Handle PayOS webhook
  async handlePayOSWebhook(webhookData: any) {
    try {
      const { data } = webhookData

      // Find payment by PayOS order code
      const payment = (await this.billRepository.findPaymentByPayOSOrderId(
        data.orderCode.toString()
      )) as PaymentWithBill | null

      if (!payment) {
        throw new NotFoundException('Không tìm thấy thanh toán')
      }

      if (payment.status === PAYMENT_STATUS.PAID) {
        return { success: true, message: 'Thanh toán đã được xử lý' }
      }

      // Update payment status based on webhook
      if (webhookData.code === '00') {
        // Payment successful
        await this.billRepository.updatePayment(payment.id, {
          status: PAYMENT_STATUS.PAID,
          paidAt: new Date(),
          payosTransactionId: data.reference,
          gatewayResponse: webhookData
        })

        // Complete bill payment
        await this.billRepository.completeBillPayment(
          payment.billId,
          payment.id,
          payment.bill!.tableNumber
        )
      } else {
        // Payment failed
        await this.billRepository.updatePayment(payment.id, {
          status: PAYMENT_STATUS.FAILED,
          failureReason: webhookData.desc,
          gatewayResponse: webhookData
        })
      }

      return {
        success: true,
        message: 'Webhook xử lý thành công'
      }
    } catch (error) {
      throw new BadRequestException('Lỗi khi xử lý webhook PayOS')
    }
  }

  // Get payment status
  async getPaymentStatus(paymentId: number) {
    try {
      const payment = await this.billRepository.findPaymentById(paymentId)

      if (!payment) {
        throw new NotFoundException('Không tìm thấy thanh toán')
      }

      return {
        success: true,
        message: 'Lấy trạng thái thanh toán thành công',
        data: payment
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException('Lỗi khi lấy trạng thái thanh toán')
    }
  }
}
