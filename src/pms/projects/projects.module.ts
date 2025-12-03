import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
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
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
