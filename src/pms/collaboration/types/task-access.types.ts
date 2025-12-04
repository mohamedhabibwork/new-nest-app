import {
  Task,
  Project,
  Workspace,
  ProjectMember,
  Assignment,
} from '@prisma/client';

export interface TaskWithAccess extends Task {
  project: Project & {
    workspace: Workspace;
    projectMembers: ProjectMember[];
  };
  assignments: (Assignment & {
    assignee: {
      id: string;
    };
  })[];
}
