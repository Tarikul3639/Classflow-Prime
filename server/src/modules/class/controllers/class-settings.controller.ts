// class-actions.controller.ts
import {
    Controller,
    Post,
    Delete,
    Patch,
    Get,
    Param,
} from '@nestjs/common';
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

import { LeaveClassService } from '../services/leave-class.service';
import { DeleteClassService } from '../services/delete-class.service';
import { MarkClassAsEndedService } from '../services/mark-class-as-ended.service';
import { FetchClassSettingsService } from '../services/fetch-class-settings.service';
import { RegenerateClassCodeService } from '../services/regenerate-class-code.service';
import { ClassJoinAllowedToggleService } from '../services/class-join-allowed-toggle.service';

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
    @ApiOperation({ summary: 'Leave a class' })
    @ApiResponse({ status: 200, type: LeaveClassResponseDto })
    async leaveClass(
        @CurrentUser() user: IJwtPayload,
        @Param('classId') classId: string,
    ): Promise<LeaveClassResponseDto> {
        return await this.leaveClassService.execute(
            user.userId.toString(),
            classId,
        );
    }

    @Delete()
    @ApiOperation({ summary: 'Delete a class' })
    @ApiResponse({ status: 200, type: DeleteClassResponseDto })
    async deleteClass(
        @CurrentUser() user: IJwtPayload,
        @Param('classId') classId: string,
    ): Promise<DeleteClassResponseDto> {
        return await this.deleteClassService.execute(
            user.userId.toString(),
            classId,
        );
    }

    @Patch('end')
    @ApiOperation({ summary: 'Mark a class as ended' })
    @ApiResponse({ status: 200, type: MarkClassAsEndedResponseDto })
    async markAsEnded(
        @CurrentUser() user: IJwtPayload,
        @Param('classId') classId: string,
    ): Promise<MarkClassAsEndedResponseDto> {
        return await this.markClassAsEndedService.execute(
            user.userId.toString(),
            classId,
        );
    }

    @Get('settings')
    @ApiOperation({ summary: 'Fetch class join code' })
    @ApiResponse({ status: 200, type: FetchClassSettingsResponseDto })
    async fetchClassCode(
        @CurrentUser() user: IJwtPayload,
        @Param('classId') classId: string,
    ): Promise<FetchClassSettingsResponseDto> {
        return await this.fetchClassSettingsService.execute(
            user.userId.toString(),
            classId,
        );
    }

    @Patch('code/regenerate')
    @ApiOperation({ summary: 'Regenerate class join code' })
    @ApiResponse({ status: 200, type: RegenerateClassCodeResponseDto })
    async regenerateClassCode(
        @CurrentUser() user: IJwtPayload,
        @Param('classId') classId: string,
    ): Promise<RegenerateClassCodeResponseDto> {
        return await this.regenerateClassCodeService.execute(
            user.userId.toString(),
            classId,
        );
    }

    @Patch('joining')
    @ApiOperation({ summary: 'Toggle joining allowed for the class' })
    @ApiResponse({ status: 200, description: 'Joining allowed status toggled successfully' })
    async toggleJoiningAllowed(
        @CurrentUser() user: IJwtPayload,
        @Param('classId') classId: string,
    ): Promise<ToggleJoiningAllowedResponseDto> {
        return await this.classJoinAllowedToggleService.execute(
            user.userId.toString(),
            classId,
        );
    }
}