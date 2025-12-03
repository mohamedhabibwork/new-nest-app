import { Module } from '@nestjs/common';
import { AuthGrpcController } from './auth-grpc.controller';
import { WorkspacesGrpcController } from './workspaces-grpc.controller';
import { ProjectsGrpcController } from './projects-grpc.controller';
import { TasksGrpcController } from './tasks-grpc.controller';
import { CollaborationGrpcController } from './collaboration-grpc.controller';
import { NotificationsGrpcController } from './notifications-grpc.controller';
import { FilesGrpcController } from './files-grpc.controller';
import { GrpcDocumentationController } from './grpc-documentation.controller';
import { AuthModule } from '../auth/auth.module';
import { WorkspacesModule } from '../pms/workspaces/workspaces.module';
import { ProjectsModule } from '../pms/projects/projects.module';
import { TasksModule } from '../pms/tasks/tasks.module';
import { CollaborationModule } from '../pms/collaboration/collaboration.module';
import { NotificationsModule } from '../pms/notifications/notifications.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    AuthModule,
    WorkspacesModule,
    ProjectsModule,
    TasksModule,
    CollaborationModule,
    NotificationsModule,
    FilesModule,
  ],
  controllers: [
    AuthGrpcController,
    WorkspacesGrpcController,
    ProjectsGrpcController,
    TasksGrpcController,
    CollaborationGrpcController,
    NotificationsGrpcController,
    FilesGrpcController,
    GrpcDocumentationController,
  ],
})
export class GrpcModule {}
