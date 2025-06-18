import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { AccessTokenPayload } from '@/shared/types/jwt.type'
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import {
  BillPreviewDto,
  CreateBillDto,
  CreateCashPaymentDto,
  CreatePayOSPaymentDto,
  PayOSWebhookDto
} from './bill.model'
import { BillService } from './bill.service'

@ApiTags('Bill & Payment')
@Controller({ path: 'bills' })
export class BillController {
  constructor(private readonly billService: BillService) {}

  @Get('occupied-tables')
  @ApiOperation({ summary: 'Lấy danh sách bàn OCCUPIED có order DELIVERED' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách bàn thành công' })
  async getOccupiedTablesWithDeliveredOrders() {
    return this.billService.getOccupiedTablesWithDeliveredOrders()
  }

  @Post('preview')
  @ApiOperation({ summary: 'Preview hóa đơn trước khi tạo' })
  @ApiResponse({ status: 200, description: 'Preview hóa đơn thành công' })
  async previewBill(
    @Body() previewData: BillPreviewDto,
    @ActiveUser() user: AccessTokenPayload
  ) {
    return this.billService.previewBill(previewData, user.userId)
  }

  @Post()
  @ApiOperation({ summary: 'Tạo hóa đơn mới' })
  @ApiResponse({ status: 201, description: 'Tạo hóa đơn thành công' })
  async createBill(
    @Body() createBillData: CreateBillDto,
    @ActiveUser() user: AccessTokenPayload
  ) {
    return this.billService.createBill(createBillData, user.userId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin hóa đơn theo ID' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin hóa đơn thành công' })
  async getBillById(@Param('id') id: string) {
    return this.billService.getBillById(parseInt(id))
  }

  @Put(':id/confirm')
  @ApiOperation({ summary: 'Xác nhận hóa đơn' })
  @ApiResponse({ status: 200, description: 'Xác nhận hóa đơn thành công' })
  async confirmBill(@Param('id') id: string, @ActiveUser() user: AccessTokenPayload) {
    return this.billService.confirmBill(parseInt(id), user.userId)
  }

  @Post('payments/cash')
  @ApiOperation({ summary: 'Thanh toán tiền mặt' })
  @ApiResponse({ status: 201, description: 'Thanh toán thành công' })
  async createCashPayment(
    @Body() paymentData: CreateCashPaymentDto,
    @ActiveUser() user: AccessTokenPayload
  ) {
    return this.billService.createCashPayment(paymentData, user.userId)
  }

  @Post('payments/payos')
  @ApiOperation({ summary: 'Tạo thanh toán PayOS' })
  @ApiResponse({ status: 201, description: 'Tạo link thanh toán thành công' })
  async createPayOSPayment(
    @Body() paymentData: CreatePayOSPaymentDto,
    @ActiveUser() user: AccessTokenPayload
  ) {
    return this.billService.createPayOSPayment(paymentData, user.userId)
  }

  @Post('payments/payos/webhook')
  @ApiOperation({ summary: 'PayOS webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook xử lý thành công' })
  async handlePayOSWebhook(@Body() webhookData: PayOSWebhookDto) {
    // Note: This endpoint does not have authentication guard for webhooks
    return this.billService.handlePayOSWebhook(webhookData)
  }

  @Get('payments/:id/status')
  @ApiOperation({ summary: 'Kiểm tra trạng thái thanh toán' })
  @ApiResponse({ status: 200, description: 'Lấy trạng thái thanh toán thành công' })
  async getPaymentStatus(@Param('id') id: string) {
    return this.billService.getPaymentStatus(parseInt(id))
  }
}
