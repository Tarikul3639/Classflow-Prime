import { Get, Param, Controller } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { IJwtPayload } from '../../auth/interfaces/jwt-payload.interface';

import { FetchClassUpdateResponseDto } from '../dto/fetch-class-update.dto';
import { FetchClassUpdateService } from '../services/fetch-class-update.service';

@ApiTags('Class')
@Controller('classes')
export class FetchClassUpdateController {
  constructor(
    private readonly fetchClassUpdateService: FetchClassUpdateService,
  ) {}

  @Get(':classId/update')
  @ApiOperation({ summary: 'Fetch class updates by class ID' })
  @ApiResponse({
    status: 200,
    description: 'Class updates fetched successfully',
    type: FetchClassUpdateResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Class not found' })
  async fetchClassUpdate(
    @CurrentUser() user: IJwtPayload,
    @Param('classId') classId: string,
  ): Promise<FetchClassUpdateResponseDto> {
    // DEBUG: Log the classId and userId received from the request
    console.log(
      'Fetching Updates - Class ID:',
      classId,
      'User ID:',
      user.userId,
    );

    return await this.fetchClassUpdateService.execute(
      user.userId.toString(),
      classId,
    );
  }
}
