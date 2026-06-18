import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ClassRole } from '../decorators/class-role.decorator';
import { ClassRoleGuard } from '../guards/class-role.guard';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';
import {
  TogglePinClassUpdateRequestDto,
  TogglePinClassUpdateResponseDto,
} from '../dto/toggle-pin-class-update.dto';
import { TogglePinClassUpdateService } from '../services/updates/toggle-pin-class-update.service';

@ApiTags('Class Updates')
@Controller('classes/:classId/updates')
export class TogglePinClassUpdateController {
  constructor(
    private readonly togglePinClassUpdateService: TogglePinClassUpdateService,
  ) {}

  @Patch(':updateId/toggle-pin')
  @UseGuards(ClassRoleGuard)
  @ClassRole(EnrollmentRole.INSTRUCTOR, EnrollmentRole.ASSISTANT)
  @ApiOperation({ summary: 'Toggle pin status of a class update' })
  @ApiResponse({
    status: 200,
    description: 'Pin status updated successfully',
    type: TogglePinClassUpdateResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Class or update not found',
  })
  async togglePin(
    @Param('classId') classId: string,
    @Param('updateId') updateId: string,
    @Body() body: TogglePinClassUpdateRequestDto,
  ): Promise<TogglePinClassUpdateResponseDto> {
    return this.togglePinClassUpdateService.execute(classId, updateId, body);
  }
}