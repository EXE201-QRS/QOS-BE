import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { IsPublic } from '@/common/decorators/auth.decorator'
import { PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateOrderBodyDTO,
  CreateOrderResDTO,
  GetOrderDetailResDTO,
  GetOrderesResDTO,
  GetOrderParamsDTO,
  UpdateOrderBodyDTO
} from './order.dto'
import { OrderService } from './order.service'

@Controller('orders')
export class OrderController {
  constructor(private readonly OrderService: OrderService) {}

  @Post()
  @ZodSerializerDto(CreateOrderResDTO)
  create(@Body() body: CreateOrderBodyDTO) {
    return this.OrderService.create({
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
    return this.OrderService.update({
      data: body,
      id: params.OrderId,
      updatedById: userId
    })
  }

  @Get()
  @IsPublic()
  @ZodSerializerDto(GetOrderesResDTO)
  list(@Query() query: PaginationQueryDTO) {
    return this.OrderService.list({
      page: query.page,
      limit: query.limit
    })
  }

  @Get(':orderId')
  @IsPublic()
  @ZodSerializerDto(GetOrderDetailResDTO)
  findById(@Param() params: GetOrderParamsDTO) {
    return this.OrderService.findById(params.OrderId)
  }

  @Delete(':orderId')
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetOrderParamsDTO, @ActiveUser('userId') userId: number) {
    return this.OrderService.delete({
      id: params.OrderId,
      deletedById: userId
    })
  }
}
