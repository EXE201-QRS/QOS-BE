import { EVENT_SOCKET, ROOM_SOCKET } from '@/common/constants/event-socket.constant'
import { NotificationType } from '@/common/constants/notification.constant'
import { OnModuleInit } from '@nestjs/common'
import { MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import { SocketServerService } from './socket-server.service'
import { WebsocketsService } from './websockets.service'
@WebSocketGateway({ namespace: 'guest' })
export class GuestGateway implements OnModuleInit {
  private staffNamespace
  constructor(
    private readonly socketServerService: SocketServerService,
    private readonly socketService: WebsocketsService
  ) {}

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
  async handleCallStaff(@MessageBody() data: any) {
    const notiData = {
      type: NotificationType.SUPPORT,
      message: data.message || '',
      room: ROOM_SOCKET.STAFF_ROOM,
      tableNumber: data?.tableNumber
    }
    this.staffNamespace.emit(EVENT_SOCKET.CALL_STAFF, notiData)
    await this.socketService.createNotification(notiData)
    return data
  }
}
