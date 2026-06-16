import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { IActor } from '../../modules/auth/interfaces/actor.interface';

/**
 * CurrentActor Decorator
 * Returns the authenticated actor from request.
 * Usage: @CurrentActor() actor: IActor
 */
export const CurrentActor = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IActor => {
    const request = ctx.switchToHttp().getRequest();
    return request.actor;
  },
);