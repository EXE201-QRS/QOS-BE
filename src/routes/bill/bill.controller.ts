import { BILL_MESSAGE } from '@/common/constants/message'
import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { IsPublic } from '@/common/decorators/auth.decorator'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { Controller, Delete, Get, Param, Post, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateBillParamsDTO,
  CreateBillResDTO,
  GetBillByTableParamsDTO,
  GetBillDetailResDTO,
  GetBillParamsDTO,
  GetBillPreviewResDTO,
  GetBillQueryDTO,
  GetBillsResDTO
} from './bill.dto'
import { BillService } from './bill.service'

@Controller('bills')
export class BillController {
  constructor(private readonly billService: BillService) {}

  @Post('create/:tableNumber')
  @ZodSerializerDto(CreateBillResDTO)
  async createBill(
    @Param() params: CreateBillParamsDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.billService.createBill({
      tableNumber: params.tableNumber,
      createdById: userId
    })
  }

  @Get('preview/:tableNumber')
  @IsPublic()
  @ZodSerializerDto(GetBillPreviewResDTO)
  async previewBill(@Param() params: CreateBillParamsDTO) {
    const data = await this.billService.previewBill(params.tableNumber)
    return {
      data,
      message: BILL_MESSAGE.PREVIEW_SUCCESS
    }
  }

  @Get('table/:tableNumber')
  @IsPublic()
  @ZodSerializerDto(GetBillsResDTO)
  async findByTableNumber(@Param() params: GetBillByTableParamsDTO) {
    const bills = await this.billService.findByTableNumber(params.tableNumber)
    return {
      data: bills,
      totalItems: bills.length,
      page: 1,
      limit: bills.length,
      totalPages: 1
    }
  }

  @Get()
  @ZodSerializerDto(GetBillsResDTO)
  async list(@Query() query: GetBillQueryDTO) {
    return this.billService.list({
      page: query.page,
      limit: query.limit,
      tableNumber: query.tableNumber,
      paymentStatus: query.paymentStatus,
      startDate: query.startDate,
      endDate: query.endDate
    })
  }

  @Get(':billId')
  @ZodSerializerDto(GetBillDetailResDTO)
  async findById(@Param() params: GetBillParamsDTO) {
    const data = await this.billService.findById(params.billId)
    return {
      data,
      message: BILL_MESSAGE.GET_SUCCESS
    }
  }

  @Delete(':billId')
  @ZodSerializerDto(MessageResDTO)
  async delete(@Param() params: GetBillParamsDTO, @ActiveUser('userId') userId: number) {
    return this.billService.delete({
      id: params.billId,
      deletedById: userId
    })
  }
}
