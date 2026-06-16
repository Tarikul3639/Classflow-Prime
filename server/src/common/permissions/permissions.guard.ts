import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, type AgentPermission } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<AgentPermission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No permissions required → allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const actor = request.actor;

    // No actor → not authenticated
    if (!actor) {
      throw new ForbiddenException('Access denied');
    }

    // Only agent actors have permissions/scopes
    if (actor.type !== 'agent') {
      // User actors bypass permission checks (use @Roles for user-based access control)
      return true;
    }

    // Check if agent has all required permissions
    const agentScopes = actor.scopes;
    for (const permission of requiredPermissions) {
      if (!agentScopes[permission]) {
        throw new ForbiddenException(
          `Access denied. Missing permission: ${permission}`,
        );
      }
    }

    return true;
  }
}
