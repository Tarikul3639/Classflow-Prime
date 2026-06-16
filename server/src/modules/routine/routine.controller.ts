import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
} from "@nestjs/common";

import {
    ApiOperation,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { IJwtPayload } from "../auth/interfaces/jwt-payload.interface";

import {
    AddSlotService,
    EditSlotService,
    GetRoutineService,
    CreateRoutineService,
    RemoveSlotService,
    DeleteRoutineService,
} from "./services";

import { AddSlotDto } from "./dto/add-slot.dto";
import { EditSlotDto } from "./dto/edit-slot.dto";
import { CreateRoutineDto } from "./dto/create-routine.dto";

@ApiTags("Class Routine")
@Controller("classes/:classId/routine")
export class RoutineController {
    constructor(
        private readonly createRoutineService: CreateRoutineService,
        private readonly addSlotService: AddSlotService,
        private readonly editSlotService: EditSlotService,
        private readonly getRoutineService: GetRoutineService,
        private readonly removeSlotService: RemoveSlotService,
        private readonly deleteRoutineService: DeleteRoutineService,
    ) { }

    /**
     * Create routine
     */
    @Post()
    @ApiOperation({
        summary: "Create class routine",

        description:
            "Create a new routine with period structure for a class",
    })
    @ApiResponse({
        status: 201,
        description: "Routine created successfully",
    })
    @ApiResponse({
        status: 400,
        description: "Invalid request data",
    })
    @ApiResponse({
        status: 409,
        description: "Routine already exists for this class",
    })
    async createRoutine(
        @CurrentUser() user: IJwtPayload,

        @Param("classId") classId: string,

        @Body() dto: CreateRoutineDto,
    ) {
        return this.createRoutineService.execute(
            user.userId.toString(),
            classId,
            dto,
        );
    }

    /**
     * Add routine slot
     */
    @Patch("add-slot")
    @ApiOperation({
        summary: "Add routine slot",

        description:
            "Add a new subject slot to a specific day and period",
    })
    @ApiResponse({
        status: 200,
        description: "Slot added successfully",
    })
    @ApiResponse({
        status: 400,
        description: "Invalid request data",
    })
    @ApiResponse({
        status: 404,
        description: "Routine or class not found",
    })
    async addSlot(
        @CurrentUser() user: IJwtPayload,

        @Param("classId") classId: string,

        @Body() dto: AddSlotDto,
    ) {
        return this.addSlotService.execute(
            user.userId.toString(),
            classId,
            dto,
        );
    }

    /**
     * Edit routine slot
     */
    @Patch("edit-slot/:slotId")
    @ApiOperation({
        summary: "Edit routine slot",

        description:
            "Update subject, teacher, room, day, or period for an existing slot",
    })
    @ApiResponse({
        status: 200,
        description: "Slot updated successfully",
    })
    @ApiResponse({
        status: 400,
        description: "Invalid request data",
    })
    @ApiResponse({
        status: 404,
        description: "Slot or class not found",
    })
    async editSlot(
        @CurrentUser() user: IJwtPayload,

        @Param("classId") classId: string,

        @Param("slotId") slotId: string,

        @Body() dto: EditSlotDto,
    ) {
        return this.editSlotService.execute(
            user.userId.toString(),
            classId,
            slotId,
            dto,
        );
    }

    /**
     * Get full routine
     */
    @Get()
    @ApiOperation({
        summary: "Get class routine",

        description:
            "Fetch the complete weekly routine for a specific class",
    })
    @ApiResponse({
        status: 200,
        description: "Routine fetched successfully",
    })
    @ApiResponse({
        status: 404,
        description: "Class routine not found",
    })
    async getRoutine(
        @Param("classId") classId: string,
    ) {
        return this.getRoutineService.execute(classId);
    }

    /**
     * Remove routine slot
     */
    @Delete("remove-slot/:slotId")
    @ApiOperation({
        summary: "Remove routine slot",

        description:
            "Delete a specific subject slot from the routine",
    })
    @ApiResponse({
        status: 200,
        description: "Slot removed successfully",
    })
    @ApiResponse({
        status: 404,
        description: "Slot or class not found",
    })
    async removeSlot(
        @CurrentUser() user: IJwtPayload,
        @Param("classId") classId: string,
        @Param("slotId") slotId: string,
    ) {
        return this.removeSlotService.execute(
            user.userId.toString(),
            classId,
            slotId,
        );
    }

    /**
 * Delete routine
 */
    @Delete()
    @ApiOperation({
        summary: "Delete class routine",

        description:
            "Delete the full routine and all associated slots for a class",
    })
    @ApiResponse({
        status: 200,
        description: "Routine deleted successfully",
    })
    @ApiResponse({
        status: 404,
        description: "Routine or class not found",
    })
    @ApiResponse({
        status: 403,
        description:
            "Only instructors and assistants can delete the routine",
    })
    async deleteRoutine(
        @CurrentUser() user: IJwtPayload,

        @Param("classId") classId: string,
    ) {
        return this.deleteRoutineService.execute(
            user.userId.toString(),
            classId,
        );
    }
}