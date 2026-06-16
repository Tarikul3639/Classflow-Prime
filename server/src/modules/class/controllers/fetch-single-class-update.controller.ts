import { Get, Param, Controller } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { IJwtPayload } from '../../auth/interfaces/jwt-payload.interface';

// আপনার তৈরি করা নতুন Single Response DTO টি ইমপোর্ট করুন
import { FetchSingleClassUpdateResponseDto } from '../dto/fetch-single-class-update.dto';
import { FetchSingleClassUpdateService } from '../services/fetch-single-class-update.service';

@ApiTags('Class')
@Controller('classes')
export class FetchSingleClassUpdateController {
  constructor(
    private readonly fetchSingleClassUpdateService: FetchSingleClassUpdateService,
  ) {}

  @Get(':classId/updates/:updateId') // ফ্রন্টএন্ড থাঙ্ক অনুযায়ী পাথ
  @ApiOperation({ summary: 'Fetch a single class update by ID' })
  @ApiResponse({
    status: 200,
    description: 'Class update details fetched successfully',
    type: FetchSingleClassUpdateResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Update or Class not found' })
  async fetchSingleUpdate(
    @CurrentUser() user: IJwtPayload,
    @Param('classId') classId: string,
    @Param('updateId') updateId: string,
  ): Promise<FetchSingleClassUpdateResponseDto> {
    // DEBUG: Logging for tracking
    console.log(
      `Fetching Single Update - Class: ${classId}, Update: ${updateId}, User: ${user.userId}`,
    );

    // সার্ভিসে userId পাঠানো হচ্ছে মেম্বারশিপ বা পারমিশন চেক করার জন্য
    return await this.fetchSingleClassUpdateService.execute(
      user.userId.toString(),
      classId,
      updateId,
    );
  }
}
