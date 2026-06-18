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
    // 1. Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const accessToken = request.cookies?.['accessToken'];
    const refreshToken = request.cookies?.['refreshToken'];

    // 2. Exit if no tokens are present
    if (!accessToken && !refreshToken) {
      throw new UnauthorizedException('Authentication tokens missing');
    }

    // 3. Attempt to verify the Access Token
    if (accessToken) {
      try {
        request['user'] = await this.jwtService.verifyAsync(accessToken);
        return true;
      } catch (err) {
        if (!refreshToken) throw new UnauthorizedException('Access token expired');
      }
    }

    // 4. Silent Refresh Logic
    if (refreshToken) {
      try {
        const ip = (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || request.ip || 'unknown';
        const ua = request.headers['user-agent'] || 'unknown-device';

        const tokens = await this.tokenService.refreshTokens(refreshToken, ip, ua);
        setAuthCookies(response, tokens);

        request['user'] = this.jwtService.decode(tokens.accessToken);
        return true;
      } catch (error: any) {
        response.clearCookie('accessToken');
        response.clearCookie('refreshToken');
        throw new UnauthorizedException(
          error instanceof ForbiddenException ? error.message : 'Session expired. Please login again',
        );
      }
    }

    return false;
  }
}