import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { withUlid } from '../../common/utils/prisma-helpers';

export interface Permission {
  resource: string;
  actions: string[];
}

@Injectable()
export class RbacService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all roles for a user
   */
  async getUserRoles(userId: string): Promise<string[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });

    return userRoles.map((ur) => ur.role.roleName);
  }

  /**
   * Get user permissions from their roles
   */
  async getUserPermissions(userId: string): Promise<Record<string, string[]>> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });

    const permissions: Record<string, string[]> = {};

    for (const userRole of userRoles) {
      const rolePermissions = userRole.role.permissions as Record<
        string,
        string[]
      >;

      // Merge permissions from all roles
      for (const [resource, actions] of Object.entries(rolePermissions)) {
        if (!permissions[resource]) {
          permissions[resource] = [];
        }
        // Merge actions and remove duplicates
        permissions[resource] = [
          ...new Set([...permissions[resource], ...actions]),
        ];
      }
    }

    return permissions;
  }

  /**
   * Check if user has a specific role
   */
  async hasRole(userId: string, roleName: string): Promise<boolean> {
    const role = await this.prisma.role.findUnique({
      where: { roleName },
    });

    if (!role) {
      return false;
    }

    const userRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
      },
    });

    return !!userRole;
  }

  /**
   * Check if user has any of the specified roles
   */
  async hasAnyRole(userId: string, roleNames: string[]): Promise<boolean> {
    const roles = await this.prisma.role.findMany({
      where: { roleName: { in: roleNames } },
    });

    if (roles.length === 0) {
      return false;
    }

    const roleIds = roles.map((r) => r.id);
    const userRole = await this.prisma.userRole.findFirst({
      where: {
        userId,
        roleId: { in: roleIds },
      },
    });

    return !!userRole;
  }

  /**
   * Check if user has permission for a resource and action
   */
  async hasPermission(
    userId: string,
    resource: string,
    action: string,
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);

    // Check if user has permission for the resource
    if (!permissions[resource]) {
      return false;
    }

    // Check if user has the specific action or 'all' permission
    return (
      permissions[resource].includes(action) ||
      permissions[resource].includes('all')
    );
  }

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(
    userId: string,
    requiredPermissions: Array<{ resource: string; action: string }>,
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);

    return requiredPermissions.some(({ resource, action }) => {
      if (!permissions[resource]) {
        return false;
      }
      return (
        permissions[resource].includes(action) ||
        permissions[resource].includes('all')
      );
    });
  }

  /**
   * Assign a role to a user
   */
  async assignRole(userId: string, roleName: string): Promise<void> {
    const role = await this.prisma.role.findUnique({
      where: { roleName },
    });

    if (!role) {
      throw new NotFoundException(`Role '${roleName}' not found`);
    }

    await this.prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
      },
      create: withUlid({
        userId,
        roleId: role.id,
      }),
      update: {},
    });
  }

  /**
   * Remove a role from a user
   */
  async removeRole(userId: string, roleName: string): Promise<void> {
    const role = await this.prisma.role.findUnique({
      where: { roleName },
    });

    if (!role) {
      throw new NotFoundException(`Role '${roleName}' not found`);
    }

    await this.prisma.userRole.deleteMany({
      where: {
        userId,
        roleId: role.id,
      },
    });
  }

  /**
   * Get role by name
   */
  async getRoleByName(roleName: string) {
    return this.prisma.role.findUnique({
      where: { roleName },
    });
  }

  /**
   * Get all roles
   */
  async getAllRoles() {
    return this.prisma.role.findMany({
      orderBy: { roleName: 'asc' },
    });
  }
}

