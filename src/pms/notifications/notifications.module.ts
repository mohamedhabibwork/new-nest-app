import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationEventsService } from './notification-events.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { WebSocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    PrismaModule,
    WebSocketModule,
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationEventsService],
  exports: [NotificationsService, NotificationEventsService],
})
export class NotificationsModule {}
