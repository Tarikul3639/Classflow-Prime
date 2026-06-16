import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
    Routine,
    RoutineDocument,
} from '../../../infrastructure/database/entities/routine/routine.entity';

import {
    RoutineSlot,
    RoutineSlotDocument,
} from '../../../infrastructure/database/entities/routine/routine-slot.entity';

import { DayOfWeek } from '../../../infrastructure/database/entities/routine/day-of-week.enum';

import { GetRoutineResponseDto } from '../dto/get-routine.dto';

const DAY_ORDER: DayOfWeek[] = [
    DayOfWeek.Sunday,
    DayOfWeek.Monday,
    DayOfWeek.Tuesday,
    DayOfWeek.Wednesday,
    DayOfWeek.Thursday,
    DayOfWeek.Friday,
    DayOfWeek.Saturday,
];

@Injectable()
export class GetRoutineService {
    constructor(
        @InjectModel(Routine.name)
        private readonly routineModel: Model<RoutineDocument>,

        @InjectModel(RoutineSlot.name)
        private readonly routineSlotModel: Model<RoutineSlotDocument>,
    ) {}

    async execute(classId: string): Promise<GetRoutineResponseDto> {
        const classObjectId = new Types.ObjectId(classId);

        const routine = await this.routineModel
            .findOne({ classId: classObjectId })
            .lean();

        if (!routine) {
            throw new NotFoundException('Routine not found');
        }

        const slots = await this.routineSlotModel
            .find({ routineId: routine._id })
            .sort({ day: 1, periodNo: 1 })
            .lean();

        const activeDays = [
            ...new Set(slots.map((slot) => slot.day)),
        ].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));

        const groupedSchedule = activeDays.map((day) => {
            const daySlots = slots
                .filter((slot) => slot.day === day)
                .sort((a, b) => (a.periodNo ?? 0) - (b.periodNo ?? 0));

            return {
                day,
                slots: daySlots.map((slot) => ({
                    slotId: slot._id.toString(),
                    periodNo: slot.periodNo ?? 0,
                    subject: slot.subject ?? '',
                    teacherName: slot.teacherName ?? '',
                    room: slot.room ?? '',
                })),
            };
        });

        return {
            success: true,
            message: 'Routine fetched successfully',
            data: {
                routineId: routine._id.toString(),
                classId: routine.classId.toString(),
                periods: routine.periods.map((p) => ({
                    periodId: p._id.toString(),
                    periodNo: p.periodNo,
                    label: p.label,
                    startTime: p.startTime,
                    endTime: p.endTime,
                    isBreak: p.isBreak,
                })),
                schedule: groupedSchedule,
                createdAt: routine.createdAt,
                updatedAt: routine.updatedAt,
            },
        };
    }
}