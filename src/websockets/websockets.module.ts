import { NotificationRepo } from '@/routes/notification/notification.repo'
import { Module } from '@nestjs/common'
import { ChefGateway } from './chef.gateway'
import { GuestGateway } from './guest.gateway'
import { InitializerGateway } from './initializer.gateway'
import { SocketServerService } from './socket-server.service'
import { StaffGateway } from './staff.gateway'
import { WebsocketsService } from './websockets.service'

@Module({
  providers: [
    WebsocketsService,
    GuestGateway,
    ChefGateway,
    StaffGateway,
    SocketServerService,
    InitializerGateway,
    NotificationRepo
  ],
  exports: [
    WebsocketsService,
    SocketServerService,
    GuestGateway,
    StaffGateway,
    ChefGateway
  ]
})
export class WebsocketsModule {}
