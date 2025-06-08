import { EVENT_SOCKET } from '@/common/constants/event-socket.constant'
import { OnModuleInit } from '@nestjs/common'
import { MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import { SocketServerService } from './socket-server.service'
@WebSocketGateway({ namespace: 'guest' })
export class GuestGateway implements OnModuleInit {
  private staffNamespace
  constructor(private readonly socketServerService: SocketServerService) {}

  onModuleInit() {
    const server = this.socketServerService.server
    if (!server) {
      // Nếu server chưa khởi tạo, có thể log hoặc throw lỗi tùy ý
      throw new Error('Socket server not initialized on Gateway init')
    }
    this.staffNamespace = server.of('/staff')
  }
  //support
  @SubscribeMessage(EVENT_SOCKET.SUPPORT)
  handleCallStaff(@MessageBody() data: string) {
    this.staffNamespace.emit('call-staff', data)

    return { message: 'Message sent to staff' }
  }
}
