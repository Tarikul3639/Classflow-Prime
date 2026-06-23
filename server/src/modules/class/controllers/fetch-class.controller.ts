import { Get, Param, Controller } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { IJwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { FetchClassResponseDto } from '../dto/fetch-class.dto';

import { FetchClassService } from '../services/fetch-class.service';

@ApiTags('Class')
@Controller('classes')
export class FetchClassController {
  constructor(private readonly fetchClassService: FetchClassService) {}

  @Get(':classId')
  @ApiOperation({ summary: 'Fetch class details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Class details fetched successfully',
  })
  async fetchClass(
    @CurrentUser() user: IJwtPayload,
    @Param('classId') classId: string,
  ): Promise<FetchClassResponseDto> {
    // console.log('Class ID: ', classId, 'User ID: ', user.userId); // DEBUG: Log the classId and userId received from the request
    return await this.fetchClassService.execute(
      user.userId.toString(),
      classId,
    );
  }
}
