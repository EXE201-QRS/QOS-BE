import { IsPublic } from '@/common/decorators/auth.decorator'
import { Controller, Get, Param, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { GetDishesResDTO } from '../dish/dish.dto'
import {
  GetDishSnapshotDetailResDTO,
  GetDishSnapshotesQueryDTO,
  GetDishSnapshotParamsDTO
} from './dish-snapshot.dto'
import { DishSnapshotService } from './dish-snapshot.service'

@Controller('dish-snapshots')
export class DishSnapshotController {
  constructor(private readonly dishSnapshotService: DishSnapshotService) {}

  @Get()
  @IsPublic()
  @ZodSerializerDto(GetDishesResDTO)
  list(@Query() query: GetDishSnapshotesQueryDTO) {
    return this.dishSnapshotService.list({
      page: query.page,
      limit: query.limit
    })
  }

  @Get(':dishId')
  @IsPublic()
  @ZodSerializerDto(GetDishSnapshotDetailResDTO)
  findById(@Param() params: GetDishSnapshotParamsDTO) {
    return this.dishSnapshotService.findById(params.dishSnapshotId)
  }
}
