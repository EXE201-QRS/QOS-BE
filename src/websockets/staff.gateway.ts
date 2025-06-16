import { EVENT_SOCKET } from '@/common/constants/event-socket.constant'
import { OnModuleInit } from '@nestjs/common'
import { WebSocketGateway } from '@nestjs/websockets'
import { SocketServerService } from './socket-server.service'
@WebSocketGateway({ namespace: 'staff' })
export class StaffGateway implements OnModuleInit {
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

  sendOrderToGuest(tableNumber: number) {
    this.guestNamespace.to(`table-${tableNumber}`).emit(EVENT_SOCKET.UPDATE_ORDER)
  }

  // Thông báo cho staff khi có order SHIPPED cần deliver
  notifyShippedOrderToStaff(order: any) {
    this.staffNamespace.emit(EVENT_SOCKET.ORDER_READY_FOR_DELIVERY, order)
  }

  // Thông báo cho guest khi staff đã deliver order
  notifyOrderDeliveredToGuest(tableNumber: number, order: any) {
    // Gửi order info đầy đủ cho guest
    this.guestNamespace
      .to(`table-${tableNumber}`)
      .emit(EVENT_SOCKET.ORDER_DELIVERED, order)
    // Cũng gửi general update event
    this.guestNamespace.to(`table-${tableNumber}`).emit(EVENT_SOCKET.UPDATE_ORDER, order)
  }
}
