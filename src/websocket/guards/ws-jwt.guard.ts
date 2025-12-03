import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();
    const token = this.extractTokenFromHeader(client);

    if (!token) {
      throw new WsException('Unauthorized');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET') || 'your-secret-key',
      });
      client.data.user = payload;
      return true;
    } catch {
      throw new WsException('Unauthorized');
    }
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return undefined;
  }
}
