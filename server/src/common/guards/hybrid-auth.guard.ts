import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtAuthGuard } from './jwt-auth.guard';
import { AgentGuard } from './agent.guard';
import { ActorType } from '../../modules/auth/interfaces/actor.interface';

@Injectable()
export class HybridAuthGuard implements CanActivate {
  constructor(
    private readonly jwtAuthGuard: JwtAuthGuard,
    private readonly agentGuard: AgentGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    // 1. Agent Authentication
    if (apiKey) {
      const isAllowed = await this.agentGuard.canActivate(context);
      if (!isAllowed) {
        throw new UnauthorizedException('Invalid API key');
      }

      request.actor = {
        type: ActorType.AGENT,
        agentId: request.agent._id.toString(),
        scopes: request.agent.scopes,
        allowedClassIds: request.agent.allowedClassIds.map((id: any) => id.toString()),
      };
      return true;
    }

    // 2. User Authentication (Cookie Based)
    const isAllowed = await this.jwtAuthGuard.canActivate(context);
    if (!isAllowed) {
      throw new UnauthorizedException('Authentication required');
    }

    // If JwtAuthGuard returned true but user is not set (e.g. @Public() route),
    // skip actor assignment — the route is public and doesn't need an actor
    if (!request.user) {
      return true;
    }

    request.actor = {
      type: ActorType.USER,
      userId: request.user.userId,
    };

    return true;
  }
}