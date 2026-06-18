import { Injectable, ConflictException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { Routine, RoutineDocument } from "../../../infrastructure/database/entities/routine/routine.entity";
import { CreateRoutineDto, CreateRoutineResponseDto } from "../dto/create-routine.dto";

@Injectable()
export class CreateRoutineService {
  constructor(
    @InjectModel(Routine.name) private readonly routineModel: Model<RoutineDocument>,
  ) {}

  async execute(classId: string, dto: CreateRoutineDto): Promise<CreateRoutineResponseDto> {
    const classObjectId = new Types.ObjectId(classId);

    // ── Validation ─────────────────────────────
    if (dto.periods.length < 1) {
      throw new BadRequestException("At least one period is required");
    }

    const uniquePeriods = new Set(dto.periods.map((p) => p.periodNo));
    if (uniquePeriods.size !== dto.periods.length) {
      throw new BadRequestException("Duplicate period numbers are not allowed");
    }

    // ── Prevent duplicate routine ──────────────
    const alreadyExists = await this.routineModel.exists({ classId: classObjectId });
    if (alreadyExists) {
      throw new ConflictException("Routine already exists for this class");
    }

    // ── Create routine ─────────────────────────
    const routine = await this.routineModel.create({
      classId: classObjectId,
      periods: dto.periods.map((p) => ({
        periodNo: p.periodNo,
        label: p.label,
        startTime: p.startTime,
        endTime: p.endTime,
        isBreak: p.isBreak ?? false,
      })),
    });

    return {
      success: true,
      message: "Routine created successfully",
      data: {
        classId: routine.classId.toString(),
        routineId: routine._id.toString(),
        periods: routine.periods.map((p) => ({
          periodId: p._id.toString(),
          periodNo: p.periodNo,
          label: p.label,
          startTime: p.startTime,
          endTime: p.endTime,
          isBreak: p.isBreak,
        })),
        schedule: [],
        createdAt: routine.createdAt,
        updatedAt: routine.updatedAt,
      },
    };
  }
}