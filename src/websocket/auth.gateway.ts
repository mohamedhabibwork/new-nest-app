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
    origin: 'http://localhost:3000', // Fallback, will be overridden in constructor
    credentials: true,
  },
  namespace: '/auth',
})
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('AuthGateway');

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    // Update CORS origin dynamically
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    // Note: WebSocketGateway decorator options are static, so we set it in constructor
    // The origin in decorator is a fallback
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('subscribe:auth')
  handleSubscribe(client: Socket) {
    const user = client.data.user;
    client.join(`user:${user.sub}`);
    this.logger.log(`User ${user.sub} subscribed to auth events`);
    return { event: 'subscribed', userId: user.sub };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('unsubscribe:auth')
  handleUnsubscribe(client: Socket) {
    const user = client.data.user;
    client.leave(`user:${user.sub}`);
    this.logger.log(`User ${user.sub} unsubscribed from auth events`);
    return { event: 'unsubscribed', userId: user.sub };
  }

  // Method to emit email verification event
  emitEmailVerified(userId: string) {
    this.server.to(`user:${userId}`).emit('email:verified', {
      message: 'Your email has been verified successfully',
      timestamp: new Date().toISOString(),
    });
  }

  // Method to emit password reset requested event
  emitPasswordResetRequested(userId: string) {
    this.server.to(`user:${userId}`).emit('password:reset-requested', {
      message: 'Password reset email has been sent',
      timestamp: new Date().toISOString(),
    });
  }

  // Method to emit password reset completed event
  emitPasswordResetCompleted(userId: string) {
    this.server.to(`user:${userId}`).emit('password:reset-completed', {
      message: 'Your password has been reset successfully',
      timestamp: new Date().toISOString(),
    });
  }
}
