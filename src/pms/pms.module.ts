import { Module } from '@nestjs/common';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { CollaborationModule } from './collaboration/collaboration.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TeamsModule } from './teams/teams.module';
import { RbacModule } from './rbac/rbac.module';

@Module({
  imports: [
    RbacModule,
    WorkspacesModule,
    ProjectsModule,
    TasksModule,
    CollaborationModule,
    NotificationsModule,
    TeamsModule,
  ],
  exports: [
    RbacModule,
    WorkspacesModule,
    ProjectsModule,
    TasksModule,
    CollaborationModule,
    NotificationsModule,
    TeamsModule,
  ],
})
export class PmsModule {}

