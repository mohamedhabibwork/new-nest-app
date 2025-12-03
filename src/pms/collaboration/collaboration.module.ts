import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CollaborationController } from './collaboration.controller';
import { CollaborationService } from './collaboration.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { WebSocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    WebSocketModule,
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  controllers: [CollaborationController],
  providers: [CollaborationService],
  exports: [CollaborationService],
})
export class CollaborationModule {}
