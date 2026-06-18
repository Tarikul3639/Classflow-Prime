import { Controller, Post, Delete, Patch, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { IJwtPayload } from '../../auth/interfaces/jwt-payload.interface';

import {
  LeaveClassResponseDto,
  DeleteClassResponseDto,
  MarkClassAsEndedResponseDto,
  FetchClassSettingsResponseDto,
  RegenerateClassCodeResponseDto,
  ToggleJoiningAllowedResponseDto,
} from '../dto/class-settings.dto';

import { LeaveClassService } from '../services/settings/leave-class.service';
import { DeleteClassService } from '../services/settings/delete-class.service';
import { MarkClassAsEndedService } from '../services/settings/mark-class-as-ended.service';
import { FetchClassSettingsService } from '../services/settings/fetch-class-settings.service';
import { RegenerateClassCodeService } from '../services/settings/regenerate-class-code.service';
import { ClassJoinAllowedToggleService } from '../services/settings/class-join-allowed-toggle.service';

import { ClassRoleGuard } from '../guards/class-role.guard';
import { ClassRole } from '../decorators/class-role.decorator';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';

@ApiTags('Class Actions')
@Controller('classes/:classId')
export class ClassActionsController {
  constructor(
    private readonly leaveClassService: LeaveClassService,
    private readonly deleteClassService: DeleteClassService,
    private readonly markClassAsEndedService: MarkClassAsEndedService,
    private readonly fetchClassSettingsService: FetchClassSettingsService,
    private readonly regenerateClassCodeService: RegenerateClassCodeService,
    private readonly classJoinAllowedToggleService: ClassJoinAllowedToggleService,
  ) {}

  @Post('leave')
  @UseGuards(ClassRoleGuard)
  @ClassRole(EnrollmentRole.LEARNER, EnrollmentRole.ASSISTANT, EnrollmentRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Leave a class' })
  @ApiResponse({ status: 200, type: LeaveClassResponseDto })
  async leaveClass(
    @CurrentUser() user: IJwtPayload,
    @Param('classId') classId: string,
  ): Promise<LeaveClassResponseDto> {
    return this.leaveClassService.execute(user.userId.toString(), classId);
  }

  @Delete()
  @UseGuards(ClassRoleGuard)
  @ClassRole(EnrollmentRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Delete a class' })
  @ApiResponse({ status: 200, type: DeleteClassResponseDto })
  async deleteClass(@Param('classId') classId: string): Promise<DeleteClassResponseDto> {
    return this.deleteClassService.execute(classId);
  }

  @Patch('end')
  @UseGuards(ClassRoleGuard)
  @ClassRole(EnrollmentRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Mark class as ended' })
  @ApiResponse({ status: 200, type: MarkClassAsEndedResponseDto })
  async markAsEnded(@Param('classId') classId: string): Promise<MarkClassAsEndedResponseDto> {
    return this.markClassAsEndedService.execute(classId);
  }

  @Get('settings')
  @UseGuards(ClassRoleGuard)
  @ClassRole(EnrollmentRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Fetch class settings' })
  @ApiResponse({ status: 200, type: FetchClassSettingsResponseDto })
  async fetchClassSettings(@Param('classId') classId: string): Promise<FetchClassSettingsResponseDto> {
    return this.fetchClassSettingsService.execute(classId);
  }

  @Patch('code/regenerate')
  @UseGuards(ClassRoleGuard)
  @ClassRole(EnrollmentRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Regenerate class join code' })
  @ApiResponse({ status: 200, type: RegenerateClassCodeResponseDto })
  async regenerateClassCode(@Param('classId') classId: string): Promise<RegenerateClassCodeResponseDto> {
    return this.regenerateClassCodeService.execute(classId);
  }

  @Patch('joining')
  @UseGuards(ClassRoleGuard)
  @ClassRole(EnrollmentRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Toggle joining allowed' })
  @ApiResponse({ status: 200, type: ToggleJoiningAllowedResponseDto })
  async toggleJoiningAllowed(@Param('classId') classId: string): Promise<ToggleJoiningAllowedResponseDto> {
    return this.classJoinAllowedToggleService.execute(classId);
  }
}