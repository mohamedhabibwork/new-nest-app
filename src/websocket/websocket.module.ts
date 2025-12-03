import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthGateway } from './auth.gateway';
import { PmsGateway } from './pms.gateway';
import { WebSocketEventsService } from './websocket-events.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'your-secret-key',
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthGateway, PmsGateway, WebSocketEventsService, WsJwtGuard],
  exports: [AuthGateway, PmsGateway, WebSocketEventsService],
})
export class WebSocketModule {}
