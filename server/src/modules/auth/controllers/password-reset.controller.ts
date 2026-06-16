import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from '../../../common/decorators/public.decorator';
import { RequestInfo } from '../../../common/decorators/request-info.decorator';
import type { IRequestInfo } from '../../../common/decorators/request-info.decorator';

import { RequestPasswordResetDto } from '../dto/password-reset/request-password-reset.dto';
import { VerifyPasswordResetDto } from '../dto/password-reset/verify-password-reset.dto';
import { ResetPasswordDto } from '../dto/password-reset/reset-password.dto';

// Password reset flow
import { RequestService } from '../services/password-reset/request.service';
import { ResendOtpService } from '../services/password-reset/resend-otp.service';
import { VerifyOtpService } from '../services/password-reset/verify-otp.service';
import { ResetPasswordService } from '../services/password-reset/reset-password.service';

@ApiTags('Auth')
@Controller('auth/password-reset')
export class PasswordResetController {
  constructor(
    private readonly requestResetService: RequestService,
    private readonly resendResetService: ResendOtpService,
    private readonly verifyResetService: VerifyOtpService,
    private readonly confirmResetService: ResetPasswordService,
  ) {}

  @Public()
  @Post('request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset code' })
  @ApiResponse({ status: 200, description: 'Reset code sent' })
  async request(
    @Body() dto: RequestPasswordResetDto,
    @RequestInfo() info: IRequestInfo,
  ) {
    return this.requestResetService.execute(dto, info.ip, info.userAgent);
  }

  @Public()
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify password reset code' })
  @ApiResponse({ status: 200, description: 'Code verified' })
  async verify(@Body() dto: VerifyPasswordResetDto) {
    return this.verifyResetService.execute(dto);
  }

  @Public()
  @Post('resend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend password reset code' })
  @ApiResponse({ status: 200, description: 'Reset code resent' })
  async resend(
    @Body() dto: RequestPasswordResetDto,
    @RequestInfo() info: IRequestInfo,
  ) {
    return this.resendResetService.execute(dto, info.ip, info.userAgent);
  }

  @Public()
  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm password reset (set new password)' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  async confirm(@Body() dto: ResetPasswordDto) {
    return this.confirmResetService.execute(dto);
  }
}
