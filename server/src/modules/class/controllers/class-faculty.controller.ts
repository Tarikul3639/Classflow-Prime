import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
    FetchClassFacultiesResponseDto,
    FetchSingleClassFacultyResponseDto,
    CreateClassFacultyRequestDto,
    UpdateSingleClassFacultyRequestDto,
    ClassFacultyResponseDto,
    DeleteClassFacultyResponseDto,
} from '../dto/class-faculty.dto';

import { FetchClassFacultiesService } from '../services/facultys/fetch-class-faculties.service';
import { CreateClassFacultyService } from '../services/facultys/create-class-faculty.service';
import { UpdateSingleClassFacultyService } from '../services/facultys/update-single-class-faculty.service';
import { DeleteClassFacultyService } from '../services/facultys/delete-class-faculty.service';
import { FetchSingleClassFacultyService } from '../services/facultys/fetch-single-class-faculty.service';

import { ClassRoleGuard } from '../guards/class-role.guard';
import { ClassRole } from '../decorators/class-role.decorator';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';

@ApiTags('Class Faculty')
@Controller('classes/:classId/faculties')
export class ClassFacultyController {
    constructor(
        private readonly fetchClassFacultiesService: FetchClassFacultiesService,
        private readonly createClassFacultyService: CreateClassFacultyService,
        private readonly updateSingleClassFacultyService: UpdateSingleClassFacultyService,
        private readonly deleteClassFacultyService: DeleteClassFacultyService,
        private readonly fetchSingleClassFacultyService: FetchSingleClassFacultyService,
    ) { }

    @Get()
    @UseGuards(ClassRoleGuard)
    @ClassRole(
        EnrollmentRole.INSTRUCTOR,
        EnrollmentRole.ASSISTANT,
        EnrollmentRole.LEARNER,
    )
    @ApiOperation({ summary: 'Fetch all faculties of a class' })
    @ApiResponse({
        status: 200,
        type: FetchClassFacultiesResponseDto,
    })
    async fetchFaculties(
        @Param('classId') classId: string,
    ): Promise<FetchClassFacultiesResponseDto> {
        return this.fetchClassFacultiesService.execute(classId);
    }

    @Get(':facultyId')
    @UseGuards(ClassRoleGuard)
    @ClassRole(
        EnrollmentRole.INSTRUCTOR,
        EnrollmentRole.ASSISTANT,
        EnrollmentRole.LEARNER,
    )
    @ApiOperation({
        summary: 'Fetch a single faculty of a class',
    })
    @ApiResponse({
        status: 200,
        type: FetchSingleClassFacultyResponseDto,
    })
    async fetchSingleFaculty(
        @Param('classId') classId: string,
        @Param('facultyId') facultyId: string,
    ): Promise<FetchSingleClassFacultyResponseDto> {
        return this.fetchSingleClassFacultyService.execute(
            classId,
            facultyId,
        );
    }

    @Post()
    @UseGuards(ClassRoleGuard)
    @ClassRole(EnrollmentRole.INSTRUCTOR, EnrollmentRole.ASSISTANT)
    @ApiOperation({ summary: 'Add a faculty to a class' })
    @ApiResponse({ status: 201, type: ClassFacultyResponseDto })
    async createFaculty(
        @Param('classId') classId: string,
        @Body() dto: CreateClassFacultyRequestDto,
    ): Promise<ClassFacultyResponseDto> {
        return this.createClassFacultyService.execute(classId, dto);
    }

    @Patch(':facultyId')
    @UseGuards(ClassRoleGuard)
    @ClassRole(
        EnrollmentRole.INSTRUCTOR,
        EnrollmentRole.ASSISTANT,
    )
    @ApiOperation({
        summary: 'Update a faculty in a class',
    })
    @ApiResponse({
        status: 200,
        type: ClassFacultyResponseDto,
    })
    async updateFaculty(
        @Param('classId') classId: string,
        @Param('facultyId') facultyId: string,
        @Body() dto: UpdateSingleClassFacultyRequestDto,
    ): Promise<ClassFacultyResponseDto> {
        return this.updateSingleClassFacultyService.execute(
            classId,
            facultyId,
            dto,
        );
    }

    @Delete(':facultyId')
    @UseGuards(ClassRoleGuard)
    @ClassRole(
        EnrollmentRole.INSTRUCTOR,
        EnrollmentRole.ASSISTANT,
    )
    @ApiOperation({ summary: 'Remove a faculty from a class' })
    @ApiResponse({
        status: 200,
        type: DeleteClassFacultyResponseDto,
    })
    async deleteFaculty(
        @Param('classId') classId: string,
        @Param('facultyId') facultyId: string,
    ): Promise<DeleteClassFacultyResponseDto> {
        return this.deleteClassFacultyService.execute(
            classId,
            facultyId,
        );
    }
}