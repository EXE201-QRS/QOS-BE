import { Injectable } from '@nestjs/common'
import {
  CreateDishBodyType,
  DishType,
  GetDishesQueryType,
  GetDishesResType,
  UpdateDishBodyType
} from 'src/routes/dish/dish.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class DishRepo {
  constructor(private prismaService: PrismaService) {}

  create({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateDishBodyType
  }): Promise<DishType> {
    return this.prismaService.dish.create({
      data: {
        ...data,
        createdById
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
    data: UpdateDishBodyType
  }): Promise<DishType> {
    return this.prismaService.dish.update({
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
  ): Promise<DishType> {
    return isHard
      ? this.prismaService.dish.delete({
          where: {
            id
          }
        })
      : this.prismaService.dish.update({
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

  async list(pagination: GetDishesQueryType): Promise<GetDishesResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.dish.count({
        where: {
          deletedAt: null
        }
      }),
      this.prismaService.dish.findMany({
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

  findById(id: number): Promise<DishType | null> {
    return this.prismaService.dish.findUnique({
      where: {
        id,
        deletedAt: null
      }
    })
  }
}
