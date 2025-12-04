import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { withUlid } from '../../../common/utils/prisma-helpers';
import { generateUlid } from '../../../common/utils/ulid.util';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class WorkspaceInvitationService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

  async inviteUserToWorkspace(
    workspaceId: string,
    email: string,
    role: string,
    invitedBy: string,
  ) {
    // Check if workspace exists
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    // Check if there's already a pending invitation for this email and workspace
    const existingInvitation = await this.prisma.workspaceInvitation.findFirst({
      where: {
        workspaceId,
        email,
        status: 'pending',
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingInvitation) {
      throw new BadRequestException('Invitation already sent to this email');
    }

    // If user exists and is already a member, don't create invitation
    if (existingUser) {
      // Check if user is already a project member in any project in this workspace
      const projects = await this.prisma.project.findMany({
        where: { workspaceId },
        include: {
          projectMembers: {
            where: { userId: existingUser.id },
          },
        },
      });

      const isMember = projects.some((p) => p.projectMembers.length > 0);
      if (isMember) {
        throw new BadRequestException(
          'User is already a member of this workspace',
        );
      }
    }

    // Generate invitation token
    const invitationToken = generateUlid();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    // Create invitation
    const invitation = await this.prisma.workspaceInvitation.create({
      data: withUlid({
        workspaceId,
        email,
        invitedBy,
        invitationToken,
        role,
        status: 'pending',
        expiresAt,
      }),
      include: {
        workspace: {
          select: {
            id: true,
            workspaceName: true,
          },
        },
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Queue invitation email (async, non-blocking for better traffic handling)
    await this.emailQueue.add(
      'workspace-invitation',
      {
        type: 'workspace-invitation',
        email,
        invitationToken,
        workspaceName: workspace.workspaceName,
        inviterName: invitation.inviter.name || invitation.inviter.email,
        role,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    return invitation;
  }

  async getInvitationByToken(token: string) {
    const invitation = await this.prisma.workspaceInvitation.findUnique({
      where: { invitationToken: token },
      include: {
        workspace: {
          select: {
            id: true,
            workspaceName: true,
            description: true,
          },
        },
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new BadRequestException(`Invitation has been ${invitation.status}`);
    }

    if (invitation.expiresAt < new Date()) {
      // Mark as expired
      await this.prisma.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' },
      });
      throw new BadRequestException('Invitation has expired');
    }

    return invitation;
  }

  async acceptInvitation(token: string, userId: string) {
    const invitation = await this.getInvitationByToken(token);

    // Verify email matches
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.email !== invitation.email) {
      throw new BadRequestException('Email does not match invitation');
    }

    // Update invitation status
    await this.prisma.workspaceInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'accepted',
        acceptedAt: new Date(),
      },
    });

    // Add user to workspace by adding them to a project or creating a default project member entry
    // For now, we'll just mark the invitation as accepted
    // The actual workspace membership will be handled when user joins a project

    return {
      message: 'Invitation accepted successfully',
      workspaceId: invitation.workspaceId,
      role: invitation.role,
    };
  }

  async cancelInvitation(invitationId: string) {
    const invitation = await this.prisma.workspaceInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new BadRequestException('Can only cancel pending invitations');
    }

    return this.prisma.workspaceInvitation.update({
      where: { id: invitationId },
      data: { status: 'cancelled' },
    });
  }

  async resendInvitation(invitationId: string) {
    const invitation = await this.prisma.workspaceInvitation.findUnique({
      where: { id: invitationId },
      include: {
        workspace: {
          select: {
            id: true,
            workspaceName: true,
          },
        },
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new BadRequestException('Can only resend pending invitations');
    }

    // Extend expiration if needed
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const updated = await this.prisma.workspaceInvitation.update({
      where: { id: invitationId },
      data: { expiresAt },
    });

    // Queue resend email (async, non-blocking for better traffic handling)
    await this.emailQueue.add(
      'workspace-invitation',
      {
        type: 'workspace-invitation',
        email: invitation.email,
        invitationToken: invitation.invitationToken,
        workspaceName: invitation.workspace.workspaceName,
        inviterName: invitation.inviter.name || invitation.inviter.email,
        role: invitation.role,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    return updated;
  }

  async getWorkspaceInvitations(workspaceId: string) {
    return this.prisma.workspaceInvitation.findMany({
      where: { workspaceId },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
