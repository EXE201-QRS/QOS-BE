import { NOTIFICATION_MESSAGE } from '@/common/constants/message'
import { NotFoundRecordException } from '@/shared/error'
import { isNotFoundPrismaError } from '@/shared/helpers'
import { PaginationQueryType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'
import { UpdateNotificationnBodyType } from './notification.model'
import { NotificationRepo } from './notification.repo'

@Injectable()
export class NotificationService {
  constructor(private notificationRepo: NotificationRepo) {}

  async update({ id, data }: { id: number; data: UpdateNotificationnBodyType }) {
    try {
      const dish = await this.notificationRepo.update({
        id,
        data
      })
      return {
        data: dish,
        message: NOTIFICATION_MESSAGE.UPDATED_SUCCESS
      }
    } catch (error) {
      // Handle not found pn (id)
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }

      throw error
    }
  }

  async list(pagination: PaginationQueryType) {
    const data = await this.notificationRepo.list(pagination)
    return data
  }

  async findById(id: number) {
    const notification = await this.notificationRepo.findById(id)
    if (!notification) {
      throw NotFoundRecordException
    }
    return notification
  }

  async delete({ id }: { id: number }) {
    try {
      await this.notificationRepo.delete({
        id
      })
      return {
        message: NOTIFICATION_MESSAGE.DELETED_SUCCESS
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
