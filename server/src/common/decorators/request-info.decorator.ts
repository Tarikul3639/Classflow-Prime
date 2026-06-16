import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * RequestInfo Decorator
 * Extracts useful information from the request object (IP address, user agent)
 * Can be used for logging, analytics, security checks, etc.
 * Usage:
 * @Get('some-route')
 * async someRoute(@RequestInfo() info: { ip: string; userAgent: string }) {
 *   console.log(info.ip, info.userAgent);
 *  return { message: 'Info extracted' };
 * }
 *
 * @returns An object containing the client's IP address and user agent string
 * Note: IP extraction considers x-forwarded-for header for cases where the app is behind a proxy
 * User agent is extracted from the 'user-agent' header, with a fallback to 'unknown-device'
 * This decorator centralizes request info extraction logic, ensuring consistency across the app
 */

export interface IRequestInfo {
  ip: string;
  userAgent: string;
}

export const RequestInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IRequestInfo => {
    const req = ctx.switchToHttp().getRequest<Request>();

    /*
     * Extract IP address:
     * - Prefer x-forwarded-for header (handles proxies/load balancers)
     * - Fallback to req.ip (Express's built-in IP extraction)
     * - Fallback to req.socket.remoteAddress (raw socket info)
     * - Final fallback to '
     */
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket.remoteAddress ||
      '0.0.0.0';

    /*
     * Extract User Agent:
     * - Use 'user-agent' header if present
     * - Fallback to 'unknown-device' if header is missing (e.g., some bots or curl requests)
     */
    const userAgent = req.headers['user-agent'] || 'unknown-device';

    return { ip, userAgent };
  },
);
