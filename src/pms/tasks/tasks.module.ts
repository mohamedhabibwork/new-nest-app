import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { RbacModule } from '../rbac/rbac.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { WebSocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    PrismaModule,
    RbacModule,
    NotificationsModule,
    WebSocketModule,
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
