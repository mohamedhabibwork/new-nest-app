import { Module } from '@nestjs/common';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';
import { WorkspaceInvitationService } from './services/workspace-invitation.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { RbacModule } from '../rbac/rbac.module';
import { QueueModule } from '../../queue/queue.module';

@Module({
  imports: [PrismaModule, RbacModule, QueueModule],
  controllers: [WorkspacesController],
  providers: [WorkspacesService, WorkspaceInvitationService],
  exports: [WorkspacesService, WorkspaceInvitationService],
})
export class WorkspacesModule {}
