import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtAuthGuard } from './jwt-auth.guard';
import { AgentGuard } from '../../agent/guards/agent.guard';
import { ActorType } from '../interfaces/actor.interface';

@Injectable()
export class HybridAuthGuard implements CanActivate {
  constructor(
    private readonly jwtAuthGuard: JwtAuthGuard,
    private readonly agentGuard: AgentGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    console.log("========== HYBRID GUARD ==========");
    console.log('[HybridAuthGuard]', {
      apiKey,
      cookies: {
        accessToken: !!request.cookies?.accessToken,
        refreshToken: !!request.cookies?.refreshToken,
      },
    });

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

    console.log('[HybridAuthGuard User]', request.user);

    request.actor = {
      type: ActorType.USER,
      userId: request.user.userId,
    };

    return true;
  }
}