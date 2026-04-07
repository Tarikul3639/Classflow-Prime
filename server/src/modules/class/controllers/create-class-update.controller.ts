import { Body, Param, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateClassUpdateRequestDto, CreateClassUpdateResponseDto } from '../dto/create-class-update.dto';
import { CreateClassUpdateService } from '../services/create-class-update.service';

import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { IJwtPayload } from '../../../modules/auth/interfaces/jwt-payload.interface';

@ApiTags('Class')
@Controller('classes')
export class CreateClassUpdateController {
  constructor(
    private readonly createClassUpdateService: CreateClassUpdateService,
  ) { }

  @Post(':classId/updates')
  @ApiOperation({ summary: 'Create a new update for a class' })
  @ApiResponse({
    status: 201,
    description: 'Class update created successfully',
  })
  async createClassUpdate(
    @CurrentUser() user: IJwtPayload,
    @Param('classId') classId: string,
    @Body() createClassUpdateRequestDto: CreateClassUpdateRequestDto,
  ): Promise<CreateClassUpdateResponseDto> {
    return await this.createClassUpdateService.execute(
      classId.toString(),
      user.userId.toString(),
      createClassUpdateRequestDto,
    );
  }
}
