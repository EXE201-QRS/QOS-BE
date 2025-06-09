import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'
@WebSocketGateway({ namespace: 'chef' })
export class ChefGateway {
  @WebSocketServer()
  server: Server
}
