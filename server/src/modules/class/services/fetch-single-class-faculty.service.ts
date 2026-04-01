import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../database/entities/class.entity';
import {
    Enrollment,
    EnrollmentDocument,
} from '../../../database/entities/enrollment.entity';
import {
    Faculty,
    FacultyDocument,
} from '../../../database/entities/faculty.entity';
import { FetchSingleClassFacultyResponseDto } from '../dto/class-faculty.dto';

@Injectable()
export class FetchSingleClassFacultyService {
    constructor(
        @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
        @InjectModel(Enrollment.name)
        private readonly enrollmentModel: Model<EnrollmentDocument>,
        @InjectModel(Faculty.name)
        private readonly facultyModel: Model<FacultyDocument>,
    ) { }

    async execute(
        userId: string,
        classId: string,
        facultyId: string,
    ): Promise<FetchSingleClassFacultyResponseDto> {
        const objectUserId = new Types.ObjectId(userId);
        const objectClassId = new Types.ObjectId(classId);
        const objectFacultyId = new Types.ObjectId(facultyId);

        const existingClass = await this.classModel.findById(objectClassId);
        if (!existingClass) throw new NotFoundException('Class not found');

        const enrollment = await this.enrollmentModel.findOne({
            classId: objectClassId,
            userId: objectUserId,
        });
        if (!enrollment && !existingClass.instructorId.equals(objectUserId)) {
            throw new ForbiddenException('You are not enrolled in this class');
        }

        const faculty = await this.facultyModel
            .findOne({ _id: objectFacultyId, classId: objectClassId })
            .lean()
            .exec();
        if (!faculty) throw new NotFoundException('Faculty not found');

        return {
            success: true,
            message: 'Faculty fetched successfully',
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
