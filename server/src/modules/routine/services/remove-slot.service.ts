// remove-slot.service.ts

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

import { DayOfWeek } from "../../../infrastructure/database/entities/routine/day-of-week.enum";

import {
    RemoveSlotResponseDto,
} from "../dto/remove-slot.dto";

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
export class RemoveSlotService {
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
        slotId: string,
    ): Promise<RemoveSlotResponseDto> {
        const userObjectId = new Types.ObjectId(userId);

        const classObjectId = new Types.ObjectId(classId);

        const slotObjectId = new Types.ObjectId(slotId);

        // ── Validate user ─────────────────────────────────────────────
        const user = await this.userModel.findById(userObjectId);

        if (!user) {
            throw new NotFoundException("User not found");
        }

        // ── Validate class ────────────────────────────────────────────
        const existingClass = await this.classModel.findById(classObjectId);

        if (!existingClass) {
            throw new NotFoundException("Class not found");
        }

        // ── Permission check ──────────────────────────────────────────
        const isInstructor =
            existingClass.instructorId.equals(userObjectId);

        const isAssistant = await this.enrollmentModel.exists({
            userId: userObjectId,
            classId: classObjectId,
            role: EnrollmentRole.ASSISTANT,
        });

        if (!isInstructor && !isAssistant) {
            throw new ForbiddenException(
                "Only instructors and assistants can remove slots",
            );
        }

        // ── Find routine ──────────────────────────────────────────────
        const routine = await this.routineModel.findOne({
            classId: classObjectId,
        });

        if (!routine) {
            throw new NotFoundException("Routine not found");
        }

        // ── Find slot ─────────────────────────────────────────────────
        const slot =
            await this.routineSlotModel.findById(slotObjectId);

        if (!slot) {
            throw new NotFoundException("Slot not found");
        }

        // ── Remove slot ───────────────────────────────────────────────
        await slot.deleteOne();

        // ── Fetch updated slots ───────────────────────────────────────
        const allSlots = await this.routineSlotModel
            .find({
                routineId: routine._id,
            })
            .sort({
                day: 1,
                periodNo: 1,
            });

        // ── Group schedule ────────────────────────────────────────────
        const activeDays = [
            ...new Set(allSlots.map((slot) => slot.day)),
        ].sort(
            (a, b) =>
                DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b),
        );

        const groupedSchedule = activeDays.map((day) => {
            const daySlots = allSlots
                .filter((slot) => slot.day === day)
                .sort(
                    (a, b) =>
                        (a.periodNo ?? 0) - (b.periodNo ?? 0),
                );

            return {
                day,

                slots: daySlots.map((slot) => ({
                    slotId: slot._id.toString(),

                    periodNo: slot.periodNo,

                    subject: slot.subject,

                    teacherName: slot.teacherName,

                    room: slot.room ?? "",
                })),
            };
        });

        return {
            success: true,

            message: "Slot removed successfully",

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