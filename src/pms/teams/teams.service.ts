import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { withUlid } from '../../common/utils/prisma-helpers';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async addUserToTeam(teamId: string, userId: string, addedBy: string) {
    // Check if team exists
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        workspace: {
          select: {
            id: true,
            ownerId: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if user has permission (must be project manager or workspace owner)
    const hasPermission = await this.checkTeamManagementPermission(
      team.workspace.id,
      addedBy,
    );

    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to manage team members');
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already a member
    const existingMember = await this.prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });

    if (existingMember) {
      throw new BadRequestException('User is already a member of this team');
    }

    // Add user to team
    return this.prisma.teamMember.create({
      data: withUlid({
        teamId,
        userId,
      }),
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async removeUserFromTeam(teamId: string, userId: string, removedBy: string) {
    // Check if team exists
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        workspace: {
          select: {
            id: true,
            ownerId: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if user has permission
    const hasPermission = await this.checkTeamManagementPermission(
      team.workspace.id,
      removedBy,
    );

    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to manage team members');
    }

    // Remove user from team
    const result = await this.prisma.teamMember.deleteMany({
      where: {
        teamId,
        userId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('User is not a member of this team');
    }

    return { message: 'User removed from team successfully' };
  }

  async getTeamMembers(teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        teamMembers: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team.teamMembers;
  }

  async getTeams(workspaceId?: string, userId?: string) {
    const where: { workspaceId?: string } = {};
    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    const teams = await this.prisma.team.findMany({
      where,
      include: {
        teamMembers: userId
          ? {
              where: { userId },
            }
          : {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                  },
                },
              },
            },
      },
    });

    return teams;
  }

  private async checkTeamManagementPermission(
    workspaceId: string,
    userId: string,
  ): Promise<boolean> {
    // Check if user is workspace owner
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });

    if (workspace?.ownerId === userId) {
      return true;
    }

    // Check if user is a project manager in any project in this workspace
    const projects = await this.prisma.project.findMany({
      where: {
        workspaceId,
        projectManagerId: userId,
      },
    });

    return projects.length > 0;
  }
}

