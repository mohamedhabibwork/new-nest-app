-- AlterTable: Update users table to match new schema
-- Rename existing columns and add new ones

-- Rename existing columns
ALTER TABLE "users" RENAME COLUMN "emailVerified" TO "email_verified";
ALTER TABLE "users" RENAME COLUMN "emailVerificationToken" TO "email_verification_token";
ALTER TABLE "users" RENAME COLUMN "passwordResetToken" TO "password_reset_token";
ALTER TABLE "users" RENAME COLUMN "passwordResetExpires" TO "password_reset_expires";
ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";

-- Add new columns with defaults
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "first_name" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_name" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "timezone" TEXT DEFAULT 'UTC';

-- Drop old indexes and create new ones
DROP INDEX IF EXISTS "users_emailVerificationToken_key";
DROP INDEX IF EXISTS "users_passwordResetToken_key";

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_verification_token_key" ON "users"("email_verification_token");
CREATE UNIQUE INDEX IF NOT EXISTS "users_password_reset_token_key" ON "users"("password_reset_token");

-- CreateTable: roles
CREATE TABLE IF NOT EXISTS "roles" (
    "id" TEXT NOT NULL,
    "role_name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: roles_role_name_key
CREATE UNIQUE INDEX IF NOT EXISTS "roles_role_name_key" ON "roles"("role_name");

-- CreateTable: user_roles
CREATE TABLE IF NOT EXISTS "user_roles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: user_roles_user_id_idx
CREATE INDEX IF NOT EXISTS "user_roles_user_id_idx" ON "user_roles"("user_id");

-- CreateIndex: user_roles_role_id_idx
CREATE INDEX IF NOT EXISTS "user_roles_role_id_idx" ON "user_roles"("role_id");

-- CreateIndex: user_roles_user_id_role_id_key
CREATE UNIQUE INDEX IF NOT EXISTS "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");

