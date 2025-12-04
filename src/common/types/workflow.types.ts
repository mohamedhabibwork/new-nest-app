/**
 * Workflow action types
 */
export type WorkflowActionType =
  | 'send_email'
  | 'create_task'
  | 'update_field'
  | 'create_deal'
  | 'assign_owner'
  | 'webhook'
  | 'delay';

/**
 * Workflow trigger types
 */
export type WorkflowTriggerType =
  | 'contact_created'
  | 'contact_updated'
  | 'deal_created'
  | 'deal_stage_changed'
  | 'ticket_created'
  | 'ticket_status_changed'
  | 'form_submitted'
  | 'manual';

/**
 * Workflow action configuration
 */
export interface WorkflowAction {
  id: string;
  actionType: WorkflowActionType;
  actionConfig: Record<string, unknown>;
  order: number;
  delayMinutes?: number;
}

/**
 * Workflow trigger configuration
 */
export interface WorkflowTrigger {
  triggerType: WorkflowTriggerType;
  triggerConditions?: Record<string, unknown>;
}

/**
 * Workflow context for execution
 */
export interface WorkflowContext {
  entityType: string;
  entityId: string;
  userId?: string;
  [key: string]: unknown;
}

/**
 * Result of workflow action execution
 */
export interface ActionResult {
  actionId: string;
  actionType: WorkflowActionType;
  status: 'executed' | 'delayed' | 'failed';
  result?: Record<string, unknown>;
  delayMinutes?: number;
  error?: string;
}

/**
 * Workflow with actions included
 */
export interface WorkflowWithActions {
  id: string;
  workflowName: string;
  triggerType: WorkflowTriggerType;
  triggerConditions: Record<string, unknown> | null;
  status: string;
  actions: WorkflowAction[];
  executionCount: number;
}
