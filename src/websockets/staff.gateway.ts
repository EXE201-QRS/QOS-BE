import { EVENT_SOCKET } from '@/common/constants/event-socket.constant'
import { OnModuleInit } from '@nestjs/common'
import { WebSocketGateway } from '@nestjs/websockets'
import { SocketServerService } from './socket-server.service'
@WebSocketGateway({ namespace: 'staff' })
export class StaffGateway implements OnModuleInit {
  private guestNamespace
  constructor(private readonly socketServerService: SocketServerService) {}
  onModuleInit() {
    const server = this.socketServerService.server
    if (!server) {
      // Nếu server chưa khởi tạo, có thể log hoặc throw lỗi tùy ý
      throw new Error('Socket server not initialized on Gateway init')
    }
    this.guestNamespace = server.of('/guest')
  }

  sendOrderToGuest(tableNumber: number) {
    this.guestNamespace.to(`table-${tableNumber}`).emit(EVENT_SOCKET.UPDATE_ORDER)
  }
}
