import { Module } from '@nestjs/common';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { CollaborationModule } from './collaboration/collaboration.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TeamsModule } from './teams/teams.module';
import { RbacModule } from './rbac/rbac.module';
import { SharesModule } from './shares/shares.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { TagsModule } from './tags/tags.module';

@Module({
  imports: [
    RbacModule,
    WorkspacesModule,
    ProjectsModule,
    TasksModule,
    CollaborationModule,
    NotificationsModule,
    TeamsModule,
    SharesModule,
    AssignmentsModule,
    TagsModule,
  ],
  exports: [
    RbacModule,
    WorkspacesModule,
    ProjectsModule,
    TasksModule,
    CollaborationModule,
    NotificationsModule,
    TeamsModule,
    SharesModule,
    AssignmentsModule,
    TagsModule,
  ],
})
export class PmsModule {}
