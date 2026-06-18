import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
    AddSlotService,
    EditSlotService,
    GetRoutineService,
    CreateRoutineService,
    RemoveSlotService,
    DeleteRoutineService,
} from './services';

import { AddSlotDto } from './dto/add-slot.dto';
import { EditSlotDto } from './dto/edit-slot.dto';
import { CreateRoutineDto } from './dto/create-routine.dto';

import { ClassRoleGuard } from '../class/guards/class-role.guard';
import { ClassRole } from '../class/decorators/class-role.decorator';
import { EnrollmentRole } from '../../infrastructure/database/interface/enrollment.interface';

@ApiTags('Class Routine')
@Controller('classes/:classId/routine')
export class RoutineController {
    constructor(
        private readonly createRoutineService: CreateRoutineService,
        private readonly addSlotService: AddSlotService,
        private readonly editSlotService: EditSlotService,
        private readonly getRoutineService: GetRoutineService,
        private readonly removeSlotService: RemoveSlotService,
        private readonly deleteRoutineService: DeleteRoutineService,
    ) { }

    @Post()
    @UseGuards(ClassRoleGuard)
    @ClassRole(EnrollmentRole.INSTRUCTOR)
    @ApiOperation({ summary: 'Create class routine', description: 'Create a new routine with period structure for a class' })
    @ApiResponse({ status: 201, description: 'Routine created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid request data' })
    @ApiResponse({ status: 403, description: 'Only instructors can create the routine' })
    @ApiResponse({ status: 409, description: 'Routine already exists' })
    async createRoutine(
        @Param('classId') classId: string,
        @Body() dto: CreateRoutineDto,
    ) {
        return this.createRoutineService.execute(classId, dto);
    }

    @Patch('add-slot')
    @UseGuards(ClassRoleGuard)
    @ClassRole(EnrollmentRole.INSTRUCTOR, EnrollmentRole.ASSISTANT)
    @ApiOperation({ summary: 'Add routine slot', description: 'Add a new subject slot to a specific day and period' })
    @ApiResponse({ status: 200, description: 'Slot added successfully' })
    async addSlot(
        @Param('classId') classId: string,
        @Body() dto: AddSlotDto,
    ) {
        return this.addSlotService.execute(classId, dto);
    }

    @Patch('edit-slot/:slotId')
    @UseGuards(ClassRoleGuard)
    @ClassRole(EnrollmentRole.INSTRUCTOR, EnrollmentRole.ASSISTANT)
    @ApiOperation({ summary: 'Edit routine slot', description: 'Update subject, teacher, room, day, or period for an existing slot' })
    @ApiResponse({ status: 200, description: 'Slot updated successfully' })
    async editSlot(
        @Param('classId') classId: string,
        @Param('slotId') slotId: string,
        @Body() dto: EditSlotDto,
    ) {
        return this.editSlotService.execute(classId, slotId, dto);
    }

    @Get()
    @UseGuards(ClassRoleGuard)
    @ClassRole(EnrollmentRole.INSTRUCTOR, EnrollmentRole.ASSISTANT, EnrollmentRole.LEARNER)
    @ApiOperation({ summary: 'Get class routine', description: 'Fetch the complete weekly routine for a specific class' })
    @ApiResponse({ status: 200, description: 'Routine fetched successfully' })
    async getRoutine(@Param('classId') classId: string) {
        return this.getRoutineService.execute(classId);
    }

    @Delete('remove-slot/:slotId')
    @UseGuards(ClassRoleGuard)
    @ClassRole(EnrollmentRole.INSTRUCTOR, EnrollmentRole.ASSISTANT)
    @ApiOperation({ summary: 'Remove routine slot', description: 'Delete a specific subject slot from the routine' })
    @ApiResponse({ status: 200, description: 'Slot removed successfully' })
    async removeSlot(@Param('classId') classId: string, @Param('slotId') slotId: string) {
        return this.removeSlotService.execute(classId, slotId);
    }

    @Delete()
    @UseGuards(ClassRoleGuard)
    @ClassRole(EnrollmentRole.INSTRUCTOR, EnrollmentRole.ASSISTANT)
    @ApiOperation({ summary: 'Delete class routine', description: 'Delete the full routine and all associated slots for a class' })
    @ApiResponse({ status: 200, description: 'Routine deleted successfully' })
    async deleteRoutine(@Param('classId') classId: string) {
        return this.deleteRoutineService.execute(classId);
    }
}