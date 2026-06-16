// edit-slot.dto.ts

import {
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
} from "class-validator";

import { DayOfWeek } from "../../../infrastructure/database/entities/routine/day-of-week.enum";

import { GetRoutineResponseDto } from "./get-routine.dto";

export class EditSlotDto {
    @IsEnum(DayOfWeek)
    day!: DayOfWeek;

    @IsInt()
    @Min(1)
    periodNo!: number;

    @IsString()
    @IsNotEmpty()
    subject!: string;

    @IsString()
    @IsNotEmpty()
    teacherName!: string;

    @IsOptional()
    @IsString()
    room?: string;
}

export class EditSlotResponseDto extends GetRoutineResponseDto {}