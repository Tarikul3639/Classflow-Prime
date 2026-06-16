import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { IJwtPayload } from '../interfaces/jwt-payload.interface';

import { SignOutDto } from '../dto/signout/signout.dto';
import { SignOutService } from '../services/signout/signout.service';

import { clearAuthCookies } from '../../../common/utils/auth-cookies.util';

@ApiTags('Auth')
@ApiBearerAuth('JWT-auth')
@Controller('auth/signout')
export class SignoutController {
  constructor(private readonly signOutService: SignOutService) {}

  /**
   * Sign out from current device (revoke the provided refresh token).
   * The client should also clear cookies on their side to complete the logout process.
   * If no refresh token is provided, it will still clear cookies but won't revoke any tokens in DB.
   */

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign out (current device)' })
  @ApiResponse({ status: 200, description: 'Signed out successfully' })
  async signoutCurrent(
    @CurrentUser() user: IJwtPayload,
    @Body() dto: SignOutDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // prefer cookie refreshToken; fallback to body for backward compatibility
    const refreshTokenFromCookie = (req.cookies as Record<string, string>)
      ?.refreshToken as string | undefined;
    const refreshToken = refreshTokenFromCookie || dto.refreshToken;

    // revoke refresh token in DB (if present)
    const result = await this.signOutService.execute(
      user.userId.toString(),
      refreshToken,
    );

    // clear cookies even if refreshToken missing/invalid (client should be logged out)
    clearAuthCookies(res);

    return {
      message: result.message,
    };
  }

  /**
   * Sign out from all devices (revoke all refresh tokens for the user).
   * This will log out the user from all devices, including the current one.
   * The client should also clear cookies on their side to complete the logout process.
   */

  @Post('all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign out (all devices)' })
  @ApiResponse({ status: 200, description: 'Signed out from all devices' })
  async signoutAll(
    @CurrentUser() user: IJwtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    // revoke all refresh tokens in DB for the user
    const result = await this.signOutService.signOutAll(user.userId.toString());
    // clear cookies on current device (client should be logged out)
    clearAuthCookies(res);
    return {
      message: result.message,
    };
  }
}
