import envConfig from '@/config/env.config'
import { PayOSService } from '@/shared/payos.service'
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
  validatePaymentAmount
} from './bill.utils'

@Injectable()
export class BillService {
  constructor(
    private readonly billRepository: BillRepository,
    private readonly payosService: PayOSService
  ) {}

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

  // Get bills with filters
  async getBills(filters: { status?: string; tableNumber?: number }) {
    try {
      const whereConditions: any = {
        deletedAt: null
      }

      if (filters.status) {
        whereConditions.status = filters.status
      }

      if (filters.tableNumber) {
        whereConditions.tableNumber = filters.tableNumber
      }

      const bills = await this.billRepository.findBillsWithSimpleFilters(whereConditions)

      return {
        success: true,
        message: 'Lấy danh sách hóa đơn thành công',
        data: bills
      }
    } catch (error) {
      throw new BadRequestException('Lỗi khi lấy danh sách hóa đơn')
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

      let bill = await this.billRepository.findBillById(billId)
      if (!bill) {
        throw new NotFoundException(BILL_ERROR_MESSAGES.BILL_NOT_FOUND)
      }

      // AUTO-CONFIRM: Nếu bill đang PENDING, tự động confirm trước khi thanh toán
      if (bill.status === BILL_STATUS.PENDING) {
        await this.billRepository.updateBill(billId, {
          status: BILL_STATUS.CONFIRMED,
          updatedBy: { connect: { id: userId } }
        })
        // Refresh bill data sau khi update
        bill = await this.billRepository.findBillById(billId)
      }

      // Kiểm tra bill có thể thanh toán không
      if (bill.status !== BILL_STATUS.CONFIRMED) {
        throw new ConflictException('Hóa đơn phải ở trạng thái CONFIRMED để thanh toán')
      }

      if (bill.status === BILL_STATUS.PAID) {
        throw new ConflictException('Hóa đơn đã được thanh toán')
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
      const { billId, buyerName, buyerEmail, buyerPhone } = paymentData

      let bill = await this.billRepository.findBillById(billId)
      if (!bill) {
        throw new NotFoundException(BILL_ERROR_MESSAGES.BILL_NOT_FOUND)
      }

      // AUTO-CONFIRM: Nếu bill đang PENDING, tự động confirm trước khi thanh toán
      if (bill.status === BILL_STATUS.PENDING) {
        await this.billRepository.updateBill(billId, {
          status: BILL_STATUS.CONFIRMED,
          updatedBy: { connect: { id: userId } }
        })
        // Refresh bill data sau khi update
        bill = await this.billRepository.findBillById(billId)
      }

      // Kiểm tra bill có thể thanh toán không
      if (bill.status !== BILL_STATUS.CONFIRMED) {
        throw new ConflictException('Hóa đơn phải ở trạng thái CONFIRMED để thanh toán')
      }

      if (bill.status === BILL_STATUS.PAID) {
        throw new ConflictException('Hóa đơn đã được thanh toán')
      }

      // Generate unique order code cho PayOS
      const orderCode = this.payosService.generateOrderCode()

      // Tạo URLs cho return và cancel
      const { returnUrl, cancelUrl } = this.payosService.generatePaymentUrls(billId)

      // Tạo items từ bill orders
      const items = bill.orders ? this.payosService.createPayOSItems(bill.orders) : []

      // Tạo PayOS payment request
      const payosRequest = {
        orderCode,
        amount: bill.totalAmount,
        description: `${bill.billNumber} Bàn ${bill.tableNumber}`,
        items,
        buyerName,
        buyerEmail,
        buyerPhone,
        cancelUrl,
        returnUrl,
        expiredAt: Math.floor(Date.now() / 1000) + 15 * 60 // 15 minutes from now
      }

      // Gọi PayOS API để tạo payment link
      const payosResponse = await this.payosService.createPaymentLink(payosRequest)

      // Create payment record trong database
      const payment = await this.billRepository.createPayment({
        bill: { connect: { id: billId } },
        paymentMethod: PAYMENT_METHOD.BANK_TRANSFER,
        amount: bill.totalAmount,
        status: PAYMENT_STATUS.PENDING,
        payosOrderId: orderCode.toString(),
        payosPaymentLinkId: payosResponse.paymentLinkId,
        payosCheckoutUrl: payosResponse.checkoutUrl,
        payosQrCode: payosResponse.qrCode,
        expiredAt: new Date(payosResponse.expiredAt * 1000),
        processedBy: { connect: { id: userId } }
      })

      return {
        success: true,
        message: 'Tạo link thanh toán PayOS thành công',
        data: {
          payment,
          payosData: {
            orderCode: payosResponse.orderCode,
            checkoutUrl: payosResponse.checkoutUrl,
            qrCode: payosResponse.qrCode,
            paymentLinkId: payosResponse.paymentLinkId,
            expiredAt: payosResponse.expiredAt,
            amount: payosResponse.amount
          }
        }
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error
      }
      throw new BadRequestException(
        `Lỗi khi tạo thanh toán PayOS: ${error.message || 'Unknown error'}`
      )
    }
  }

  // Handle PayOS webhook
  async handlePayOSWebhook(webhookBody: any) {
    try {
      // Xác minh webhook data với PayOS SDK
      const webhookData = this.payosService.verifyPaymentWebhookData(webhookBody)

      // Tìm payment theo orderCode
      const payment = (await this.billRepository.findPaymentByPayOSOrderId(
        webhookData.orderCode.toString()
      )) as PaymentWithBill | null

      if (!payment) {
        throw new NotFoundException(
          `Không tìm thấy thanh toán với orderCode: ${webhookData.orderCode}`
        )
      }

      // Kiểm tra nếu payment đã được xử lý
      if (payment.status === PAYMENT_STATUS.PAID) {
        return {
          success: true,
          message: `Thanh toán ${webhookData.orderCode} đã được xử lý trước đó`
        }
      }

      // Xử lý webhook dựa trên code trả về
      if (webhookData.code === '00') {
        // Thanh toán thành công
        await this.billRepository.updatePayment(payment.id, {
          status: PAYMENT_STATUS.PAID,
          paidAt: new Date(webhookData.transactionDateTime),
          payosTransactionId: webhookData.reference,
          gatewayResponse: webhookData as any
        })

        // Hoàn thành bill payment: update bill, orders, table
        await this.billRepository.completeBillPayment(
          payment.billId,
          payment.id,
          payment.bill!.tableNumber
        )

        return {
          success: true,
          message: `PayOS webhook: Thanh toán ${webhookData.orderCode} thành công`,
          data: {
            orderCode: webhookData.orderCode,
            amount: webhookData.amount,
            reference: webhookData.reference
          }
        }
      } else {
        // Thanh toán thất bại
        await this.billRepository.updatePayment(payment.id, {
          status: PAYMENT_STATUS.FAILED,
          failureReason: webhookData.desc,
          gatewayResponse: webhookData as any
        })

        return {
          success: true,
          message: `PayOS webhook: Thanh toán ${webhookData.orderCode} thất bại - ${webhookData.desc}`,
          data: {
            orderCode: webhookData.orderCode,
            reason: webhookData.desc
          }
        }
      }
    } catch (error) {
      // Log error chi tiết cho debugging
      console.error('PayOS Webhook Error:', {
        error: error.message,
        webhookBody,
        timestamp: new Date().toISOString()
      })

      throw new BadRequestException(
        `Lỗi xử lý PayOS webhook: ${error.message || 'Unknown error'}`
      )
    }
  }

  // Get payment status (with PayOS sync)
  async getPaymentStatus(paymentId: number) {
    try {
      const payment = await this.billRepository.findPaymentById(paymentId)

      if (!payment) {
        throw new NotFoundException('Không tìm thấy thanh toán')
      }

      let payosStatus: any = null

      // Nếu là PayOS payment và chưa hoàn thành, kiểm tra trạng thái từ PayOS
      if (
        payment.paymentMethod === PAYMENT_METHOD.BANK_TRANSFER &&
        payment.payosOrderId &&
        payment.status === PAYMENT_STATUS.PENDING
      ) {
        try {
          payosStatus = await this.payosService.getPaymentLinkInformation(
            parseInt(payment.payosOrderId)
          )

          if (
            payosStatus &&
            payosStatus.status === 'PAID' &&
            (payment.status as string) !== PAYMENT_STATUS.PAID
          ) {
            // Tự động cập nhật trạng thái từ PayOS
            await this.billRepository.updatePayment(payment.id, {
              status: PAYMENT_STATUS.PAID,
              paidAt: new Date(),
              gatewayResponse: payosStatus
            })

            // Hoàn thành bill payment
            const bill = await this.billRepository.findBillById(payment.billId)
            if (bill) {
              await this.billRepository.completeBillPayment(
                payment.billId,
                payment.id,
                bill.tableNumber
              )
            }

            // Refresh payment data
            const updatedPayment = await this.billRepository.findPaymentById(paymentId)
            payment.status = updatedPayment!.status
            payment.paidAt = updatedPayment!.paidAt
          }
        } catch (payosError) {
          // Log lỗi PayOS nhưng không throw để vẫn trả về payment data
          console.error('Lỗi kiểm tra PayOS status:', payosError)
        }
      }

      return {
        success: true,
        message: 'Lấy trạng thái thanh toán thành công',
        data: {
          payment,
          payosStatus
        }
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException('Lỗi khi lấy trạng thái thanh toán')
    }
  }

  // Cancel PayOS payment
  async cancelPayOSPayment(paymentId: number, reason?: string) {
    try {
      const payment = await this.billRepository.findPaymentById(paymentId)

      if (!payment) {
        throw new NotFoundException('Không tìm thấy thanh toán')
      }

      if (payment.paymentMethod !== PAYMENT_METHOD.BANK_TRANSFER) {
        throw new BadRequestException('Chỉ có thể hủy thanh toán PayOS')
      }

      if (payment.status === PAYMENT_STATUS.PAID) {
        throw new ConflictException('Không thể hủy thanh toán đã hoàn thành')
      }

      if (!payment.payosOrderId) {
        throw new BadRequestException('Không tìm thấy mã đơn hàng PayOS')
      }

      // Hủy payment trên PayOS
      const cancelledPayment = await this.payosService.cancelPaymentLink(
        parseInt(payment.payosOrderId),
        reason || 'Hủy thanh toán từ hệ thống'
      )

      // Cập nhật trạng thái trong database
      const updatedPayment = await this.billRepository.updatePayment(payment.id, {
        status: PAYMENT_STATUS.CANCELLED,
        failureReason: reason || 'Hủy thanh toán từ hệ thống',
        gatewayResponse: cancelledPayment as any
      })

      return {
        success: true,
        message: 'Hủy thanh toán PayOS thành công',
        data: updatedPayment
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error
      }
      throw new BadRequestException(
        `Lỗi khi hủy thanh toán PayOS: ${error.message || 'Unknown error'}`
      )
    }
  }

  // Handle PayOS return URL
  async handlePayOSReturn(returnData: {
    billId: number
    code: string
    paymentLinkId: string
    cancel: boolean
    status: string
    orderCode: number
  }) {
    const feUrl = envConfig.FE_URL || 'http://localhost:3000'
    try {
      const { billId, code, paymentLinkId, cancel, status, orderCode } = returnData
      // Tìm payment theo orderCode
      const payment = (await this.billRepository.findPaymentByPayOSOrderId(
        orderCode.toString()
      )) as PaymentWithBill | null

      if (!payment) {
        // Redirect về frontend với error
        return {
          success: false,
          message: `Không tìm thấy thanh toán với orderCode: ${orderCode}`,
          redirect: `${feUrl}/manage/service/payment?error=payment_not_found&billId=${billId}`
        }
      }

      // Nếu đã thanh toán thành công trước đó
      if (payment.status === PAYMENT_STATUS.PAID) {
        return {
          success: true,
          message: 'Thanh toán đã được xử lý thành công',
          redirect: `${feUrl}/manage/service/payment?success=true&billId=${billId}&paymentId=${payment.id}`
        }
      }

      // Xử lý theo code trả về từ PayOS
      if (code === '00' && status === 'PAID' && !cancel) {
        // Thanh toán thành công
        await this.billRepository.updatePayment(payment.id, {
          status: PAYMENT_STATUS.PAID,
          paidAt: new Date(),
          gatewayResponse: returnData as any
        })

        // Hoàn thành bill payment
        await this.billRepository.completeBillPayment(
          payment.billId,
          payment.id,
          payment.bill!.tableNumber
        )

        return {
          success: true,
          message: 'Thanh toán thành công',
          redirect: `${feUrl}/manage/service/payment?success=true&billId=${billId}&paymentId=${payment.id}`
        }
      } else {
        // Thanh toán thất bại hoặc bị hủy
        const failureReason = cancel
          ? 'Người dùng hủy thanh toán'
          : `Thanh toán thất bại (code: ${code})`

        await this.billRepository.updatePayment(payment.id, {
          status: cancel ? PAYMENT_STATUS.CANCELLED : PAYMENT_STATUS.FAILED,
          failureReason,
          gatewayResponse: returnData as any
        })

        return {
          success: false,
          message: failureReason,
          redirect: `${feUrl}/manage/service/payment?error=payment_failed&billId=${billId}&reason=${encodeURIComponent(failureReason)}`
        }
      }
    } catch (error) {
      console.error('PayOS Return Handler Error:', error)
      return {
        success: false,
        message: `Lỗi xử lý return PayOS: ${error.message}`,
        redirect: `${feUrl}/manage/service/payment?error=system_error&billId=${returnData.billId}`
      }
    }
  }

  // Handle PayOS cancel URL
  async handlePayOSCancel(cancelData: {
    billId: number
    code: string
    paymentLinkId: string
    cancel: boolean
    status: string
    orderCode: number
  }) {
    const feUrl = envConfig.FE_URL || 'http://localhost:3000'
    try {
      const { billId, orderCode } = cancelData

      // Tìm payment theo orderCode
      const payment = await this.billRepository.findPaymentByPayOSOrderId(
        orderCode.toString()
      )

      if (payment && payment.status === PAYMENT_STATUS.PENDING) {
        // Cập nhật trạng thái hủy
        await this.billRepository.updatePayment(payment.id, {
          status: PAYMENT_STATUS.CANCELLED,
          failureReason: 'Người dùng hủy thanh toán',
          gatewayResponse: cancelData as any
        })
      }

      return {
        success: false,
        message: 'Thanh toán đã bị hủy',
        redirect: `${feUrl}/manage/service/payment?error=payment_cancelled&billId=${billId}`
      }
    } catch (error) {
      console.error('PayOS Cancel Handler Error:', error)
      return {
        success: false,
        message: `Lỗi xử lý cancel PayOS: ${error.message}`,
        redirect: `${feUrl}/manage/service/payment?error=system_error&billId=${cancelData.billId}`
      }
    }
  }
}
