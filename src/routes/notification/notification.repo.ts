import { Injectable } from '@nestjs/common'

import { PaginationQueryType } from '@/shared/models/request.model'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateNotificationType,
  GetNotificationnsResType,
  NotificationnType,
  UpdateNotificationnBodyType
} from './notification.model'

@Injectable()
export class NotificationRepo {
  constructor(private prismaService: PrismaService) {}

  create({ data }: { data: CreateNotificationType }): Promise<NotificationnType> {
    return this.prismaService.notification.create({
      data: {
        ...data
      }
    })
  }

  update({
    id,

    data
  }: {
    id: number
    data: UpdateNotificationnBodyType
  }): Promise<NotificationnType> {
    return this.prismaService.notification.update({
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
  ): Promise<NotificationnType> {
    return isHard
      ? this.prismaService.notification.delete({
          where: {
            id
          }
        })
      : this.prismaService.notification.update({
          where: {
            id,
            deletedAt: null
          },
          data: {
            deletedAt: new Date()
          }
        })
  }

  async list(pagination: PaginationQueryType): Promise<GetNotificationnsResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.notification.count({
        where: {
          deletedAt: null
        }
      }),
      this.prismaService.notification.findMany({
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

  findById(id: number): Promise<NotificationnType | null> {
    return this.prismaService.notification.findUnique({
      where: {
        id,
        deletedAt: null
      }
    })
  }
}
