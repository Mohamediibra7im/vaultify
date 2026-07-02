import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true },
  namespace: '/ws',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token || (client.handshake.query?.token as string);
    if (!token) {
      client.disconnect();
      return;
    }
    try {
      const payload = await this.jwtService.verifyAsync(token);
      client.data.userId = payload.sub;
      client.join(`user:${client.data.userId}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(_client: Socket) {
    // Rooms auto-clean on disconnect; no manual cleanup needed
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, payload: { workspaceId?: string; userId?: string }) {
    if (payload.userId && payload.userId !== client.data.userId) {
      return { event: 'error', data: { message: 'userId does not match authenticated user' } };
    }

    // Join workspace room if provided
    if (payload.workspaceId) {
      client.join(`workspace:${payload.workspaceId}`);
    }

    return { event: 'subscribed', data: { success: true } };
  }

  // Emit to all users in a workspace
  emitToWorkspace(workspaceId: string, event: string, data: any) {
    this.server.to(`workspace:${workspaceId}`).emit(event, data);
  }

  // Emit to a specific user via their room
  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }
}
