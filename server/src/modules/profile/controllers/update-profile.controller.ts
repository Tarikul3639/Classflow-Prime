import { Controller, Put, Body } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { IJwtPayload } from '../../auth/interfaces/jwt-payload.interface';

import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdateProfileService } from '../services/update/update-profile.service';

@ApiTags('Profile')
@ApiBearerAuth('JWT-auth')
@Controller('profile/update')
export class ProfileUpdateController {
  constructor(private readonly updateProfileService: UpdateProfileService) {}

  @Put()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @CurrentUser() user: IJwtPayload,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    // This is a placeholder implementation. The actual update logic should be implemented in the service layer.
    console.log(
      `Updating profile for user ${user.email} with data:`,
      updateProfileDto,
    );

    return await this.updateProfileService.execute(
      user.userId.toString(),
      updateProfileDto,
    );
  }
}
