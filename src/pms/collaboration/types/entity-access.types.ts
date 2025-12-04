import {
  TaskWithProject,
  ProjectWithMembers,
  CommentableEntity as BaseCommentableEntity,
} from '../../../common/types/polymorphic.types';

/**
 * Entity with project relation
 */
export type EntityWithProject = TaskWithProject;

/**
 * Entity with members relation
 */
export type EntityWithMembers = ProjectWithMembers;

/**
 * Commentable entity union type (re-export from base)
 */
export type CommentableEntity = BaseCommentableEntity;

/**
 * Type guard to check if entity has project
 */
export function hasProject(
  entity: CommentableEntity,
): entity is TaskWithProject {
  return 'project' in entity && entity.project !== undefined;
}

/**
 * Type guard to check if entity has project members
 */
export function hasProjectMembers(
  entity: CommentableEntity,
): entity is ProjectWithMembers {
  return 'projectMembers' in entity && Array.isArray(entity.projectMembers);
}
