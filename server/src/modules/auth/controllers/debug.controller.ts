import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';
import {
  AccessTokenDecodeDto,
  RefreshTokenDecodeDto,
  PasswordDecodeDto,
} from '../dto/debug/debug.dto';
import { Public } from '../../../common/decorators/public.decorator';
import * as bcrypt from 'bcrypt';

@ApiTags('Debug')
@Controller('debug')
export class DebugController {
  constructor(private readonly jwtService: JwtService) {}

  @Public()
  @Post('access-token-decode')
  @ApiOperation({ summary: 'Decode a JWT token' })
  decodeToken(@Body() dto: AccessTokenDecodeDto) {
    const { token } = dto;

    try {
      const payload = this.jwtService.decode(token, {
        json: true,
      }) as IJwtPayload;

      // exp timestamp convert to local time
      const expLocal = payload?.exp
        ? new Date(payload.exp * 1000).toLocaleString()
        : null;

      return {
        success: true,
        message: 'Access token decoded successfully',
        payload: { ...payload, exp: expLocal },
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  @Public()
  @Post('refresh-token-decode')
  @ApiOperation({ summary: 'Decode a JWT refresh token' })
  decodeRefreshToken(@Body() dto: RefreshTokenDecodeDto) {
    const { token } = dto;

    try {
      const payload = this.jwtService.decode(token, {
        json: true,
      }) as IJwtPayload;

      // exp timestamp convert to local time
      const expLocal = payload?.exp
        ? new Date(payload.exp * 1000).toLocaleString()
        : null;

      return {
        success: true,
        message: 'Refresh token decoded successfully',
        payload: { ...payload, exp: expLocal },
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  @Public()
  @Post('password-encrypt')
  @ApiOperation({ summary: 'Encrypt a password with bcrypt' })
  async encryptPassword(@Body() dto: PasswordDecodeDto) {
    const { password } = dto;
    try {
      const hash = await bcrypt
        .genSalt(10)
        .then((salt) => bcrypt.hash(password, salt));
      return {
        success: true,
        message: 'Password encrypted successfully',
        hash: hash,
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}
