import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../infrastructure/database/entities/class.entity';
import { ClassStatus } from '../../../infrastructure/database/interface/class.interface';
import {
    Enrollment,
    EnrollmentDocument,
} from '../../../infrastructure/database/entities/enrollment.entity';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';
import {
    Faculty,
    FacultyDocument,
} from '../../../infrastructure/database/entities/faculty.entity';

import {
    UpdateSingleClassFacultyRequestDto,
    ClassFacultyResponseDto,
} from '../dto/class-faculty.dto';

@Injectable()
export class UpdateSingleClassFacultyService {
    constructor(
        @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
        @InjectModel(Faculty.name)
        private readonly facultyModel: Model<FacultyDocument>,
        @InjectModel(Enrollment.name)
        private readonly enrollmentModel: Model<EnrollmentDocument>,
    ) { }

    async execute(
        userId: string,
        classId: string,
        facultyId: string,
        dto: UpdateSingleClassFacultyRequestDto,
    ): Promise<ClassFacultyResponseDto> {
        // console.log('Update...', userId, classId, facultyId, dto);

        const userObjectId = new Types.ObjectId(userId);
        const classObjectId = new Types.ObjectId(classId);
        const facultyObjectId = new Types.ObjectId(facultyId);

        // Check if class exists
        const existingClass = await this.classModel.findById(classObjectId);
        if (!existingClass) throw new NotFoundException('Class not found');

        // Check if class is ended
        if (existingClass.status === ClassStatus.ENDED) {
            throw new ForbiddenException('Cannot update faculty in an ended class');
        }

        const isAssistant = await this.enrollmentModel.findOne({
            classId: classObjectId,
            userId: userObjectId,
            role: EnrollmentRole.ASSISTANT,
        });

        if (!existingClass.instructorId.equals(userObjectId) && !isAssistant) {
            throw new ForbiddenException(
                'Only the instructor or assistants can update faculties',
            );
        }

        const updateData = Object.fromEntries(
            Object.entries(dto).filter(([_, v]) => v !== undefined),
        );

        if (Object.keys(updateData).length === 0) {
            throw new NotFoundException('No valid fields provided for update');
        }

        // console.log('Fields: ', updateData);

        const faculty = await this.facultyModel.findOneAndUpdate(
            { _id: facultyObjectId as any, classId: classObjectId },
            { $set: updateData },
            { new: true },
        );

        if (!faculty) throw new NotFoundException('Faculty not found');

        return {
            success: true,
            message: 'Faculty updated successfully',
            data: {
                classId,
                faculty: {
                    facultyId: faculty._id.toString(),
                    name: faculty.name,
                    designation: faculty.designation,
                    location: faculty.location,
                    email: faculty.email,
                    avatarUrl: faculty.avatarUrl,
                    phone: faculty.phone,
                    classroomCode: faculty.classroomCode,
                },
            },
        };
    }
}
