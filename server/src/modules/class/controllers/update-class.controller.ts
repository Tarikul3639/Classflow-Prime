import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UpdateClassRequestDto } from '../dto/update-class.dto';
import { UpdateClassService } from '../services/update-class.service';

import { ClassRoleGuard } from '../guards/class-role.guard';
import { ClassRole } from '../decorators/class-role.decorator';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';

@ApiTags('Class')
@Controller('classes')
export class UpdateClassController {
  constructor(private readonly updateClassService: UpdateClassService) {}

  @Patch(':classId')
  @UseGuards(ClassRoleGuard)
  @ClassRole(EnrollmentRole.INSTRUCTOR, EnrollmentRole.ASSISTANT)
  @ApiOperation({ summary: 'Update an existing class' })
  @ApiResponse({ status: 200, description: 'Class updated successfully' })
  async updateClass(
    @Param('classId') classId: string,
    @Body() updateClassRequestDto: UpdateClassRequestDto,
  ) {
    return await this.updateClassService.execute(
      classId,
      updateClassRequestDto,
    );
  }
}