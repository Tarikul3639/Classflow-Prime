// leave-class.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../infrastructure/database/entities/class.entity';
import { Enrollment, EnrollmentDocument } from '../../../infrastructure/database/entities/enrollment.entity';
import { LeaveClassResponseDto } from '../dto/class-settings.dto';

@Injectable()
export class LeaveClassService {
    constructor(
        @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
        @InjectModel(Enrollment.name) private readonly enrollmentModel: Model<EnrollmentDocument>,
    ) { }

    async execute(userId: string, classId: string): Promise<LeaveClassResponseDto> {
        const userObjectId = new Types.ObjectId(userId);
        const classObjectId = new Types.ObjectId(classId);

        // Check if class exists
        const existingClass = await this.classModel.findById(classObjectId);
        if (!existingClass) throw new NotFoundException('Class not found');

        if (existingClass.instructorId.equals(userObjectId)) {
            throw new ForbiddenException('Instructor cannot leave their own class');
        }

        const deleted = await this.enrollmentModel.findOneAndDelete({
            classId: classObjectId,
            userId: userObjectId,
        });

        if (!deleted) {
            throw new NotFoundException('You are not enrolled in this class');
        }

        return {
            success: true,
            message: 'You have left the class.',
        };
    }
}