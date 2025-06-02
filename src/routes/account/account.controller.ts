import { ActiveRolePermissions } from '@/common/decorators/active-role-permissions.decorator'
import { ActiveUser } from '@/common/decorators/active-user.decorator'
import {
  CreateAccountBodyDTO,
  CreateAccountResDTO,
  GetAccountParamsDTO,
  GetAccountsResDTO,
  UpdateAccountBodyDTO
} from '@/routes/account/account.dto'
import { PaginationQueryDTO } from '@/shared/dtos/request.dto'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import {
  GetAccountProfileResDTO,
  UpdateProfileResDTO
} from '@/shared/dtos/shared-user.dto'
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { AccountService } from './account.service'

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  @ZodSerializerDto(GetAccountsResDTO)
  list(@Query() query: PaginationQueryDTO) {
    return this.accountService.list({
      page: query.page,
      limit: query.limit
    })
  }

  @Get(':accountId')
  @ZodSerializerDto(GetAccountProfileResDTO)
  findById(@Param() params: GetAccountParamsDTO) {
    return this.accountService.findById(params.accountId)
  }

  @Post()
  @ZodSerializerDto(CreateAccountResDTO)
  create(
    @Body() body: CreateAccountBodyDTO,
    @ActiveUser('userId') accountId: number,
    @ActiveRolePermissions('name') roleName: string
  ) {
    return this.accountService.create({
      data: body,
      createdById: accountId,
      createdByRoleName: roleName
    })
  }

  @Put(':accountId')
  @ZodSerializerDto(UpdateProfileResDTO)
  update(
    @Body() body: UpdateAccountBodyDTO,
    @Param() params: GetAccountParamsDTO,
    @ActiveUser('userId') accountId: number,
    @ActiveRolePermissions('name') roleName: string
  ) {
    return this.accountService.update({
      data: body,
      id: params.accountId,
      updatedById: accountId,
      updatedByRoleName: roleName
    })
  }

  @Delete(':accountId')
  @ZodSerializerDto(MessageResDTO)
  delete(
    @Param() params: GetAccountParamsDTO,
    @ActiveUser('userId') accountId: number,
    @ActiveRolePermissions('name') roleName: string
  ) {
    return this.accountService.delete({
      id: params.accountId,
      deletedById: accountId,
      deletedByRoleName: roleName
    })
  }
}
