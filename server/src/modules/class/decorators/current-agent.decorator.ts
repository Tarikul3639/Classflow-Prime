import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AgentDocument } from '../../../infrastructure/database/entities/agent.entity';

export const CurrentAgent = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AgentDocument => {
    const request = ctx.switchToHttp().getRequest();
    const agent = request.agent;

    if (!agent) {
      throw new UnauthorizedException('Agent not found');
    }

    return agent;
  },
);