import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { IsPublic } from '@/common/decorators/auth.decorator'
import CustomZodValidationPipe from '@/common/pipes/custom-zod-validation.pipe'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateDishBodyDTO,
  GetDishDetailResDTO,
  GetDishesQueryDTO,
  GetDishesResDTO,
  GetDishParamsDTO,
  UpdateDishBodyDTO
} from './dish.dto'
import { DishService } from './dish.service'

@Controller('dish')
export class DishController {
  constructor(private readonly dishService: DishService) {}

  @Post()
  @ZodSerializerDto(GetDishDetailResDTO)
  create(
    @Body(new CustomZodValidationPipe(CreateDishBodyDTO)) body: CreateDishBodyDTO,
    @ActiveUser('userId') userId: number
  ) {
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

  @Get()
  @IsPublic()
  @ZodSerializerDto(GetDishesResDTO)
  list(@Query() query: GetDishesQueryDTO) {
    return this.dishService.list({
      page: query.page,
      limit: query.limit
    })
  }

  @Get(':dishId')
  @IsPublic()
  @ZodSerializerDto(GetDishDetailResDTO)
  findById(@Param() params: GetDishParamsDTO) {
    return this.dishService.findById(params.dishId)
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
