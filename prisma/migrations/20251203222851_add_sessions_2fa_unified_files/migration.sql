/*
  Warnings:

  - You are about to drop the column `task_id` on the `attachments` table. All the data in the column will be lost.
  - Added the required column `entity_id` to the `attachments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entity_type` to the `attachments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_path` to the `attachments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_task_id_fkey";

-- DropIndex
DROP INDEX "attachments_task_id_idx";

-- AlterTable
ALTER TABLE "attachments" DROP COLUMN "task_id",
ADD COLUMN     "entity_id" TEXT NOT NULL,
ADD COLUMN     "entity_type" TEXT NOT NULL,
ADD COLUMN     "file_path" TEXT NOT NULL,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "storage_type" TEXT NOT NULL DEFAULT 'local',
ALTER COLUMN "file_url" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_2fa_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "two_factor_backup_codes" JSONB,
ADD COLUMN     "two_factor_secret" TEXT,
ADD COLUMN     "two_factor_verified_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "jti" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_jti_key" ON "sessions"("jti");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_jti_idx" ON "sessions"("jti");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- CreateIndex
CREATE INDEX "attachments_entity_type_entity_id_idx" ON "attachments"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "attachments_storage_type_idx" ON "attachments"("storage_type");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
