// get-routine.dto.ts

import { Type } from 'class-transformer';

import { DayOfWeek } from '../../../infrastructure/database/entities/routine/day-of-week.enum';

//
// PERIOD RESPONSE
//

export class RoutinePeriodResponseDto {
    periodId!: string;
    periodNo!: number;
    label!: string; // "1st Period", "Lunch Break"
    startTime!: string;
    endTime!: string;
    isBreak!: boolean;
}

//
// SLOT RESPONSE
//

export class RoutineSlotResponseDto {
    slotId!: string;
    periodNo!: number;
    subject!: string;
    teacherName!: string;
    room!: string;
}

//
// DAY SCHEDULE RESPONSE
//

export class RoutineDayScheduleResponseDto {
    day!: DayOfWeek;

    @Type(() => RoutineSlotResponseDto)
    slots!: RoutineSlotResponseDto[];
}

//
// MAIN ROUTINE DATA
//

export class RoutineResponseDataDto {
    classId!: string;
    routineId!: string;
    @Type(() => RoutinePeriodResponseDto)
    periods!: RoutinePeriodResponseDto[];

    @Type(() => RoutineDayScheduleResponseDto)
    schedule!: RoutineDayScheduleResponseDto[];

    createdAt!: Date;
    updatedAt!: Date;
}

//
// FINAL RESPONSE
//

export class GetRoutineResponseDto {
    success!: boolean;
    message!: string;
    
    @Type(() => RoutineResponseDataDto)
    data!: RoutineResponseDataDto;
}