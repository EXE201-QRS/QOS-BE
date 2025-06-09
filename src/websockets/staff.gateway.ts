import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'
@WebSocketGateway({ namespace: 'staff' })
export class StaffGateway {
  @WebSocketServer()
  server: Server
}
