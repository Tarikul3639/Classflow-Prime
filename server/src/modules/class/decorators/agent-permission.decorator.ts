import { SetMetadata } from '@nestjs/common';
import { IAgentScopes } from '../../../infrastructure/database/interface/agent.interface';

export const AGENT_PERMISSION_KEY = 'agent_permission';
export type AgentPermissionType = keyof IAgentScopes;

/**
 * Custom decorator to define required permissions for agent endpoints.
 * Example: @AgentPermission('create', 'update')
 */
export const AgentPermission = (...permissions: AgentPermissionType[]) =>
  SetMetadata(AGENT_PERMISSION_KEY, permissions);