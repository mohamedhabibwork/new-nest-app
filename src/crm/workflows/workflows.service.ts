import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { withUlid, withUlidArray } from '../../common/utils/prisma-helpers';
import { CreateWorkflowDto, WorkflowActionDto } from './dto/create-workflow.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class WorkflowsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateWorkflowDto) {
    // If formId is provided, verify form exists
    if (data.formId) {
      const form = await this.prisma.form.findUnique({
        where: { id: data.formId },
      });
      if (!form) {
        throw new NotFoundException('Form not found');
      }
    }

    const workflow = await this.prisma.workflow.create({
      data: withUlid({
        name: data.name,
        description: data.description,
        triggerType: data.triggerType,
        triggerConditions: data.triggerConditions,
        formId: data.formId,
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdBy: userId,
        executionCount: 0,
      }),
    });

    // Create workflow actions
    if (data.actions && data.actions.length > 0) {
      await Promise.all(
        data.actions.map((action) =>
          this.prisma.workflowAction.create({
            data: withUlid({
              workflowId: workflow.id,
              actionType: action.actionType,
              executionOrder: action.executionOrder,
              actionConfig: action.actionConfig,
              delayMinutes: action.delayMinutes || 0,
            }),
          }),
        ),
      );
    }

    return this.findOne(workflow.id);
  }

  async findAll() {
    return this.prisma.workflow.findMany({
      include: {
        actions: {
          orderBy: { executionOrder: 'asc' },
        },
        form: {
          select: {
            id: true,
            name: true,
            formType: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
      include: {
        actions: {
          orderBy: { executionOrder: 'asc' },
        },
        form: {
          select: {
            id: true,
            name: true,
            formType: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    return workflow;
  }

  async update(id: string, userId: string, data: Partial<CreateWorkflowDto>) {
    await this.findOne(id);

    const workflow = await this.prisma.workflow.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        triggerType: data.triggerType,
        triggerConditions: data.triggerConditions,
        formId: data.formId,
        isActive: data.isActive,
      },
    });

    // Update actions if provided
    if (data.actions) {
      // Delete existing actions
      await this.prisma.workflowAction.deleteMany({
        where: { workflowId: id },
      });

      // Create new actions
      if (data.actions.length > 0) {
        await Promise.all(
          data.actions.map((action) =>
            this.prisma.workflowAction.create({
              data: withUlid({
                workflowId: id,
                actionType: action.actionType,
                executionOrder: action.executionOrder,
                actionConfig: action.actionConfig,
                delayMinutes: action.delayMinutes || 0,
              }),
            }),
          ),
        );
      }
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.workflow.delete({
      where: { id },
    });

    return { message: 'Workflow deleted successfully' };
  }

  async execute(workflowId: string, context: Record<string, unknown>) {
    const workflow = await this.findOne(workflowId);

    if (!workflow.isActive) {
      throw new NotFoundException('Workflow is not active');
    }

    // Check trigger conditions
    if (!this.checkTriggerConditions(workflow, context)) {
      return { message: 'Trigger conditions not met' };
    }

    // Execute actions in order
    const results = [];
    for (const action of workflow.actions) {
      // Handle delay
      if (action.delayMinutes > 0) {
        // In a real implementation, this would be handled by a queue/job system
        // For now, we'll just log it
        results.push({
          actionId: action.id,
          actionType: action.actionType,
          status: 'delayed',
          delayMinutes: action.delayMinutes,
        });
        continue;
      }

      // Execute action
      const result = await this.executeAction(action, context);
      results.push({
        actionId: action.id,
        actionType: action.actionType,
        status: 'executed',
        result,
      });
    }

    // Update execution count
    await this.prisma.workflow.update({
      where: { id: workflowId },
      data: {
        executionCount: {
          increment: 1,
        },
      },
    });

    return {
      workflowId,
      executed: results.length,
      results,
    };
  }

  private checkTriggerConditions(
    workflow: any,
    context: Record<string, unknown>,
  ): boolean {
    if (!workflow.triggerConditions) {
      return true;
    }

    // Simplified condition checking - full implementation would evaluate complex conditions
    // This is a placeholder for the actual condition evaluation logic
    return true;
  }

  private async executeAction(
    action: any,
    context: Record<string, unknown>,
  ): Promise<any> {
    // Simplified action execution - full implementation would handle each action type
    // This is a placeholder for the actual action execution logic
    switch (action.actionType) {
      case 'send_email':
        // Would integrate with email service
        return { message: 'Email action queued' };
      case 'create_task':
        // Would create a task
        return { message: 'Task creation queued' };
      case 'update_field':
        // Would update contact/deal field
        return { message: 'Field update queued' };
      case 'create_deal':
        // Would create a deal
        return { message: 'Deal creation queued' };
      case 'assign_owner':
        // Would assign owner
        return { message: 'Owner assignment queued' };
      case 'webhook':
        // Would call webhook
        return { message: 'Webhook call queued' };
      default:
        return { message: 'Action type not implemented' };
    }
  }
}

