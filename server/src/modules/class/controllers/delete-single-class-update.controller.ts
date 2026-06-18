import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { DeleteSingleClassUpdateResponseDto } from '../dto/delete-single-class-update.dto';
import { DeleteSingleClassUpdateService } from '../services/updates/delete-single-class-update.service';
import { ClassRoleGuard } from '../guards/class-role.guard';
import { ClassRole } from '../decorators/class-role.decorator';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';

@ApiTags('Class Updates')
@Controller('classes/:classId/updates')
export class DeleteSingleClassUpdateController {
  constructor(
    private readonly deleteSingleClassUpdateService: DeleteSingleClassUpdateService,
  ) {}

  @Delete(':updateId')
  @UseGuards(ClassRoleGuard)
  @ClassRole(EnrollmentRole.INSTRUCTOR, EnrollmentRole.ASSISTANT)
  @ApiOperation({ summary: 'Delete a single class update' })
  @ApiResponse({ 
    status: 200, 
    description: 'Class update deleted successfully', 
    type: DeleteSingleClassUpdateResponseDto 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Class or update not found' 
  })
  async deleteSingleClassUpdate(
    @Param('classId') classId: string,
    @Param('updateId') updateId: string,
  ): Promise<DeleteSingleClassUpdateResponseDto> {
    return this.deleteSingleClassUpdateService.execute(classId, updateId);
  }
}