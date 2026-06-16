import {
    Injectable,
    BadRequestException,
    NotFoundException,
    ForbiddenException,
} from "@nestjs/common";

import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { Class, ClassDocument } from "../../../infrastructure/database/entities/class.entity";

import {
    Enrollment,
    EnrollmentDocument,
} from "../../../infrastructure/database/entities/enrollment.entity";

import { EnrollmentRole } from "../../../infrastructure/database/interface/enrollment.interface";

import {
    User,
    UserDocument,
} from "../../../infrastructure/database/entities/user.entity";

import {
    Routine,
    RoutineDocument,
} from "../../../infrastructure/database/entities/routine/routine.entity";

import {
    RoutineSlot,
    RoutineSlotDocument,
} from "../../../infrastructure/database/entities/routine/routine-slot.entity";

import { DayOfWeek } from "../../../infrastructure/database/entities/routine/day-of-week.enum";

import {
    AddSlotDto,
    AddSlotResponseDto,
} from "../dto/add-slot.dto";

const WEEK_DAYS: DayOfWeek[] = [
    DayOfWeek.Sunday,
    DayOfWeek.Monday,
    DayOfWeek.Tuesday,
    DayOfWeek.Wednesday,
    DayOfWeek.Thursday,
    DayOfWeek.Friday,
    DayOfWeek.Saturday,
];

@Injectable()
export class AddSlotService {
    constructor(
        @InjectModel(Routine.name)
        private readonly routineModel: Model<RoutineDocument>,

        @InjectModel(RoutineSlot.name)
        private readonly routineSlotModel: Model<RoutineSlotDocument>,

        @InjectModel(Enrollment.name)
        private readonly enrollmentModel: Model<EnrollmentDocument>,

        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,

        @InjectModel(Class.name)
        private readonly classModel: Model<ClassDocument>,
    ) {}

    async execute(
        userId: string,
        classId: string,
        dto: AddSlotDto,
    ): Promise<AddSlotResponseDto> {
        const userObjectId = new Types.ObjectId(userId);
        const classObjectId = new Types.ObjectId(classId);

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
                "Only instructors and assistants can edit the routine",
            );
        }

        // ── Find routine ──────────────────────────────────────────────
        const routine = await this.routineModel.findOne({
            classId: classObjectId,
        });

        if (!routine) {
            throw new NotFoundException("Routine not found");
        }

        // ── Validate period definition ────────────────────────────────
        const periodDefinition = routine.periods.find(
            (p) => p.periodNo === dto.periodNo,
        );

        if (!periodDefinition) {
            throw new BadRequestException(
                `Period ${dto.periodNo} is not defined in this routine`,
            );
        }

        // ── Prevent assigning to break period ─────────────────────────
        if (periodDefinition.isBreak) {
            throw new BadRequestException(
                `Cannot assign subject to break period ${dto.periodNo}`,
            );
        }

        // ── Prevent duplicate slot ────────────────────────────────────
        const alreadyExists = await this.routineSlotModel.exists({
            routineId: routine._id,
            classId: classObjectId,
            day: dto.day,
            periodNo: dto.periodNo,
        });

        if (alreadyExists) {
            throw new BadRequestException(
                `Period ${dto.periodNo} already exists for ${dto.day}`,
            );
        }

        // ── Create slot ───────────────────────────────────────────────
        await this.routineSlotModel.create({
            routineId: routine._id,

            classId: classObjectId,

            day: dto.day,

            periodNo: dto.periodNo,

            subject: dto.subject,

            teacherName: dto.teacherName,

            room: dto.room ?? "",
        });

        // ── Get updated slots ─────────────────────────────────────────
        const allSlots = await this.routineSlotModel
            .find({
                routineId: routine._id,
            })
            .sort({
                day: 1,
                periodNo: 1,
            });

        // ── Active days ───────────────────────────────────────────────
        const activeDays = [
            ...new Set(allSlots.map((slot) => slot.day)),
        ].sort(
            (a, b) =>
                WEEK_DAYS.indexOf(a) - WEEK_DAYS.indexOf(b),
        );

        // ── Group schedule ────────────────────────────────────────────
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

                    periodNo: slot.periodNo ?? 0,

                    subject: slot.subject ?? "",

                    teacherName: slot.teacherName ?? "",

                    room: slot.room ?? "",
                })),
            };
        });

        // ── Response ──────────────────────────────────────────────────
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