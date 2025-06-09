import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { IsPublic } from '@/common/decorators/auth.decorator'
import { PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateDishBodyDTO,
  GetDishDetailResDTO,
  GetDishDetailResWithCategoryDTO,
  GetDishesResDTO,
  GetDishParamsDTO,
  UpdateDishBodyDTO
} from './dish.dto'
import { DishService } from './dish.service'

@Controller('dishes')
export class DishController {
  constructor(private readonly dishService: DishService) {}

  @Get()
  @IsPublic()
  @ZodSerializerDto(GetDishesResDTO)
  list(@Query() query: PaginationQueryDTO) {
    return this.dishService.list({
      page: query.page,
      limit: query.limit
    })
  }

  @Get(':dishId')
  @IsPublic()
  @ZodSerializerDto(GetDishDetailResWithCategoryDTO)
  findById(@Param() params: GetDishParamsDTO) {
    return this.dishService.findById(params.dishId)
  }

  @Post()
  @ZodSerializerDto(GetDishDetailResDTO)
  create(@Body() body: CreateDishBodyDTO, @ActiveUser('userId') userId: number) {
    console.log(body)

    return this.dishService.create({
      data: body,
      createdById: userId
    })
  }

  @Put(':dishId')
  @ZodSerializerDto(GetDishDetailResDTO)
  update(
    @Body() body: UpdateDishBodyDTO,
    @Param() params: GetDishParamsDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.dishService.update({
      data: body,
      id: params.dishId,
      updatedById: userId
    })
  }

  @Delete(':dishId')
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetDishParamsDTO, @ActiveUser('userId') userId: number) {
    return this.dishService.delete({
      id: params.dishId,
      deletedById: userId
    })
  }
}
