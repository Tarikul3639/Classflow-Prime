// delete-routine.service.ts

import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from "@nestjs/common";

import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import {
    Routine,
    RoutineDocument,
} from "../../../infrastructure/database/entities/routine/routine.entity";

import {
    RoutineSlot,
    RoutineSlotDocument,
} from "../../../infrastructure/database/entities/routine/routine-slot.entity";

import {
    User,
    UserDocument,
} from "../../../infrastructure/database/entities/user.entity";

import {
    Class,
    ClassDocument,
} from "../../../infrastructure/database/entities/class.entity";

import {
    Enrollment,
    EnrollmentDocument,
} from "../../../infrastructure/database/entities/enrollment.entity";

import { EnrollmentRole } from "../../../infrastructure/database/interface/enrollment.interface";

@Injectable()
export class DeleteRoutineService {
    constructor(
        @InjectModel(Routine.name)
        private readonly routineModel: Model<RoutineDocument>,

        @InjectModel(RoutineSlot.name)
        private readonly routineSlotModel: Model<RoutineSlotDocument>,

        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,

        @InjectModel(Class.name)
        private readonly classModel: Model<ClassDocument>,

        @InjectModel(Enrollment.name)
        private readonly enrollmentModel: Model<EnrollmentDocument>,
    ) { }

    async execute(
        userId: string,
        classId: string,
    ): Promise<{
        success: boolean;

        message: string;
    }> {
        const userObjectId = new Types.ObjectId(userId);

        const classObjectId = new Types.ObjectId(classId);

        // ── Validate user ─────────────────────────────────────────────
        const user = await this.userModel.findById(userObjectId);

        if (!user) {
            throw new NotFoundException("User not found");
        }

        // ── Validate class ────────────────────────────────────────────
        const existingClass = await this.classModel.findById(
            classObjectId,
        );

        if (!existingClass) {
            throw new NotFoundException("Class not found");
        }

        // ── Permission check ──────────────────────────────────────────
        const isInstructor =
            existingClass.instructorId.equals(
                userObjectId,
            );

        const isAssistant =
            await this.enrollmentModel.exists({
                userId: userObjectId,

                classId: classObjectId,

                role: EnrollmentRole.ASSISTANT,
            });

        if (!isInstructor && !isAssistant) {
            throw new ForbiddenException(
                "Only instructors and assistants can delete the routine",
            );
        }

        // ── Find routine ──────────────────────────────────────────────
        const routine =
            await this.routineModel.findOne({
                classId: classObjectId,
            });

        if (!routine) {
            throw new NotFoundException(
                "Routine not found",
            );
        }

        // ── Delete all slots ──────────────────────────────────────────
        await this.routineSlotModel.deleteMany({
            routineId: routine._id,
        });

        // ── Delete routine ────────────────────────────────────────────
        await routine.deleteOne();

        // ── Response ──────────────────────────────────────────────────
        return {
            success: true,

            message:
                "Routine deleted successfully",
        };
    }
}