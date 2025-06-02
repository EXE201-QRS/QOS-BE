import {
  AccountType,
  CreateAccountBodyType,
  GetAccountsResType
} from '@/routes/account/account.model'
import { PaginationQueryType } from '@/shared/models/request.model'
import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class AccountRepository {
  constructor(private prismaService: PrismaService) {}

  async list(pagination: PaginationQueryType): Promise<GetAccountsResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.user.count({
        where: {
          deletedAt: null
        }
      }),
      this.prismaService.user.findMany({
        where: {
          deletedAt: null
        },
        skip,
        take,
        include: {
          role: true
        }
      })
    ])
    return {
      data,
      totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit)
    }
  }

  create({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateAccountBodyType
  }): Promise<AccountType> {
    return this.prismaService.user.create({
      data: {
        ...data,
        createdById
      }
    })
  }

  delete(
    {
      id,
      deletedById
    }: {
      id: number
      deletedById: number
    },
    isHard?: boolean
  ): Promise<AccountType> {
    return isHard
      ? this.prismaService.user.delete({
          where: {
            id
          }
        })
      : this.prismaService.user.update({
          where: {
            id,
            deletedAt: null
          },
          data: {
            deletedAt: new Date(),
            deletedById
          }
        })
  }
}
