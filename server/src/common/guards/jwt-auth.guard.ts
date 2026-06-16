import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  CanActivate,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { TokenService } from '../../modules/auth/services/token/token.service';
import { setAuthCookies } from '../utils/auth-cookies.util';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1️) Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const accessToken = request.cookies?.['accessToken'];
    const refreshToken = request.cookies?.['refreshToken'];

    // 2️) Exit if no tokens are present in cookies
    if (!accessToken && !refreshToken) {
      throw new UnauthorizedException('Authentication tokens missing');
    }

    // 3️) Attempt to verify the Access Token
    if (accessToken) {
      try {
        const payload = await this.jwtService.verifyAsync(accessToken);
        request['user'] = payload;
        return true;
      } catch (err) {
        // If expired but no refresh token is available, deny access
        if (!refreshToken) {
          throw new UnauthorizedException('Access token expired');
        }
      }
    }

    // 3️) Silent Refresh Logic
    if (refreshToken) {
      try {
        // Safe IP extraction considering proxies
        const ip =
          (request.headers['x-forwarded-for'] as string)
            ?.split(',')[0]
            ?.trim() ||
          request.ip ||
          'unknown';
        const ua = request.headers['user-agent'] || 'unknown-device';

        // Rotate tokens
        const tokens = await this.tokenService.refreshTokens(
          refreshToken,
          ip,
          ua,
        );

        // Update Cookies
        setAuthCookies(response, tokens);

        // NOTE: Attach user payload to request (Extract from new access token)
        const newPayload = this.jwtService.decode(tokens.accessToken);
        request['user'] = newPayload; // NOTE: This "user" will be available in controllers via @CurrentUser() decorator

        return true;
      } catch (error: any) {
        // Clear cookies on refresh failure to prevent infinite loops
        response.clearCookie('accessToken');
        response.clearCookie('refreshToken');
        throw new UnauthorizedException(
          error instanceof ForbiddenException
            ? error.message
            : 'Session expired. Please login again',
        );
      }
    }

    return false;
  }
}
