import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiSecurity } from '@nestjs/swagger';

import { 
  CreateClassUpdateRequestDto, 
  CreateClassUpdateResponseDto 
} from '../dto/create-class-update.dto';
import { CreateClassUpdateService } from '../services/create-class-update.service';
import { CurrentActor } from '../../../common/decorators/current-actor.decorator';
import type { IActor } from '../../auth/interfaces/actor.interface';

@ApiTags('Class')
@Controller('classes')
export class CreateClassUpdateController {
  constructor(
    private readonly createClassUpdateService: CreateClassUpdateService,
  ) {}

  @Post(':classId/updates')
  @ApiOperation({ summary: 'Create a new update for a class' })
  @ApiParam({ name: 'classId', example: '69f25d97124a37014d7f03d7', description: 'Target class ID' })
  @ApiSecurity('JWT-auth')
  @ApiSecurity('x-api-key')
  @ApiResponse({ status: 201, description: 'Class update created successfully', type: CreateClassUpdateResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createClassUpdate(
    @CurrentActor() actor: IActor,
    @Param('classId') classId: string,
    @Body() dto: CreateClassUpdateRequestDto,
  ): Promise<CreateClassUpdateResponseDto> {
    return this.createClassUpdateService.execute(classId, actor, dto);
  }
}