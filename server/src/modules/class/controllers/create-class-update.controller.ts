// create-class-update.controller.ts

import {
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  CreateClassUpdateRequestDto,
  CreateClassUpdateResponseDto,
} from '../dto/create-class-update.dto';

import { CreateClassUpdateService } from '../services/updates/create-class-update.service';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ClassRole } from '../decorators/class-role.decorator';
import { ClassRoleGuard } from '../guards/class-role.guard';

import type { IJwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';

@ApiTags('Class Updates')
@Controller('classes/:classId/updates')
export class CreateClassUpdateController {
  constructor(
    private readonly createClassUpdateService: CreateClassUpdateService,
  ) { }

  @Post()
  @UseGuards(ClassRoleGuard)
  @ClassRole(EnrollmentRole.INSTRUCTOR, EnrollmentRole.ASSISTANT)
  @ApiOperation({ summary: 'Create a new update for a class' })
  @ApiResponse({
    status: 201,
    description: 'Class update created successfully',
    type: CreateClassUpdateResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createClassUpdate(
    @CurrentUser() user: IJwtPayload,
    @Param('classId') classId: string,
    @Body() dto: CreateClassUpdateRequestDto,
  ): Promise<CreateClassUpdateResponseDto> {
    return this.createClassUpdateService.execute(
      classId,
      user.userId.toString(),
      dto,
    );
  }
}