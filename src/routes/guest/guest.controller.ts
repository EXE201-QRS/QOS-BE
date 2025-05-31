import { IsPublic } from '@/common/decorators/auth.decorator'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateGuestBodyDTO,
  GetGuestDetailResDTO,
  GetGuestParamsDTO,
  GetGuestsQueryDTO,
  GetGuestsResDTO,
  UpdateGuestBodyDTO
} from './guest.dto'
import { GuestService } from './guest.service'
@Controller('guests')
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Post()
  @IsPublic()
  @ZodSerializerDto(GetGuestDetailResDTO)
  create(@Body() body: CreateGuestBodyDTO) {
    return this.guestService.create({
      data: body
    })
  }

  @Put(':guestId')
  @ZodSerializerDto(GetGuestDetailResDTO)
  update(@Body() body: UpdateGuestBodyDTO, @Param() params: GetGuestParamsDTO) {
    return this.guestService.update({
      data: body,
      id: params.guestId
    })
  }

  @Get()
  @IsPublic()
  @ZodSerializerDto(GetGuestsResDTO)
  list(@Query() query: GetGuestsQueryDTO) {
    return this.guestService.list({
      page: query.page,
      limit: query.limit
    })
  }

  @Get(':guestId')
  @IsPublic()
  @ZodSerializerDto(GetGuestDetailResDTO)
  findById(@Param() params: GetGuestParamsDTO) {
    return this.guestService.findById(params.guestId)
  }

  @Delete(':guestId')
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetGuestParamsDTO) {
    return this.guestService.delete({
      id: params.guestId
    })
  }
}
