import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { QueueModule } from './queue/queue.module';
import { GrpcModule } from './grpc/grpc.module';
import { WebSocketModule } from './websocket/websocket.module';
import { CsrfModule } from './csrf/csrf.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}.local`,
        `.env.${process.env.NODE_ENV || 'development'}`,
        '.env.local',
        '.env',
      ],
      expandVariables: true,
    }),
    PrismaModule,
    QueueModule,
    AuthModule,
    HealthModule,
    GrpcModule,
    WebSocketModule,
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minute
        limit: 10, // 10 requests per minute
      },
    ]),
    CsrfModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
