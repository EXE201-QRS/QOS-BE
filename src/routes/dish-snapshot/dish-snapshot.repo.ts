import { Injectable } from '@nestjs/common'

import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateDishSnapshotBodyType,
  DishSnapshotType,
  GetDishSnapshotesQueryType,
  GetDishSnapshotesResType
} from './dish-snapshot.model'

@Injectable()
export class DishSnapshotRepo {
  constructor(private prismaService: PrismaService) {}

  create({ data }: { data: CreateDishSnapshotBodyType }): Promise<DishSnapshotType> {
    return this.prismaService.dishSnapshot.create({
      data: {
        ...data
      }
    })
  }

  async list(pagination: GetDishSnapshotesQueryType): Promise<GetDishSnapshotesResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.dishSnapshot.count({
        where: {
          deletedAt: null
        }
      }),
      this.prismaService.dishSnapshot.findMany({
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

  findById(id: number): Promise<DishSnapshotType | null> {
    return this.prismaService.dishSnapshot.findUnique({
      where: {
        id,
        deletedAt: null
      }
    })
  }
}
