import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { Routine, RoutineDocument } from "../../../infrastructure/database/entities/routine/routine.entity";
import { RoutineSlot, RoutineSlotDocument } from "../../../infrastructure/database/entities/routine/routine-slot.entity";

@Injectable()
export class DeleteRoutineService {
  constructor(
    @InjectModel(Routine.name) private readonly routineModel: Model<RoutineDocument>,
    @InjectModel(RoutineSlot.name) private readonly routineSlotModel: Model<RoutineSlotDocument>,
  ) {}

  async execute(classId: string): Promise<{ success: boolean; message: string }> {
    const classObjectId = new Types.ObjectId(classId);

    // ── Find and Delete Routine ───────────────────────────
    const routine = await this.routineModel.findOne({ classId: classObjectId });
    if (!routine) {
      throw new NotFoundException("Routine not found");
    }

    // ── Execute Cleanup ──────────────────────────────────
    await Promise.all([
      this.routineSlotModel.deleteMany({ routineId: routine._id }),
      routine.deleteOne(),
    ]);

    return {
      success: true,
      message: "Routine deleted successfully",
    };
  }
}