import {
    Body,
    Controller,
    Delete,
    Param,
    Post,
    Get,
    UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { IJwtPayload } from '../../auth/interfaces/jwt-payload.interface';

import {
    AssignAssistantRequestDto,
    RevokeAssistantRequestDto,
} from '../dto/class-member.dto';

import { FetchClassMembersService } from '../services/members/fetch-class-members.service';
import { AssistantAssignClassMemberService } from '../services/members/assistant-assign-class-member.service';
import { AssistantRevokeClassMemberService } from '../services/members/assistant-revoke-class-member.service';
import { MemberRevokeClassMemberService } from '../services/members/member-revoke-class-member.service';

import { ClassRoleGuard } from '../guards/class-role.guard';
import { ClassRole } from '../decorators/class-role.decorator';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';

@ApiTags('Class Members')
@Controller('classes/:classId/members')
export class ClassMemberController {
    constructor(
        private readonly fetchClassMembersService: FetchClassMembersService,
        private readonly assistantAssignClassMemberService: AssistantAssignClassMemberService,
        private readonly assistantRevokeClassMemberService: AssistantRevokeClassMemberService,
        private readonly memberRevokeClassMemberService: MemberRevokeClassMemberService,
    ) { }

    @Get()
    @UseGuards(ClassRoleGuard)
    @ClassRole(
        EnrollmentRole.INSTRUCTOR,
        EnrollmentRole.ASSISTANT,
        EnrollmentRole.LEARNER,
    )
    async fetchMembers(@Param('classId') classId: string) {
        return this.fetchClassMembersService.execute(classId);
    }

    @Post('assign-assistant')
    @UseGuards(ClassRoleGuard)
    @ClassRole(EnrollmentRole.INSTRUCTOR)
    @ApiOperation({ summary: 'Assign a member as assistant' })
    @ApiResponse({ status: 200, description: 'Assistant assigned successfully' })
    async assignAssistant(
        @CurrentUser() user: IJwtPayload,
        @Param('classId') classId: string,
        @Body() dto: AssignAssistantRequestDto,
    ) {
        return this.assistantAssignClassMemberService.execute(
            user.userId.toString(),
            classId,
            dto,
        );
    }

    @Post('revoke-assistant')
    @UseGuards(ClassRoleGuard)
    @ClassRole(EnrollmentRole.INSTRUCTOR)
    @ApiOperation({ summary: 'Revoke assistant role from a member' })
    @ApiResponse({ status: 200, description: 'Assistant revoked successfully' })
    async revokeAssistant(
        @Param('classId') classId: string,
        @Body() dto: RevokeAssistantRequestDto,
    ) {
        return this.assistantRevokeClassMemberService.execute(classId, dto);
    }

    @Delete(':userId')
    @UseGuards(ClassRoleGuard)
    @ClassRole(EnrollmentRole.INSTRUCTOR)
    @ApiOperation({ summary: 'Revoke a member from the class' })
    @ApiResponse({ status: 200, description: 'Member revoked successfully' })
    async revokeMember(
        @Param('classId') classId: string,
        @Param('userId') memberId: string,
    ) {
        return this.memberRevokeClassMemberService.execute(classId, memberId);
    }
}
