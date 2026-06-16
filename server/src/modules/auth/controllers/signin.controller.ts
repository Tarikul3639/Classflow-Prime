import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Headers,
  Post,
  Req,
  Res,
  Ip,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from '../../../common/decorators/public.decorator';
import { RequestInfo } from '../../../common/decorators/request-info.decorator';
import type { IRequestInfo } from '../../../common/decorators/request-info.decorator';
import { setAuthCookies } from '../../../common/utils/auth-cookies.util';

import { SignInDto } from '../dto/signin/signin.dto';
import { SignInService } from '../services/signin/signin.service';

@ApiTags('Auth')
@Controller('auth/signin')
export class SigninController {
  constructor(private readonly signInService: SignInService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in' })
  @ApiResponse({ status: 200, description: 'Signed in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async signin(
    @Body() dto: SignInDto,
    @RequestInfo() info: IRequestInfo,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Call the service to perform sign-in logic
    const result = await this.signInService.execute(
      dto,
      info.ip,
      info.userAgent,
    );

    // set HttpOnly cookies here (HTTP layer concern)
    setAuthCookies(res, result.data.tokens);

    // Optional: tokens removed from response body since they are in cookies, but can be included if needed by frontend
    return {
      success: result.success,
      message: result.message,
      data: {
        user: result.data.user,
      },
    };
  }
}
