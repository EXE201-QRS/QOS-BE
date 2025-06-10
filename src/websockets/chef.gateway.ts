import { EVENT_SOCKET } from '@/common/constants/event-socket.constant'
import { WebSocketGateway } from '@nestjs/websockets'
import { SocketServerService } from './socket-server.service'
@WebSocketGateway({ namespace: 'chef' })
export class ChefGateway {
  private guestNamespace
  private staffNamespace
  constructor(private readonly socketServerService: SocketServerService) {}
  onModuleInit() {
    const server = this.socketServerService.server
    if (!server) {
      // Nếu server chưa khởi tạo, có thể log hoặc throw lỗi tùy ý
      throw new Error('Socket server not initialized on Gateway init')
    }
    this.guestNamespace = server.of('/guest')
    this.staffNamespace = server.of('/staff')
  }

  handleUpdateOrder(data: { order: any; tableNumber: number }) {
    this.guestNamespace
      .to(`table-${data.tableNumber}`)
      .emit(EVENT_SOCKET.UPDATE_ORDER, data.order)
    this.staffNamespace.emit(EVENT_SOCKET.UPDATE_ORDER, data.order)
  }
}
