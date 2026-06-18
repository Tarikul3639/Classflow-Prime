import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { Routine, RoutineDocument } from "../../../infrastructure/database/entities/routine/routine.entity";
import { RoutineSlot, RoutineSlotDocument } from "../../../infrastructure/database/entities/routine/routine-slot.entity";
import { DayOfWeek } from "../../../infrastructure/database/entities/routine/day-of-week.enum";
import { AddSlotDto, AddSlotResponseDto } from "../dto/add-slot.dto";

const WEEK_DAYS: DayOfWeek[] = [
  DayOfWeek.Sunday, DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday,
  DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday,
];

@Injectable()
export class AddSlotService {
  constructor(
    @InjectModel(Routine.name) private readonly routineModel: Model<RoutineDocument>,
    @InjectModel(RoutineSlot.name) private readonly routineSlotModel: Model<RoutineSlotDocument>,
  ) {}

  async execute(classId: string, dto: AddSlotDto): Promise<AddSlotResponseDto> {
    const classObjectId = new Types.ObjectId(classId);

    // ── Find Routine & Validate Period ─────────────────────────────
    const routine = await this.routineModel.findOne({ classId: classObjectId });
    if (!routine) throw new NotFoundException("Routine not found");

    const periodDef = routine.periods.find((p) => p.periodNo === dto.periodNo);
    if (!periodDef) throw new BadRequestException(`Period ${dto.periodNo} is not defined`);
    if (periodDef.isBreak) throw new BadRequestException(`Cannot assign subject to break period ${dto.periodNo}`);

    // ── Check Duplicate Slot ──────────────────────────────────────
    const alreadyExists = await this.routineSlotModel.exists({
      routineId: routine._id,
      classId: classObjectId,
      day: dto.day,
      periodNo: dto.periodNo,
    });
    if (alreadyExists) throw new BadRequestException(`Period ${dto.periodNo} already exists for ${dto.day}`);

    // ── Create Slot ──────────────────────────────────────────────
    await this.routineSlotModel.create({
      routineId: routine._id,
      classId: classObjectId,
      day: dto.day,
      periodNo: dto.periodNo,
      subject: dto.subject,
      teacherName: dto.teacherName,
      room: dto.room ?? "",
    });

    // ── Fetch & Group Schedule ──────────────────────────────────
    const allSlots = await this.routineSlotModel
      .find({ routineId: routine._id })
      .sort({ day: 1, periodNo: 1 })
      .lean();

    const activeDays = [...new Set(allSlots.map((s) => s.day))].sort(
      (a, b) => WEEK_DAYS.indexOf(a) - WEEK_DAYS.indexOf(b)
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
          room: s.room ?? "",
        })),
    }));

    return {
      success: true,
      message: "Slot added successfully",
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