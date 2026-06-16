import {
    Injectable,
    ConflictException,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { User, UserDocument } from '../../../infrastructure/database/entities/user.entity';
import { Class, ClassDocument } from '../../../infrastructure/database/entities/class.entity';
import {
    Enrollment,
    EnrollmentDocument,
} from '../../../infrastructure/database/entities/enrollment.entity';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';

import {
    Routine,
    RoutineDocument,
} from '../../../infrastructure/database/entities/routine/routine.entity';

import { CreateRoutineDto } from '../dto/create-routine.dto';
import { CreateRoutineResponseDto } from '../dto/create-routine.dto';

import { DayOfWeek } from '../../../infrastructure/database/entities/routine/day-of-week.enum';

@Injectable()
export class CreateRoutineService {
    constructor(
        @InjectModel(Routine.name)
        private readonly routineModel: Model<RoutineDocument>,

        @InjectModel(Enrollment.name)
        private readonly enrollmentModel: Model<EnrollmentDocument>,

        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,

        @InjectModel(Class.name)
        private readonly classModel: Model<ClassDocument>,
    ) { }

    async execute(
        userId: string,
        classId: string,
        dto: CreateRoutineDto,
    ): Promise<CreateRoutineResponseDto> {
        const userObjectId = new Types.ObjectId(userId);
        const classObjectId = new Types.ObjectId(classId);

        // Validate user
        const user = await this.userModel.findById(userObjectId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Validate class
        const existingClass = await this.classModel.findById(classObjectId);
        if (!existingClass) {
            throw new NotFoundException('Class not found');
        }

        // Permission check
        const isInstructor = existingClass.instructorId.equals(userObjectId);

        const isAssistant = await this.enrollmentModel.exists({
            userId: userObjectId,
            classId: classObjectId,
            role: EnrollmentRole.ASSISTANT,
        });

        if (!isInstructor && !isAssistant) {
            throw new ForbiddenException(
                'Only instructors and assistants can create routine',
            );
        }

        if (dto.periods.length < 1) {
            throw new BadRequestException('At least one period is required');
        }

        // Prevent duplicate routine
        const alreadyExists = await this.routineModel.exists({
            classId: classObjectId,
        });

        if (alreadyExists) {
            throw new ConflictException('Routine already exists for this class');
        }

        // Create routine
        const routine = await this.routineModel.create({
            classId: classObjectId,
            periods: dto.periods.map((period) => ({
                periodNo: period.periodNo,
                label: period.label,
                startTime: period.startTime,
                endTime: period.endTime,
                isBreak: period.isBreak ?? false,
            })),
        });

        return {
            success: true,
            message: 'Routine created successfully',
            data: {
                classId: routine.classId.toString(),
                routineId: routine._id.toString(),
                periods: routine.periods.map((period) => ({
                    periodId: period._id.toString(),
                    periodNo: period.periodNo,
                    label: period.label,
                    startTime: period.startTime,
                    endTime: period.endTime,
                    isBreak: period.isBreak,
                })),
                schedule: [],
                createdAt: routine.createdAt,
                updatedAt: routine.updatedAt,
            },
        };
    }
}