import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { IJwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { GetCurrentUserService } from '../services/me/get-current-user.service';

@ApiTags('Profile')
@ApiBearerAuth('JWT-auth')
@Controller('profile/me')
export class MeController {
  constructor(private readonly getCurrentUserService: GetCurrentUserService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Returns current user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async me(@CurrentUser() user: IJwtPayload) {
    return this.getCurrentUserService.execute(user.userId.toString());
  }
}
