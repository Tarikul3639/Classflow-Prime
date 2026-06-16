import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { IJwtPayload } from '../../modules/auth/interfaces/jwt-payload.interface';

/**
 * CurrentUser Decorator
 * Extracts the authenticated user from the request object
 *
 * Usage:
 * @Get('profile')
 * async getProfile(@CurrentUser() user: IJwtPayload) {
 *   return { userId: user.sub, email: user.email };
 * }
 *
 * @returns IJwtPayload - The user payload from JWT token
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IJwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
