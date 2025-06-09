import { CreateNotificationType } from '@/routes/notification/notification.model'
import { NotificationRepo } from '@/routes/notification/notification.repo'
import { Injectable } from '@nestjs/common'

@Injectable()
export class WebsocketsService {
  constructor(private readonly notifcationRepo: NotificationRepo) {}

  createNotification(data: CreateNotificationType) {
    return this.notifcationRepo.create({ data })
  }
}
