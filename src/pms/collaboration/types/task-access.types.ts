import { Task, Project, Workspace, ProjectMember, TaskAssignment } from '@prisma/client';

export interface TaskWithAccess extends Task {
  project: Project & {
    workspace: Workspace;
    projectMembers: ProjectMember[];
  };
  taskAssignments: (TaskAssignment & {
    user: {
      id: string;
    };
  })[];
}

