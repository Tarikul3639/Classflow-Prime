import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ClassRole } from '../decorators/class-role.decorator';
import { ClassRoleGuard } from '../guards/class-role.guard';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';
import {
  UpdateClassUpdateRequestDto,
  UpdateClassUpdateResponseDto,
} from '../dto/update-class-update.dto';
import { UpdateClassUpdateService } from '../services/updates/update-class-update.service';

@ApiTags('Class Updates')
@Controller('classes/:classId/updates')
export class UpdateClassUpdateController {
  constructor(
    private readonly updateClassUpdateService: UpdateClassUpdateService,
  ) {}

  @Patch(':updateId')
  @UseGuards(ClassRoleGuard)
  @ClassRole(EnrollmentRole.INSTRUCTOR, EnrollmentRole.ASSISTANT)
  @ApiOperation({ summary: 'Update a class update' })
  @ApiResponse({
    status: 200,
    description: 'Class update updated successfully',
    type: UpdateClassUpdateResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Class or update not found',
  })
  async updateClassUpdate(
    @Param('classId') classId: string,
    @Param('updateId') updateId: string,
    @Body() body: UpdateClassUpdateRequestDto,
  ): Promise<UpdateClassUpdateResponseDto> {
    return this.updateClassUpdateService.execute(classId, updateId, body);
  }
}