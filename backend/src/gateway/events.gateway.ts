import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface CursorPosition {
  userId: string;
  userName: string;
  color: string;
  line: number;
  column: number;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private activeUsers = new Map<string, { reviewId: string; userId: string; userName: string; color: string }>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userData = this.activeUsers.get(client.id);
    if (userData) {
      this.server.to(userData.reviewId).emit('user:left', { userId: userData.userId, userName: userData.userName });
      client.leave(userData.reviewId);
      this.activeUsers.delete(client.id);
      this.broadcastActiveUsers(userData.reviewId);
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('review:join')
  handleJoinReview(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { reviewId: string; userId: string; userName: string; color: string },
  ) {
    client.join(data.reviewId);
    this.activeUsers.set(client.id, data);
    this.server.to(data.reviewId).emit('user:joined', { userId: data.userId, userName: data.userName, color: data.color });
    this.broadcastActiveUsers(data.reviewId);
    return { event: 'review:joined', data: { success: true } };
  }

  @SubscribeMessage('review:leave')
  handleLeaveReview(@ConnectedSocket() client: Socket) {
    const userData = this.activeUsers.get(client.id);
    if (userData) {
      client.leave(userData.reviewId);
      this.server.to(userData.reviewId).emit('user:left', { userId: userData.userId, userName: userData.userName });
      this.activeUsers.delete(client.id);
      this.broadcastActiveUsers(userData.reviewId);
    }
  }

  @SubscribeMessage('cursor:move')
  handleCursorMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CursorPosition & { reviewId: string },
  ) {
    client.to(data.reviewId).emit('cursor:updated', data);
  }

  @SubscribeMessage('comment:new')
  handleNewComment(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { reviewId: string; comment: any },
  ) {
    this.server.to(data.reviewId).emit('comment:added', data.comment);
  }

  @SubscribeMessage('code:change')
  handleCodeChange(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { reviewId: string; changes: any },
  ) {
    client.to(data.reviewId).emit('code:updated', data.changes);
  }

  private broadcastActiveUsers(reviewId: string) {
    const usersInRoom = Array.from(this.activeUsers.values()).filter(u => u.reviewId === reviewId);
    this.server.to(reviewId).emit('users:active', usersInRoom);
  }
}
