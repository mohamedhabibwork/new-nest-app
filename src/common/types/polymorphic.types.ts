import { Prisma } from '@prisma/client';

/**
 * Base interface for polymorphic entities
 */
export interface PolymorphicEntity {
  id: string;
}

/**
 * User information for mentions and assignments
 */
export interface UserInfo {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

/**
 * Project member information
 */
export interface ProjectMemberInfo {
  userId: string;
  memberRole: string;
}

/**
 * Assignment information
 */
export interface AssignmentInfo {
  assigneeId: string;
  status: string;
  priority: string;
}

/**
 * Task with project relation
 */
export type TaskWithProject = Prisma.TaskGetPayload<{
  include: {
    project: {
      include: {
        workspace: {
          select: {
            id: true;
            ownerId: true;
          };
        };
        projectMembers: {
          select: {
            userId: true;
            memberRole: true;
          };
        };
      };
    };
  };
}>;

/**
 * Project with members relation
 */
export type ProjectWithMembers = Prisma.ProjectGetPayload<{
  include: {
    projectMembers: {
      select: {
        userId: true;
        memberRole: true;
      };
    };
    workspace: {
      select: {
        id: true;
        ownerId: true;
      };
    };
  };
}>;

/**
 * Ticket with contact relation
 */
export type TicketWithContact = Prisma.TicketGetPayload<{
  include: {
    contact: {
      select: {
        id: true;
        email: true;
        firstName: true;
        lastName: true;
      };
    };
  };
}>;

/**
 * Mention with user relation
 */
export type MentionWithUser = Prisma.MentionGetPayload<{
  include: {
    mentionedUser: {
      select: {
        id: true;
        email: true;
        firstName: true;
        lastName: true;
      };
    };
  };
}>;

/**
 * Assignment with assignee and assigner relations
 */
export type AssignmentWithUsers = Prisma.AssignmentGetPayload<{
  include: {
    assignee: {
      select: {
        id: true;
        email: true;
        firstName: true;
        lastName: true;
      };
    };
    assigner: {
      select: {
        id: true;
        email: true;
        firstName: true;
        lastName: true;
      };
    };
  };
}>;

/**
 * Ticket type (simplified for commentable access)
 */
export type Ticket = {
  id: string;
  projectId?: string;
};

/**
 * Commentable entity types (union of all commentable entities)
 */
export type CommentableEntity = TaskWithProject | ProjectWithMembers | Ticket;
