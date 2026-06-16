import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AgentDocument } from '../../infrastructure/database/entities/agent.entity';

export const CurrentAgent = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AgentDocument => {
    return ctx.switchToHttp().getRequest().agent;
  },
);