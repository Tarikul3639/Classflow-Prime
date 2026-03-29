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
    FetchClassFacultiesResponseDto,
    CreateClassFacultyRequestDto,
    UpdateClassFacultyRequestDto,
    ClassFacultyResponseDto,
    DeleteClassFacultyResponseDto,
} from '../dto/class-faculty.dto';

import { FetchClassFacultiesService } from '../services/fetch-class-faculties.service';
import { CreateClassFacultyService } from '../services/create-class-faculty.service';
import { UpdateClassFacultyService } from '../services/update-class-faculty.service';
import { DeleteClassFacultyService } from '../services/delete-class-faculty.service';

@ApiTags('Class Faculty')
@Controller('classes/:classId/faculties')
export class ClassFacultyController {
    constructor(
        private readonly fetchClassFacultiesService: FetchClassFacultiesService,
        private readonly createClassFacultyService: CreateClassFacultyService,
        private readonly updateClassFacultyService: UpdateClassFacultyService,
        private readonly deleteClassFacultyService: DeleteClassFacultyService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Fetch all faculties of a class' })
    @ApiResponse({ status: 200, type: FetchClassFacultiesResponseDto })
    async fetchFaculties(
        @CurrentUser() user: IJwtPayload,
        @Param('classId') classId: string,
    ): Promise<FetchClassFacultiesResponseDto> {
        return await this.fetchClassFacultiesService.execute(
            user.userId.toString(),
            classId,
        );
    }

    @Post()
    @ApiOperation({ summary: 'Add a faculty to a class' })
    @ApiResponse({ status: 201, type: ClassFacultyResponseDto })
    async createFaculty(
        @CurrentUser() user: IJwtPayload,
        @Param('classId') classId: string,
        @Body() dto: CreateClassFacultyRequestDto,
    ): Promise<ClassFacultyResponseDto> {
        return await this.createClassFacultyService.execute(
            user.userId.toString(),
            classId,
            dto,
        );
    }

    @Patch(':facultyId')
    @ApiOperation({ summary: 'Update a faculty in a class' })
    @ApiResponse({ status: 200, type: ClassFacultyResponseDto })
    async updateFaculty(
        @CurrentUser() user: IJwtPayload,
        @Param('classId') classId: string,
        @Param('facultyId') facultyId: string,
        @Body() dto: UpdateClassFacultyRequestDto,
    ): Promise<ClassFacultyResponseDto> {
        return await this.updateClassFacultyService.execute(
            user.userId.toString(),
            classId,
            facultyId,
            dto,
        );
    }

    @Delete(':facultyId')
    @ApiOperation({ summary: 'Remove a faculty from a class' })
    @ApiResponse({ status: 200, type: DeleteClassFacultyResponseDto })
    async deleteFaculty(
        @CurrentUser() user: IJwtPayload,
        @Param('classId') classId: string,
        @Param('facultyId') facultyId: string,
    ): Promise<DeleteClassFacultyResponseDto> {
        return await this.deleteClassFacultyService.execute(
            user.userId.toString(),
            classId,
            facultyId,
        );
    }
}