import { Patch, Param, Controller, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { IJwtPayload } from '../../auth/interfaces/jwt-payload.interface';

import { UpdateClassUpdateRequestDto } from '../dto/update-class-update.dto';
import { UpdateClassUpdateResponseDto } from '../dto/update-class-update.dto';
import { UpdateClassUpdateService } from '../services/update-class-update.service';

@ApiTags('Class')
@Controller('classes')
export class UpdateClassUpdateController {
  constructor(
    private readonly updateClassUpdateService: UpdateClassUpdateService,
  ) {}

  @Patch(':classId/updates/:updateId')
  @ApiOperation({ summary: 'Update a class update (partial)' })
  @ApiResponse({
    status: 200,
    description: 'Class update updated successfully',
    type: UpdateClassUpdateResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Update or Class not found' })
  async updateClassUpdate(
    @CurrentUser() user: IJwtPayload,
    @Param('classId') classId: string,
    @Param('updateId') updateId: string,
    @Body() body: UpdateClassUpdateRequestDto,
  ): Promise<UpdateClassUpdateResponseDto> {
    return await this.updateClassUpdateService.execute(
      user.userId.toString(),
      classId,
      updateId,
      body,
    );
  }
}
