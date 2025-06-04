import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { IsPublic } from '@/common/decorators/auth.decorator'
import { PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateCategoryBodyDTO,
  GetCategoriesResDTO,
  GetCategoryDetailResDTO,
  GetCategoryParamsDTO,
  UpdateCategoryBodyDTO
} from './category.dto'
import { CategoryService } from './category.service'

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @IsPublic()
  @ZodSerializerDto(GetCategoriesResDTO)
  list(@Query() query: PaginationQueryDTO) {
    return this.categoryService.list({
      page: query.page,
      limit: query.limit
    })
  }

  @Get(':categoryId')
  @IsPublic()
  @ZodSerializerDto(GetCategoryDetailResDTO)
  findById(@Param() params: GetCategoryParamsDTO) {
    return this.categoryService.findById(params.categoryId)
  }

  @Post()
  @ZodSerializerDto(GetCategoryDetailResDTO)
  create(@Body() body: CreateCategoryBodyDTO, @ActiveUser('userId') userId: number) {
    return this.categoryService.create({
      data: body,
      createdById: userId
    })
  }

  @Put(':categoryId')
  @ZodSerializerDto(GetCategoryDetailResDTO)
  update(
    @Body() body: UpdateCategoryBodyDTO,
    @Param() params: GetCategoryParamsDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.categoryService.update({
      data: body,
      id: params.categoryId,
      updatedById: userId
    })
  }

  @Delete(':categoryId')
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetCategoryParamsDTO, @ActiveUser('userId') userId: number) {
    return this.categoryService.delete({
      id: params.categoryId,
      deletedById: userId
    })
  }
}
