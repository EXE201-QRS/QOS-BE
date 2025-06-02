import { Injectable } from '@nestjs/common'
import {
  CreateGuestBodyType,
  GetGuestsQueryType,
  GetGuestsResType,
  GuestType,
  UpdateGuestBodyType
} from 'src/routes/guest/guest.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class GuestRepo {
  constructor(private prismaService: PrismaService) {}

  create({ data }: { data: CreateGuestBodyType }): Promise<GuestType> {
    return this.prismaService.guest.create({
      data: {
        ...data
      }
    })
  }

  update({ id, data }: { id: number; data: UpdateGuestBodyType }): Promise<GuestType> {
    return this.prismaService.guest.update({
      where: {
        id,
        deletedAt: null
      },
      data: {
        ...data
      }
    })
  }

  delete(
    {
      id
    }: {
      id: number
    },
    isHard?: boolean
  ): Promise<GuestType> {
    return isHard
      ? this.prismaService.guest.delete({
          where: {
            id
          }
        })
      : this.prismaService.guest.update({
          where: {
            id,
            deletedAt: null
          },
          data: {
            deletedAt: new Date()
          }
        })
  }

  async list(pagination: GetGuestsQueryType): Promise<GetGuestsResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.guest.count({
        where: {
          deletedAt: null
        }
      }),
      this.prismaService.guest.findMany({
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

  findById(id: number): Promise<GuestType | null> {
    return this.prismaService.guest.findUnique({
      where: {
        id,
        deletedAt: null
      }
    })
  }
}
