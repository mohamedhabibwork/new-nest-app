import { Module } from '@nestjs/common';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { ContactsModule } from '../contacts/contacts.module';
import { NotificationsModule } from '../../pms/notifications/notifications.module';

@Module({
  imports: [PrismaModule, ContactsModule, NotificationsModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
