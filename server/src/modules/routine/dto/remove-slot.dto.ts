// remove-slot.dto.ts

import {
    IsEnum,
    IsInt,
    Min,
} from "class-validator";

import { DayOfWeek } from "../../../infrastructure/database/entities/routine/day-of-week.enum";

import { GetRoutineResponseDto } from "./get-routine.dto";

export class RemoveSlotDto {
    @IsEnum(DayOfWeek)
    day!: DayOfWeek;

    @IsInt()
    @Min(1)
    periodNo!: number;
}

export class RemoveSlotResponseDto extends GetRoutineResponseDto {}