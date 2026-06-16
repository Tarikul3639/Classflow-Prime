import {
    Body,
    Controller,
    Delete,
    Param,
    Patch,
    Post,
    Get,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { IJwtPayload } from '../../auth/interfaces/jwt-payload.interface';

import { GetClassMembersResponseWrapperDto, AssignAssistantRequestDto, RevokeAssistantRequestDto } from '../dto/class-member.dto';
import { FetchClassMembersService } from '../services/fetch-class-members.service';
import { AssistantAssignClassMemberService } from '../services/assistant-assign-class-member.service';
import { AssistantRevokeClassMemberService } from '../services/assistant-revoke-class-member.service';
import { MemberRevokeClassMemberService } from '../services/member-revoke-class-member.service';

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
    @ApiOperation({ summary: 'Fetch all members of a class' })
    @ApiResponse({ status: 200, type: GetClassMembersResponseWrapperDto })
    async fetchMembers(
        @CurrentUser() user: IJwtPayload,
        @Param('classId') classId: string,
    ): Promise<GetClassMembersResponseWrapperDto> {
        return await this.fetchClassMembersService.execute(
            user.userId.toString(),
            classId,
        );
    }

    @Post('assign-assistant')
    @ApiOperation({ summary: 'Assign a member as assistant' })
    @ApiResponse({ status: 200, description: 'Assistant assigned successfully' })
    async assignAssistant(
        @CurrentUser() user: IJwtPayload,
        @Param('classId') classId: string,
        @Body() dto: AssignAssistantRequestDto,
    ) {
        return await this.assistantAssignClassMemberService.execute(
            user.userId.toString(),
            classId,
            dto,
        );
    }

    @Post('revoke-assistant')
    @ApiOperation({ summary: 'Revoke assistant role from a member' })
    @ApiResponse({ status: 200, description: 'Assistant role revoked successfully' })
    async revokeAssistant(
        @CurrentUser() user: IJwtPayload,
        @Param('classId') classId: string,
        @Body() dto: RevokeAssistantRequestDto,
    ) {
        // For simplicity, we can reuse the same service method to set the role back to STUDENT
        return await this.assistantRevokeClassMemberService.execute(
            user.userId.toString(),
            classId,
            dto,
        );
    }

    @Delete(':userId')
    @ApiOperation({ summary: 'Remove a member from the class' })
    @ApiResponse({ status: 200, description: 'Member removed successfully' })
    async revokeMember(
        @CurrentUser() user: IJwtPayload,
        @Param('classId') classId: string,
        @Param('userId') memberId: string,
    ) {
        // This method would call a service to remove the member from the class
        // For simplicity, we can reuse the assistant revoke service to set the role to null or remove enrollment
        return await this.memberRevokeClassMemberService.execute(
            user.userId.toString(),
            classId,
            memberId,
        );

    }
}