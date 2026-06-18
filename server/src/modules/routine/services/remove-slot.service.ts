import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Routine, RoutineDocument } from '../../../infrastructure/database/entities/routine/routine.entity';
import { RoutineSlot, RoutineSlotDocument } from '../../../infrastructure/database/entities/routine/routine-slot.entity';
import { Class, ClassDocument } from '../../../infrastructure/database/entities/class.entity';
import { RemoveSlotResponseDto } from '../dto/remove-slot.dto';
import { DayOfWeek } from '../../../infrastructure/database/entities/routine/day-of-week.enum';

const DAY_ORDER: DayOfWeek[] = [
  DayOfWeek.Sunday, DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, 
  DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday,
];

@Injectable()
export class RemoveSlotService {
  constructor(
    @InjectModel(Routine.name) private readonly routineModel: Model<RoutineDocument>,
    @InjectModel(RoutineSlot.name) private readonly routineSlotModel: Model<RoutineSlotDocument>,
    @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
  ) {}

  async execute(classId: string, slotId: string): Promise<RemoveSlotResponseDto> {
    if (!Types.ObjectId.isValid(classId) || !Types.ObjectId.isValid(slotId)) {
      throw new NotFoundException('Invalid ID format');
    }

    const classObjectId = new Types.ObjectId(classId);
    const slotObjectId = new Types.ObjectId(slotId);

    // Validate existence
    const exists = await Promise.all([
      this.classModel.exists({ _id: classObjectId }),
      this.routineModel.findOne({ classId: classObjectId }).lean(),
    ]);

    if (!exists[0]) throw new NotFoundException('Class not found');
    const routine = exists[1];
    if (!routine) throw new NotFoundException('Routine not found');

    const slot = await this.routineSlotModel.findById(slotObjectId);
    if (!slot || !slot.routineId.equals(routine._id)) {
      throw new NotFoundException('Slot not found in this routine');
    }

    await slot.deleteOne();

    // Rebuild schedule
    const allSlots = await this.routineSlotModel
      .find({ routineId: routine._id })
      .sort({ day: 1, periodNo: 1 })
      .lean();

    const activeDays = [...new Set(allSlots.map((s) => s.day))].sort(
      (a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b)
    );

    const groupedSchedule = activeDays.map((day) => ({
      day,
      slots: allSlots
        .filter((s) => s.day === day)
        .sort((a, b) => (a.periodNo ?? 0) - (b.periodNo ?? 0))
        .map((s) => ({
          slotId: s._id.toString(),
          periodNo: s.periodNo,
          subject: s.subject,
          teacherName: s.teacherName,
          room: s.room ?? '',
        })),
    }));

    return {
      success: true,
      message: 'Slot removed successfully',
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