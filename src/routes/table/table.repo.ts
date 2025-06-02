import { Injectable } from '@nestjs/common'
import {
  CreateTableBodyType,
  GetTablesQueryType,
  GetTablesResType,
  TableType,
  UpdateTableBodyType
} from 'src/routes/table/table.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class TableRepo {
  constructor(private prismaService: PrismaService) {}

  create({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateTableBodyType
  }): Promise<TableType> {
    return this.prismaService.table.create({
      data: {
        ...data,
        createdById
      }
    })
  }

  findByNumber(number: number): Promise<TableType | null> {
    return this.prismaService.table.findFirst({
      where: {
        number,
        deletedAt: null
      }
    })
  }

  findByNumberAndToken(number: number, token: string): Promise<TableType | null> {
    return this.prismaService.table.findFirst({
      where: {
        number,
        token,
        deletedAt: null
      }
    })
  }

  findByNumberExcludeSelf(number: number, excludeId: number): Promise<TableType | null> {
    return this.prismaService.table.findFirst({
      where: {
        number,
        deletedAt: null,
        id: {
          not: excludeId
        }
      }
    })
  }

  update({
    id,
    updatedById,
    data
  }: {
    id: number
    updatedById: number
    data: UpdateTableBodyType
  }): Promise<TableType> {
    return this.prismaService.table.update({
      where: {
        id,
        deletedAt: null
      },
      data: {
        ...data,
        updatedById
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
  ): Promise<TableType> {
    return isHard
      ? this.prismaService.table.delete({
          where: {
            id
          }
        })
      : this.prismaService.table.update({
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

  async list(pagination: GetTablesQueryType): Promise<GetTablesResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.table.count({
        where: {
          deletedAt: null
        }
      }),
      this.prismaService.table.findMany({
        where: {
          deletedAt: null
        },
        skip,
        take
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

  findById(id: number): Promise<TableType | null> {
    return this.prismaService.table.findUnique({
      where: {
        id,
        deletedAt: null
      }
    })
  }
}
