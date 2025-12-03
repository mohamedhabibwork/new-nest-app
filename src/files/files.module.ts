import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { LocalStorageService } from './storage/local-storage.service';
import { S3StorageService } from './storage/s3-storage.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../pms/notifications/notifications.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    WebSocketModule,
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService, LocalStorageService, S3StorageService],
  exports: [FilesService],
})
export class FilesModule {}

