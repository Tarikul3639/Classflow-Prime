import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { FetchSingleClassUpdateResponseDto } from '../dto/fetch-single-class-update.dto';
import { FetchSingleClassUpdateService } from '../services/updates/fetch-single-class-update.service';
import { ClassRoleGuard } from '../guards/class-role.guard';
import { ClassRole } from '../decorators/class-role.decorator';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';

@ApiTags('Class Updates')
@Controller('classes/:classId/updates')
export class FetchSingleClassUpdateController {
  constructor(
    private readonly fetchSingleClassUpdateService: FetchSingleClassUpdateService,
  ) {}

  @Get(':updateId')
  @UseGuards(ClassRoleGuard)
  @ClassRole(EnrollmentRole.INSTRUCTOR, EnrollmentRole.ASSISTANT, EnrollmentRole.LEARNER)
  @ApiOperation({ summary: 'Fetch single class update' })
  @ApiResponse({ 
    status: 200, 
    description: 'Class update details fetched successfully', 
    type: FetchSingleClassUpdateResponseDto 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Class or update not found' 
  })
  async fetchSingleUpdate(
    @Param('classId') classId: string,
    @Param('updateId') updateId: string,
  ): Promise<FetchSingleClassUpdateResponseDto> {
    return this.fetchSingleClassUpdateService.execute(classId, updateId);
  }
}