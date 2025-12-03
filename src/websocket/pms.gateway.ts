import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { AuthService } from '../auth/auth.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/pms',
})
export class PmsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('PmsGateway');

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('subscribe:workspace')
  handleSubscribeWorkspace(client: Socket, payload: { workspaceId: string }) {
    const user = client.data.user;
    const room = `workspace:${payload.workspaceId}`;
    client.join(room);
    this.logger.log(`User ${user.sub} subscribed to workspace ${payload.workspaceId}`);
    return { event: 'subscribed', workspaceId: payload.workspaceId };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('unsubscribe:workspace')
  handleUnsubscribeWorkspace(client: Socket, payload: { workspaceId: string }) {
    const user = client.data.user;
    const room = `workspace:${payload.workspaceId}`;
    client.leave(room);
    this.logger.log(`User ${user.sub} unsubscribed from workspace ${payload.workspaceId}`);
    return { event: 'unsubscribed', workspaceId: payload.workspaceId };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('subscribe:project')
  handleSubscribeProject(client: Socket, payload: { projectId: string }) {
    const user = client.data.user;
    const room = `project:${payload.projectId}`;
    client.join(room);
    this.logger.log(`User ${user.sub} subscribed to project ${payload.projectId}`);
    return { event: 'subscribed', projectId: payload.projectId };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('unsubscribe:project')
  handleUnsubscribeProject(client: Socket, payload: { projectId: string }) {
    const user = client.data.user;
    const room = `project:${payload.projectId}`;
    client.leave(room);
    this.logger.log(`User ${user.sub} unsubscribed from project ${payload.projectId}`);
    return { event: 'unsubscribed', projectId: payload.projectId };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('subscribe:task')
  handleSubscribeTask(client: Socket, payload: { taskId: string }) {
    const user = client.data.user;
    const room = `task:${payload.taskId}`;
    client.join(room);
    this.logger.log(`User ${user.sub} subscribed to task ${payload.taskId}`);
    return { event: 'subscribed', taskId: payload.taskId };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('unsubscribe:task')
  handleUnsubscribeTask(client: Socket, payload: { taskId: string }) {
    const user = client.data.user;
    const room = `task:${payload.taskId}`;
    client.leave(room);
    this.logger.log(`User ${user.sub} unsubscribed from task ${payload.taskId}`);
    return { event: 'unsubscribed', taskId: payload.taskId };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('subscribe:notifications')
  handleSubscribeNotifications(client: Socket) {
    const user = client.data.user;
    const room = `user:${user.sub}`;
    client.join(room);
    this.logger.log(`User ${user.sub} subscribed to notifications`);
    return { event: 'subscribed', userId: user.sub };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('unsubscribe:notifications')
  handleUnsubscribeNotifications(client: Socket) {
    const user = client.data.user;
    const room = `user:${user.sub}`;
    client.leave(room);
    this.logger.log(`User ${user.sub} unsubscribed from notifications`);
    return { event: 'unsubscribed', userId: user.sub };
  }
}

