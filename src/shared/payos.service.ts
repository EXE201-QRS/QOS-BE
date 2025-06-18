import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import PayOS from '@payos/node'

// PayOS Types từ documentation
export interface PayOSItemData {
  name: string
  quantity: number
  price: number
}

export interface PayOSCheckoutRequest {
  orderCode: number
  amount: number
  description: string
  items?: PayOSItemData[]
  buyerName?: string
  buyerEmail?: string
  buyerPhone?: string
  buyerAddress?: string
  cancelUrl: string
  returnUrl: string
  signature?: string
  expiredAt?: number
}

export interface PayOSCheckoutResponse {
  bin: string
  accountNumber: string
  accountName: string
  amount: number
  description: string
  orderCode: number
  currency: string
  paymentLinkId: string
  status: string
  expiredAt: number
  checkoutUrl: string
  qrCode: string
}

export interface PayOSPaymentLinkInfo {
  id: string
  orderCode: number
  amount: number
  amountPaid: number
  amountRemaining: number
  status: string
  createdAt: string
  transactions: PayOSTransaction[]
  cancellationReason?: string | null
  canceledAt?: string | null
}

export interface PayOSTransaction {
  reference: string
  amount: number
  accountNumber: string
  description: string
  transactionDateTime: string
  virtualAccountName?: string | null
  virtualAccountNumber?: string | null
  counterAccountBankId?: string | null
  counterAccountBankName?: string | null
  counterAccountName?: string | null
  counterAccountNumber?: string | null
}

export interface PayOSWebhookData {
  orderCode: number
  amount: number
  description: string
  accountNumber: string
  reference: string
  transactionDateTime: string
  currency: string
  paymentLinkId: string
  code: string
  desc: string
  counterAccountBankId?: string | null
  counterAccountBankName?: string | null
  counterAccountName?: string | null
  counterAccountNumber?: string | null
  virtualAccountName?: string | null
  virtualAccountNumber?: string | null
}

@Injectable()
export class PayOSService {
  private readonly logger = new Logger(PayOSService.name)
  private readonly payOS: PayOS

  constructor() {
    // Khởi tạo PayOS client với credentials từ environment
    this.payOS = new PayOS(
      process.env.PAYOS_CLIENT_ID!,
      process.env.PAYOS_API_KEY!,
      process.env.PAYOS_CHECKSUM_KEY!
    )

    this.logger.log('PayOS Service initialized successfully')
  }

  /**
   * Tạo payment link từ PayOS
   */
  async createPaymentLink(
    requestData: PayOSCheckoutRequest
  ): Promise<PayOSCheckoutResponse> {
    try {
      this.logger.log(`Creating PayOS payment link for order ${requestData.orderCode}`)

      const response = await this.payOS.createPaymentLink(requestData)

      this.logger.log(
        `PayOS payment link created successfully: ${response.paymentLinkId}`
      )

      return response as PayOSCheckoutResponse
    } catch (error) {
      this.logger.error('Failed to create PayOS payment link:', error)
      throw new BadRequestException(
        `Lỗi tạo link thanh toán PayOS: ${error.message || 'Unknown error'}`
      )
    }
  }

  /**
   * Lấy thông tin payment từ PayOS
   */
  async getPaymentLinkInformation(
    orderCodeOrPaymentLinkId: string | number
  ): Promise<PayOSPaymentLinkInfo> {
    try {
      this.logger.log(`Getting PayOS payment info for: ${orderCodeOrPaymentLinkId}`)

      const response = await this.payOS.getPaymentLinkInformation(
        orderCodeOrPaymentLinkId
      )

      return response as PayOSPaymentLinkInfo
    } catch (error) {
      this.logger.error('Failed to get PayOS payment info:', error)
      throw new BadRequestException(
        `Lỗi lấy thông tin thanh toán PayOS: ${error.message || 'Unknown error'}`
      )
    }
  }

  /**
   * Hủy payment link từ PayOS
   */
  async cancelPaymentLink(
    orderCodeOrPaymentLinkId: string | number,
    cancellationReason?: string
  ): Promise<PayOSPaymentLinkInfo> {
    try {
      this.logger.log(
        `Cancelling PayOS payment: ${orderCodeOrPaymentLinkId}, reason: ${cancellationReason}`
      )

      const response = await this.payOS.cancelPaymentLink(
        orderCodeOrPaymentLinkId,
        cancellationReason
      )

      this.logger.log(`PayOS payment cancelled successfully`)

      return response as PayOSPaymentLinkInfo
    } catch (error) {
      this.logger.error('Failed to cancel PayOS payment:', error)
      throw new BadRequestException(
        `Lỗi hủy thanh toán PayOS: ${error.message || 'Unknown error'}`
      )
    }
  }

  /**
   * Xác thực webhook URL với PayOS
   */
  async confirmWebhook(webhookUrl: string): Promise<string> {
    try {
      this.logger.log(`Confirming PayOS webhook URL: ${webhookUrl}`)

      const response = await this.payOS.confirmWebhook(webhookUrl)

      this.logger.log('PayOS webhook confirmed successfully')

      return response
    } catch (error) {
      this.logger.error('Failed to confirm PayOS webhook:', error)
      throw new BadRequestException(
        `Lỗi xác thực webhook PayOS: ${error.message || 'Unknown error'}`
      )
    }
  }

  /**
   * Xác minh dữ liệu webhook từ PayOS
   */
  verifyPaymentWebhookData(webhookBody: any): PayOSWebhookData {
    try {
      this.logger.log('Verifying PayOS webhook data')

      const webhookData = this.payOS.verifyPaymentWebhookData(webhookBody)

      this.logger.log(`PayOS webhook verified for order: ${webhookData.orderCode}`)

      return webhookData as PayOSWebhookData
    } catch (error) {
      this.logger.error('Failed to verify PayOS webhook data:', error)
      throw new BadRequestException(
        `Lỗi xác minh webhook PayOS: ${error.message || 'Unknown error'}`
      )
    }
  }

  /**
   * Generate order code cho PayOS (phải là số và unique)
   */
  generateOrderCode(): number {
    // PayOS yêu cầu orderCode phải là số và unique
    // Sử dụng timestamp + random để tạo orderCode unique
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)

    // Lấy 6 số cuối của timestamp + 3 số random
    const orderCode = parseInt(
      `${timestamp.toString().slice(-6)}${random.toString().padStart(3, '0')}`
    )

    return orderCode
  }

  /**
   * Tạo URLs cho returnUrl và cancelUrl
   */
  generatePaymentUrls(billId: number) {
    const baseUrl = process.env.APP_URL || 'http://localhost:3000'

    return {
      returnUrl: `${baseUrl}/manage/service/payment/return?billId=${billId}`,
      cancelUrl: `${baseUrl}/manage/service/payment/cancel?billId=${billId}`
    }
  }

  /**
   * Helper để tạo PayOS items từ bill orders
   */
  createPayOSItems(orders: any[]): PayOSItemData[] {
    return orders.map((order) => ({
      name: order.dishSnapshot.name,
      quantity: order.quantity,
      price: order.dishSnapshot.price
    }))
  }

  /**
   * Validate PayOS webhook signature (nếu cần)
   */
  validateWebhookSignature(payload: any, signature: string): boolean {
    try {
      // PayOS SDK tự động verify signature trong verifyPaymentWebhookData
      // Chỉ cần gọi hàm đó là đủ
      this.verifyPaymentWebhookData(payload)
      return true
    } catch (error) {
      this.logger.error('Invalid PayOS webhook signature:', error)
      return false
    }
  }
}
