import { SetMetadata } from '@nestjs/common';

/**
 * Public decorator
 * Marks a route as public (bypasses JWT authentication)
 * Use on routes that don't require authentication (signup, signin, etc.)
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
