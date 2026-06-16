import { SetMetadata } from '@nestjs/common';
import type { IAgentScopes } from '../../infrastructure/database/interface/agent.interface';

/**
 * Agent Permission Decorator
 * Restricts access based on agent scopes
 *
 * Usage:
 * @Permissions('create')
 * @Post('classes/:classId/updates')
 * async createUpdate(@CurrentActor() actor: IActor) { ... }
 */

export type AgentPermission = keyof IAgentScopes;

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: AgentPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
