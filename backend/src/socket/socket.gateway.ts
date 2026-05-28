import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private activeClients = new Map<string, string>(); // socketId -> userId

  handleConnection(client: Socket) {
    // console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.activeClients.get(client.id);
    if (userId) {
      this.activeClients.delete(client.id);
      // console.log(`User ${userId} disconnected (Socket ${client.id})`);
    }
  }

  @SubscribeMessage('subscribe_admin')
  handleSubscribeAdmin(client: Socket, payload: { adminId: string }) {
    client.join('admins');
    // console.log(`Admin ${payload.adminId} subscribed to real-time events.`);
    return { status: 'subscribed' };
  }

  @SubscribeMessage('register_user')
  handleRegisterUser(client: Socket, payload: { userId: string }) {
    this.activeClients.set(client.id, payload.userId);
    // console.log(`User ${payload.userId} registered on socket ${client.id}`);
    return { status: 'registered' };
  }

  broadcastToAdmins(event: string, data: any) {
    if (this.server) {
      this.server.to('admins').emit(event, data);
    }
  }

  broadcastToAll(event: string, data: any) {
    if (this.server) {
      this.server.emit(event, data);
    }
  }
}
