import { ActiveUser } from '@/common/decorators/active-user.decorator'
import { IsPublic } from '@/common/decorators/auth.decorator'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateTableBodyDTO,
  GetTableDetailResDTO,
  GetTableesQueryDTO,
  GetTableesResDTO,
  GetTableParamsDTO,
  UpdateTableBodyDTO
} from './table.dto'
import { TableService } from './table.service'
@Controller('table')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post()
  @ZodSerializerDto(GetTableDetailResDTO)
  create(@Body() body: CreateTableBodyDTO, @ActiveUser('userId') userId: number) {
    return this.tableService.create({
      data: body,
      createdById: userId
    })
  }

  @Put(':tableId')
  @ZodSerializerDto(GetTableDetailResDTO)
  update(
    @Body() body: UpdateTableBodyDTO,
    @Param() params: GetTableParamsDTO,
    @ActiveUser('userId') userId: number
  ) {
    return this.tableService.update({
      data: body,
      id: params.tableId,
      updatedById: userId
    })
  }

  @Get()
  @IsPublic()
  @ZodSerializerDto(GetTableesResDTO)
  list(@Query() query: GetTableesQueryDTO) {
    return this.tableService.list({
      page: query.page,
      limit: query.limit
    })
  }

  @Get(':tableId')
  @IsPublic()
  @ZodSerializerDto(GetTableDetailResDTO)
  findById(@Param() params: GetTableParamsDTO) {
    return this.tableService.findById(params.tableId)
  }

  @Delete(':tableId')
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetTableParamsDTO, @ActiveUser('userId') userId: number) {
    return this.tableService.delete({
      id: params.tableId,
      deletedById: userId
    })
  }
}
