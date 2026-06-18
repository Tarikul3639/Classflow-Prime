import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AGENT_PERMISSION_KEY, AgentPermissionType } from '../decorators/agent-permission.decorator';

@Injectable()
export class AgentPermissionGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // 1. Get required permissions from metadata
        const requiredPermissions = this.reflector.getAllAndOverride<AgentPermissionType[]>(AGENT_PERMISSION_KEY, [context.getHandler(), context.getClass()]);

        // 2. Allow access if no specific permissions are required
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        // 3. Get agent from request (populated by previous guard)
        const request = context.switchToHttp().getRequest();
        const agent = request.agent;

        if (!agent) {
            throw new ForbiddenException('Agent not found in request');
        }

        // 4. Validate permissions against agent scopes
        const hasPermission = requiredPermissions.some(
            (permission) => agent.scopes?.[permission] === true,
        );

        if (!hasPermission) {
            throw new ForbiddenException(
                'You do not have permission for this action',
            );
        }

        return true;
    }
}
