import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { IsPublic } from '@/common/decorators/auth.decorator'
import { PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateOrderBodyDTO,
  CreateOrderResDTO,
  GetOrderByTableNumberResDTO,
  GetOrderDetailResDTO,
  GetOrderesResDTO,
  GetOrderParamsDTO,
  GetOrderTableNumberParamsDTO,
  UpdateOrderBodyDTO
} from './order.dto'
import { GetOrderDetailResWithFullDataSchema } from './order.model'
import { OrderService } from './order.service'

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @IsPublic()
  @ZodSerializerDto(CreateOrderResDTO)
  create(@Body() body: CreateOrderBodyDTO) {
    return this.orderService.create({
      data: body
    })
  }

  @Put(':orderId')
  @ZodSerializerDto(GetOrderDetailResDTO)
  update(
    @Body() body: UpdateOrderBodyDTO,
    @Param() params: GetOrderParamsDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.orderService.update({
      data: body,
      id: params.orderId,
      updatedById: userId
    })
  }

  @Get()
  @IsPublic()
  @ZodSerializerDto(GetOrderesResDTO)
  list(@Query() query: PaginationQueryDTO) {
    return this.orderService.list({
      page: query.page,
      limit: query.limit
    })
  }
  @Get('details/:tableNumber')
  @IsPublic()
  @ZodSerializerDto(GetOrderByTableNumberResDTO)
  listByTable(@Param() params: GetOrderTableNumberParamsDTO) {
    return this.orderService.getListByTableNumber(params.tableNumber)
  }

  @Get(':orderId')
  @IsPublic()
  @ZodSerializerDto(GetOrderDetailResWithFullDataSchema)
  findById(@Param() params: GetOrderParamsDTO) {
    return this.orderService.findById(params.orderId)
  }

  @Delete(':orderId')
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetOrderParamsDTO, @ActiveUser('userId') userId: number) {
    return this.orderService.delete({
      id: params.orderId,
      deletedById: userId
    })
  }
}