-- CreateTable: workspaces
CREATE TABLE IF NOT EXISTS "workspaces" (
    "id" TEXT NOT NULL,
    "workspace_name" TEXT NOT NULL,
    "description" TEXT,
    "owner_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: workspaces_owner_id_idx
CREATE INDEX IF NOT EXISTS "workspaces_owner_id_idx" ON "workspaces"("owner_id");

-- CreateTable: teams
CREATE TABLE IF NOT EXISTS "teams" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "team_name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: teams_workspace_id_idx
CREATE INDEX IF NOT EXISTS "teams_workspace_id_idx" ON "teams"("workspace_id");

-- CreateTable: team_members
CREATE TABLE IF NOT EXISTS "team_members" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: team_members_team_id_idx
CREATE INDEX IF NOT EXISTS "team_members_team_id_idx" ON "team_members"("team_id");

-- CreateIndex: team_members_user_id_idx
CREATE INDEX IF NOT EXISTS "team_members_user_id_idx" ON "team_members"("user_id");

-- CreateIndex: team_members_team_id_user_id_key
CREATE UNIQUE INDEX IF NOT EXISTS "team_members_team_id_user_id_key" ON "team_members"("team_id", "user_id");

-- CreateTable: projects
CREATE TABLE IF NOT EXISTS "projects" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planning',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "project_manager_id" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: projects_workspace_id_idx
CREATE INDEX IF NOT EXISTS "projects_workspace_id_idx" ON "projects"("workspace_id");

-- CreateIndex: projects_project_manager_id_idx
CREATE INDEX IF NOT EXISTS "projects_project_manager_id_idx" ON "projects"("project_manager_id");

-- CreateIndex: projects_status_idx
CREATE INDEX IF NOT EXISTS "projects_status_idx" ON "projects"("status");

-- CreateTable: project_members
CREATE TABLE IF NOT EXISTS "project_members" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "member_role" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: project_members_project_id_idx
CREATE INDEX IF NOT EXISTS "project_members_project_id_idx" ON "project_members"("project_id");

-- CreateIndex: project_members_user_id_idx
CREATE INDEX IF NOT EXISTS "project_members_user_id_idx" ON "project_members"("user_id");

-- CreateIndex: project_members_project_id_user_id_key
CREATE UNIQUE INDEX IF NOT EXISTS "project_members_project_id_user_id_key" ON "project_members"("project_id", "user_id");

-- CreateTable: milestones
CREATE TABLE IF NOT EXISTS "milestones" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "milestone_name" TEXT NOT NULL,
    "description" TEXT,
    "due_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: milestones_project_id_idx
CREATE INDEX IF NOT EXISTS "milestones_project_id_idx" ON "milestones"("project_id");

-- CreateIndex: milestones_status_idx
CREATE INDEX IF NOT EXISTS "milestones_status_idx" ON "milestones"("status");

-- CreateTable: tasks
CREATE TABLE IF NOT EXISTS "tasks" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "parent_task_id" TEXT,
    "task_title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'to_do',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "due_date" TIMESTAMP(3),
    "estimated_hours" INTEGER,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: tasks_project_id_idx
CREATE INDEX IF NOT EXISTS "tasks_project_id_idx" ON "tasks"("project_id");

-- CreateIndex: tasks_parent_task_id_idx
CREATE INDEX IF NOT EXISTS "tasks_parent_task_id_idx" ON "tasks"("parent_task_id");

-- CreateIndex: tasks_status_idx
CREATE INDEX IF NOT EXISTS "tasks_status_idx" ON "tasks"("status");

-- CreateIndex: tasks_priority_idx
CREATE INDEX IF NOT EXISTS "tasks_priority_idx" ON "tasks"("priority");

-- CreateIndex: tasks_created_by_idx
CREATE INDEX IF NOT EXISTS "tasks_created_by_idx" ON "tasks"("created_by");

-- CreateTable: task_assignments
CREATE TABLE IF NOT EXISTS "task_assignments" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "task_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: task_assignments_task_id_idx
CREATE INDEX IF NOT EXISTS "task_assignments_task_id_idx" ON "task_assignments"("task_id");

-- CreateIndex: task_assignments_user_id_idx
CREATE INDEX IF NOT EXISTS "task_assignments_user_id_idx" ON "task_assignments"("user_id");

-- CreateIndex: task_assignments_task_id_user_id_key
CREATE UNIQUE INDEX IF NOT EXISTS "task_assignments_task_id_user_id_key" ON "task_assignments"("task_id", "user_id");

-- CreateTable: task_dependencies
CREATE TABLE IF NOT EXISTS "task_dependencies" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "depends_on_task_id" TEXT NOT NULL,
    "dependency_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: task_dependencies_task_id_idx
CREATE INDEX IF NOT EXISTS "task_dependencies_task_id_idx" ON "task_dependencies"("task_id");

-- CreateIndex: task_dependencies_depends_on_task_id_idx
CREATE INDEX IF NOT EXISTS "task_dependencies_depends_on_task_id_idx" ON "task_dependencies"("depends_on_task_id");

-- CreateIndex: task_dependencies_task_id_depends_on_task_id_key
CREATE UNIQUE INDEX IF NOT EXISTS "task_dependencies_task_id_depends_on_task_id_key" ON "task_dependencies"("task_id", "depends_on_task_id");

-- CreateTable: checklist_items
CREATE TABLE IF NOT EXISTS "checklist_items" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "item_text" TEXT NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: checklist_items_task_id_idx
CREATE INDEX IF NOT EXISTS "checklist_items_task_id_idx" ON "checklist_items"("task_id");

-- CreateTable: comments
CREATE TABLE IF NOT EXISTS "comments" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "comment_text" TEXT NOT NULL,
    "parent_comment_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: comments_task_id_idx
CREATE INDEX IF NOT EXISTS "comments_task_id_idx" ON "comments"("task_id");

-- CreateIndex: comments_user_id_idx
CREATE INDEX IF NOT EXISTS "comments_user_id_idx" ON "comments"("user_id");

-- CreateIndex: comments_parent_comment_id_idx
CREATE INDEX IF NOT EXISTS "comments_parent_comment_id_idx" ON "comments"("parent_comment_id");

-- CreateTable: time_logs
CREATE TABLE IF NOT EXISTS "time_logs" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "hours_logged" DECIMAL(10,2) NOT NULL,
    "log_date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "is_billable" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "time_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: time_logs_task_id_idx
CREATE INDEX IF NOT EXISTS "time_logs_task_id_idx" ON "time_logs"("task_id");

-- CreateIndex: time_logs_user_id_idx
CREATE INDEX IF NOT EXISTS "time_logs_user_id_idx" ON "time_logs"("user_id");

-- CreateIndex: time_logs_log_date_idx
CREATE INDEX IF NOT EXISTS "time_logs_log_date_idx" ON "time_logs"("log_date");

-- CreateTable: attachments
CREATE TABLE IF NOT EXISTS "attachments" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: attachments_task_id_idx
CREATE INDEX IF NOT EXISTS "attachments_task_id_idx" ON "attachments"("task_id");

-- CreateIndex: attachments_uploaded_by_idx
CREATE INDEX IF NOT EXISTS "attachments_uploaded_by_idx" ON "attachments"("uploaded_by");

-- CreateTable: notifications
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "notification_type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: notifications_user_id_idx
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex: notifications_is_read_idx
CREATE INDEX IF NOT EXISTS "notifications_is_read_idx" ON "notifications"("is_read");

-- CreateIndex: notifications_created_at_idx
CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateTable: activity_logs
CREATE TABLE IF NOT EXISTS "activity_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "changes" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: activity_logs_user_id_idx
CREATE INDEX IF NOT EXISTS "activity_logs_user_id_idx" ON "activity_logs"("user_id");

-- CreateIndex: activity_logs_entity_type_entity_id_idx
CREATE INDEX IF NOT EXISTS "activity_logs_entity_type_entity_id_idx" ON "activity_logs"("entity_type", "entity_id");

-- CreateIndex: activity_logs_created_at_idx
CREATE INDEX IF NOT EXISTS "activity_logs_created_at_idx" ON "activity_logs"("created_at");

-- CreateTable: tags
CREATE TABLE IF NOT EXISTS "tags" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "tag_name" TEXT NOT NULL,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: tags_workspace_id_idx
CREATE INDEX IF NOT EXISTS "tags_workspace_id_idx" ON "tags"("workspace_id");

-- CreateIndex: tags_workspace_id_tag_name_key
CREATE UNIQUE INDEX IF NOT EXISTS "tags_workspace_id_tag_name_key" ON "tags"("workspace_id", "tag_name");

-- CreateTable: project_tags
CREATE TABLE IF NOT EXISTS "project_tags" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "project_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: project_tags_project_id_idx
CREATE INDEX IF NOT EXISTS "project_tags_project_id_idx" ON "project_tags"("project_id");

-- CreateIndex: project_tags_tag_id_idx
CREATE INDEX IF NOT EXISTS "project_tags_tag_id_idx" ON "project_tags"("tag_id");

-- CreateIndex: project_tags_project_id_tag_id_key
CREATE UNIQUE INDEX IF NOT EXISTS "project_tags_project_id_tag_id_key" ON "project_tags"("project_id", "tag_id");

-- CreateTable: task_tags
CREATE TABLE IF NOT EXISTS "task_tags" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "task_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: task_tags_task_id_idx
CREATE INDEX IF NOT EXISTS "task_tags_task_id_idx" ON "task_tags"("task_id");

-- CreateIndex: task_tags_tag_id_idx
CREATE INDEX IF NOT EXISTS "task_tags_tag_id_idx" ON "task_tags"("tag_id");

-- CreateIndex: task_tags_task_id_tag_id_key
CREATE UNIQUE INDEX IF NOT EXISTS "task_tags_task_id_tag_id_key" ON "task_tags"("task_id", "tag_id");

-- AddForeignKey: user_roles -> users
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: user_roles -> roles
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: workspaces -> users
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: teams -> workspaces
ALTER TABLE "teams" ADD CONSTRAINT "teams_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: team_members -> teams
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: team_members -> users
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: projects -> workspaces
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: project_members -> projects
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: project_members -> users
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: milestones -> projects
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: tasks -> projects
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: tasks -> tasks (self-reference)
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parent_task_id_fkey" FOREIGN KEY ("parent_task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: tasks -> users
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: task_assignments -> tasks
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: task_assignments -> users
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: task_dependencies -> tasks (depends_on)
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: task_dependencies -> tasks (blocks)
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_depends_on_task_id_fkey" FOREIGN KEY ("depends_on_task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: checklist_items -> tasks
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: comments -> tasks
ALTER TABLE "comments" ADD CONSTRAINT "comments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: comments -> users
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: comments -> comments (self-reference)
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: time_logs -> tasks
ALTER TABLE "time_logs" ADD CONSTRAINT "time_logs_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: time_logs -> users
ALTER TABLE "time_logs" ADD CONSTRAINT "time_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: attachments -> tasks
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: attachments -> users
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: notifications -> users
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: activity_logs -> users
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: tags -> workspaces
ALTER TABLE "tags" ADD CONSTRAINT "tags_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: project_tags -> projects
ALTER TABLE "project_tags" ADD CONSTRAINT "project_tags_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: project_tags -> tags
ALTER TABLE "project_tags" ADD CONSTRAINT "project_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: task_tags -> tasks
ALTER TABLE "task_tags" ADD CONSTRAINT "task_tags_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: task_tags -> tags
ALTER TABLE "task_tags" ADD CONSTRAINT "task_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

