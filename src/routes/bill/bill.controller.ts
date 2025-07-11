import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { IsPublic } from '@/common/decorators/auth.decorator'
import { AccessTokenPayload } from '@/shared/types/jwt.type'
import { Body, Controller, Get, Param, Post, Put, Query, Res } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import {
  BillAnalyticsQueryDto,
  BillAnalyticsResponseDto,
  BillPreviewDto,
  BillSummaryQueryDto,
  BillSummaryResponseDto,
  CreateBillDto,
  CreateCashPaymentDto,
  CreatePayOSPaymentDto
} from './bill.model'
import { BillService } from './bill.service'

@ApiTags('Bill & Payment')
@Controller({ path: 'bills' })
export class BillController {
  constructor(private readonly billService: BillService) {}

  // =============== BILL ANALYTICS ENDPOINTS ===============

  @Get('analytics')
  @ApiOperation({ summary: 'Phân tích hóa đơn theo thời gian' })
  @ApiQuery({
    name: 'period',
    enum: ['day', 'week', 'month'],
    description: 'Khoảng thời gian phân tích (day/week/month)'
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Ngày bắt đầu (YYYY-MM-DD)',
    example: '2024-01-01'
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Ngày kết thúc (YYYY-MM-DD)',
    example: '2024-01-31'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy phân tích hóa đơn thành công',
    type: BillAnalyticsResponseDto
  })
  async getBillAnalytics(@Query() query: BillAnalyticsQueryDto) {
    return this.billService.getBillAnalytics({
      period: query.period,
      startDate: query.startDate,
      endDate: query.endDate
    })
  }

  @Get('summary')
  @ApiOperation({ summary: 'Tổng quan hóa đơn theo thời gian' })
  @ApiQuery({
    name: 'period',
    enum: ['day', 'week', 'month'],
    description: 'Khoảng thời gian so sánh (day/week/month)'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy tổng quan hóa đơn thành công',
    type: BillSummaryResponseDto
  })
  async getBillSummary(@Query() query: BillSummaryQueryDto) {
    return this.billService.getBillSummary(query.period)
  }

  // =============== EXISTING BILL ENDPOINTS ===============

  @Get('occupied-tables')
  @ApiOperation({ summary: 'Lấy danh sách bàn OCCUPIED có order DELIVERED' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách bàn thành công' })
  async getOccupiedTablesWithDeliveredOrders() {
    return this.billService.getOccupiedTablesWithDeliveredOrders()
  }

  @Get('payments/:id/status')
  @ApiOperation({ summary: 'Kiểm tra trạng thái thanh toán (with PayOS sync)' })
  @ApiResponse({ status: 200, description: 'Lấy trạng thái thanh toán thành công' })
  async getPaymentStatus(@Param('id') id: string) {
    return this.billService.getPaymentStatus(parseInt(id))
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin hóa đơn theo ID' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin hóa đơn thành công' })
  async getBillById(@Param('id') id: string) {
    return this.billService.getBillById(parseInt(id))
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách hóa đơn theo trạng thái' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Lọc theo trạng thái hóa đơn (PENDING, CONFIRMED, PAID, CANCELLED)'
  })
  @ApiQuery({ name: 'tableNumber', required: false, description: 'Lọc theo số bàn' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách hóa đơn thành công' })
  async getBills(
    @Query('status') status?: string,
    @Query('tableNumber') tableNumber?: string
  ) {
    return this.billService.getBills({
      status,
      tableNumber: tableNumber ? parseInt(tableNumber) : undefined
    })
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
  @IsPublic()
  @ApiOperation({ summary: 'PayOS webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook xử lý thành công' })
  async handlePayOSWebhook(@Body() webhookData: any) {
    // Note: This endpoint does not have authentication guard for webhooks
    // PayOS SDK will handle webhook verification
    return this.billService.handlePayOSWebhook(webhookData)
  }

  @Post('payments/:id/cancel')
  @ApiOperation({ summary: 'Hủy thanh toán PayOS' })
  @ApiResponse({ status: 200, description: 'Hủy thanh toán thành công' })
  async cancelPayOSPayment(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.billService.cancelPayOSPayment(parseInt(id), body.reason)
  }

  @Get('payments/payos/return')
  @IsPublic()
  @ApiOperation({ summary: 'PayOS return URL handler' })
  @ApiResponse({ status: 302, description: 'Redirect về frontend' })
  async handlePayOSReturn(
    @Query('billId') billId: string,
    @Query('code') code: string,
    @Query('id') paymentLinkId: string,
    @Query('cancel') cancel: string,
    @Query('status') status: string,
    @Query('orderCode') orderCode: string,
    @Res() res: any
  ) {
    const result = await this.billService.handlePayOSReturn({
      billId: parseInt(billId),
      code,
      paymentLinkId,
      cancel: cancel === 'true',
      status,
      orderCode: parseInt(orderCode)
    })

    // Redirect về frontend
    return res.redirect(result.redirect)
  }

  @Get('payments/payos/cancel')
  @IsPublic()
  @ApiOperation({ summary: 'PayOS cancel URL handler' })
  @ApiResponse({ status: 302, description: 'Redirect về frontend' })
  async handlePayOSCancel(
    @Query('billId') billId: string,
    @Query('code') code: string,
    @Query('id') paymentLinkId: string,
    @Query('cancel') cancel: string,
    @Query('status') status: string,
    @Query('orderCode') orderCode: string,
    @Res() res: any
  ) {
    const result = await this.billService.handlePayOSCancel({
      billId: parseInt(billId),
      code,
      paymentLinkId,
      cancel: cancel === 'true',
      status,
      orderCode: parseInt(orderCode)
    })

    // Redirect về frontend
    return res.redirect(result.redirect)
  }
}
