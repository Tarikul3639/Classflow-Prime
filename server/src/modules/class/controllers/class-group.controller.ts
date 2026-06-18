import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateClassGroupRequestDto } from '../dto/class-group.dto';
import { FetchClassGroupsService } from '../services/group/fetch-class-groups.service';
import { FetchSingleClassGroupService } from '../services/group/fetch-single-class-group.service';
import { CreateClassGroupService } from '../services/group/create-class-group.service';
import { UpdateClassGroupService } from '../services/group/update-class-group.service';
import { DeleteClassGroupService } from '../services/group/delete-class-group.service';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { IJwtPayload } from '../../auth/interfaces/jwt-payload.interface';

import { ClassRoleGuard } from '../guards/class-role.guard';
import { ClassRole } from '../decorators/class-role.decorator';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';

@ApiTags('Class Group')
@Controller('classes/:classId/groups')
export class ClassGroupController {
    constructor(
        private readonly fetchClassGroupsService: FetchClassGroupsService,
        private readonly fetchSingleClassGroupService: FetchSingleClassGroupService,
        private readonly createClassGroupService: CreateClassGroupService,
        private readonly updateClassGroupService: UpdateClassGroupService,
        private readonly deleteClassGroupService: DeleteClassGroupService,
    ) { }

    @Get()
    @UseGuards(ClassRoleGuard)
    @ClassRole(
        EnrollmentRole.INSTRUCTOR,
        EnrollmentRole.ASSISTANT,
        EnrollmentRole.LEARNER,
    )
    async fetchGroups(
        @Param('classId') classId: string,
    ) {
        return this.fetchClassGroupsService.execute(
            classId,
        );
    }

    @Get(':groupId')
    @UseGuards(ClassRoleGuard)
    @ClassRole(
        EnrollmentRole.INSTRUCTOR,
        EnrollmentRole.ASSISTANT,
        EnrollmentRole.LEARNER,
    )
    async fetchSingleGroup(
        @Param('classId') classId: string,
        @Param('groupId') groupId: string,
    ) {
        return this.fetchSingleClassGroupService.execute(
            classId,
            groupId,
        );
    }

    @Post()
    @UseGuards(ClassRoleGuard)
    @ClassRole(
        EnrollmentRole.INSTRUCTOR,
        EnrollmentRole.ASSISTANT,
    )
    async createGroup(
        @Param('classId') classId: string,
        @CurrentUser() user: IJwtPayload,
        @Body() dto: CreateClassGroupRequestDto,
    ) {
        return this.createClassGroupService.execute(
            user.userId.toString(),
            classId,
            dto,
        );
    }

    @Patch(':groupId')
    @UseGuards(ClassRoleGuard)
    @ClassRole(EnrollmentRole.INSTRUCTOR, EnrollmentRole.ASSISTANT)
    @ApiOperation({ summary: 'Update a group in a class' })
    @ApiResponse({ status: 200 })
    async updateGroup(
        @Param('classId') classId: string,
        @Param('groupId') groupId: string,
        @Body() dto: Partial<CreateClassGroupRequestDto>,
    ) {
        return this.updateClassGroupService.execute(classId, groupId, dto);
    }

    @Delete(':groupId')
    @UseGuards(ClassRoleGuard)
    @ClassRole(EnrollmentRole.INSTRUCTOR, EnrollmentRole.ASSISTANT)
    @ApiOperation({ summary: 'Remove a group from a class' })
    @ApiResponse({ status: 200 })
    async deleteGroup(@Param('classId') classId: string, @Param('groupId') groupId: string) {
        return this.deleteClassGroupService.execute(classId, groupId);
    }
}