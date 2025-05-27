import { Injectable } from '@nestjs/common'
import {
  CategoryType,
  CreateCategoryBodyType,
  GetCategoriesQueryType,
  GetCategoriesResType,
  UpdateCategoryBodyType
} from 'src/routes/category/category.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class CategoryRepo {
  constructor(private prismaService: PrismaService) {}

  create({
    createdById,
    data
  }: {
    createdById: number | null
    data: CreateCategoryBodyType
  }): Promise<CategoryType> {
    return this.prismaService.category.create({
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
    data: UpdateCategoryBodyType
  }): Promise<CategoryType> {
    return this.prismaService.category.update({
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
  ): Promise<CategoryType> {
    return isHard
      ? this.prismaService.category.delete({
          where: {
            id
          }
        })
      : this.prismaService.category.update({
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

  async list(pagination: GetCategoriesQueryType): Promise<GetCategoriesResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.category.count({
        where: {
          deletedAt: null
        }
      }),
      this.prismaService.category.findMany({
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

  findById(id: number): Promise<CategoryType | null> {
    return this.prismaService.category.findUnique({
      where: {
        id,
        deletedAt: null
      }
    })
  }
}
