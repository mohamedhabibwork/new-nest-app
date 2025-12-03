import { PrismaClient } from '@prisma/client';
import { withUlid } from '../src/common/utils/prisma-helpers';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding default roles...');

  // Default roles with permissions
  const defaultRoles = [
    {
      roleName: 'admin',
      description: 'System administrator with full access',
      permissions: {
        workspaces: ['create', 'read', 'update', 'delete', 'all'],
        projects: ['create', 'read', 'update', 'delete', 'all'],
        tasks: ['create', 'read', 'update', 'delete', 'all'],
        users: ['create', 'read', 'update', 'delete', 'all'],
        roles: ['create', 'read', 'update', 'delete', 'all'],
        teams: ['create', 'read', 'update', 'delete', 'all'],
        comments: ['create', 'read', 'update', 'delete', 'all'],
        attachments: ['create', 'read', 'update', 'delete', 'all'],
        timeLogs: ['create', 'read', 'update', 'delete', 'all'],
        notifications: ['create', 'read', 'update', 'delete', 'all'],
      },
    },
    {
      roleName: 'project_manager',
      description: 'Project manager with project and task management capabilities',
      permissions: {
        workspaces: ['read'],
        projects: ['create', 'read', 'update', 'delete'],
        tasks: ['create', 'read', 'update', 'delete'],
        teams: ['read', 'update'],
        comments: ['create', 'read', 'update', 'delete'],
        attachments: ['create', 'read', 'update', 'delete'],
        timeLogs: ['create', 'read', 'update', 'delete'],
        notifications: ['read'],
      },
    },
    {
      roleName: 'team_member',
      description: 'Team member with task execution capabilities',
      permissions: {
        workspaces: ['read'],
        projects: ['read'],
        tasks: ['read', 'update'],
        teams: ['read'],
        comments: ['create', 'read', 'update'],
        attachments: ['create', 'read'],
        timeLogs: ['create', 'read', 'update'],
        notifications: ['read'],
      },
    },
    {
      roleName: 'viewer',
      description: 'Viewer with read-only access',
      permissions: {
        workspaces: ['read'],
        projects: ['read'],
        tasks: ['read'],
        teams: ['read'],
        comments: ['read'],
        attachments: ['read'],
        timeLogs: ['read'],
        notifications: ['read'],
      },
    },
  ];

  for (const roleData of defaultRoles) {
    const role = await prisma.role.upsert({
      where: { roleName: roleData.roleName },
      update: {
        description: roleData.description,
        permissions: roleData.permissions,
      },
      create: withUlid({
        roleName: roleData.roleName,
        description: roleData.description,
        permissions: roleData.permissions,
      }),
    });

    console.log(`✓ Seeded role: ${role.roleName}`);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

