import { Module } from '@nestjs/common'
import { GuestGateway } from './guest.gateway'
import { SocketServerService } from './socket-server.service'
import { StaffGateway } from './staff.gateway'
import { WebsocketsService } from './websockets.service'

@Module({
  providers: [WebsocketsService, GuestGateway, StaffGateway, SocketServerService],
  exports: [WebsocketsService, SocketServerService]
})
export class WebsocketsModule {}
