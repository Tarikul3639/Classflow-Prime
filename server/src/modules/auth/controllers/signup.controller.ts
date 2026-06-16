import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { Public } from '../../../common/decorators/public.decorator';
import { RequestInfo } from '../../../common/decorators/request-info.decorator';
import type { IRequestInfo } from '../../../common/decorators/request-info.decorator';
import {
  IAuthTokens,
  setAuthCookies,
} from '../../../common/utils/auth-cookies.util';

import { SignUpDto } from '../dto/signup/signup.dto';
import { VerifySignupEmailDto } from '../dto/signup/verify-signup-email.dto';
import { ResendSignupVerificationDto } from '../dto/signup/resend-signup-verification.dto';

import { SignUpService } from '../services/signup/signup.service';
import { VerifySignupEmailService } from '../services/signup/verify-signup-email.service';
import { ResendSignupVerificationService } from '../services/signup/resend-signup-verification.service';

/**
 * Signup Controller
 * Handles user registration and email verification
 */
@ApiTags('Auth')
@Controller('auth/signup')
export class SignupController {
  constructor(
    private readonly signUpService: SignUpService,
    private readonly verifySignupEmailService: VerifySignupEmailService,
    private readonly resendSignupVerificationService: ResendSignupVerificationService,
  ) {}

  /**
   * User registration endpoint.
   * Creates a new user and sends a verification code to their email.
   * This endpoint is public and does not require authentication.
   */

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Sign up (creates user + sends verification code)' })
  @ApiResponse({ status: 201, description: 'User created, code sent' })
  async signup(@Body() dto: SignUpDto) {
    return this.signUpService.execute(dto);
  }

  /**
   * Resend verification code endpoint.
   * Allows users to request a new verification code if they didn't receive the first one or if it expired.
   * This endpoint is public and does not require authentication.
   */

  @Public()
  @Post('resend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend signup verification code' })
  @ApiResponse({ status: 200, description: 'Verification code resent' })
  async resend(@Body() dto: ResendSignupVerificationDto) {
    return this.resendSignupVerificationService.execute(dto);
  }

  /**
   * Verify email endpoint.
   * Verifies the user's email using the code sent to them.
   * If verification is successful, it can also log in the user by returning auth tokens.
   * This endpoint is public and does not require authentication.
   */

  @Public()
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify signup email code' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  async verify(
    @Body() dto: VerifySignupEmailDto,
    @RequestInfo() info: IRequestInfo,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.verifySignupEmailService.execute(
      dto,
      info.ip,
      info.userAgent,
    );

    // Set HttpOnly cookies with the tokens
    setAuthCookies(res, result.data.tokens);

    // Optional: return user info without tokens since they are in cookies
    return {
      success: result.success,
      message: result.message,
      data: {
        user: result.data.user,
      },
    };
  }
}
