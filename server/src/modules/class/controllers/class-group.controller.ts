// class-group.controller.ts
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

import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { IJwtPayload } from '../../../modules/auth/interfaces/jwt-payload.interface';

import {
    GetClassGroupsResponseDto,
    ClassGroupDto,
    CreateClassGroupRequestDto,
} from '../dto/class-group.dto';

import { FetchClassGroupsService } from '../services/fetch-class-groups.service';
import { FetchSingleClassGroupService } from '../services/fetch-single-class-group.service';
import { CreateClassGroupService } from '../services/create-class-group.service';
import { UpdateClassGroupService } from '../services/update-class-group.service';
import { DeleteClassGroupService } from '../services/delete-class-group.service';

@ApiTags('Class Group')
@Controller('classes/:classId/groups')
export class ClassGroupController {
    constructor(
        private readonly fetchClassGroupsService: FetchClassGroupsService,
        private readonly fetchSingleClassGroupService: FetchSingleClassGroupService,
        private readonly createClassGroupService: CreateClassGroupService,
        private readonly updateClassGroupService: UpdateClassGroupService,
        private readonly deleteClassGroupService: DeleteClassGroupService,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Fetch all groups of a class' })
    @ApiResponse({ status: 200, type: GetClassGroupsResponseDto })
    async fetchGroups(
        @CurrentUser() user: IJwtPayload,
        @Param('classId') classId: string,
    ): Promise<GetClassGroupsResponseDto> {
        return await this.fetchClassGroupsService.execute(
            user.userId.toString(),
            classId,
        );
    }

    @Get(':groupId')
    @ApiOperation({ summary: 'Fetch a single group of a class' })
    @ApiResponse({ status: 200 })
    async fetchSingleGroup(
        @CurrentUser() user: IJwtPayload,
        @Param('classId') classId: string,
        @Param('groupId') groupId: string,
    ) {
        return await this.fetchSingleClassGroupService.execute(
            user.userId.toString(),
            classId,
            groupId,
        );
    }

    @Post()
    @ApiOperation({ summary: 'Add a group to a class' })
    @ApiResponse({ status: 201 })
    async createGroup(
        @CurrentUser() user: IJwtPayload,
        @Param('classId') classId: string,
        @Body() dto: CreateClassGroupRequestDto,
    ) {
        return await this.createClassGroupService.execute(
            user.userId.toString(),
            classId,
            dto,
        );
    }

    @Patch(':groupId')
    @ApiOperation({ summary: 'Update a group in a class' })
    @ApiResponse({ status: 200 })
    async updateGroup(
        @CurrentUser() user: IJwtPayload,
        @Param('classId') classId: string,
        @Param('groupId') groupId: string,
        @Body() dto: Partial<CreateClassGroupRequestDto>,
    ) {
        return await this.updateClassGroupService.execute(
            user.userId.toString(),
            classId,
            groupId,
            dto,
        );
    }

    @Delete(':groupId')
    @ApiOperation({ summary: 'Remove a group from a class' })
    @ApiResponse({ status: 200 })
    async deleteGroup(
        @CurrentUser() user: IJwtPayload,
        @Param('classId') classId: string,
        @Param('groupId') groupId: string,
    ) {
        return await this.deleteClassGroupService.execute(
            user.userId.toString(),
            classId,
            groupId,
        );
    }
}