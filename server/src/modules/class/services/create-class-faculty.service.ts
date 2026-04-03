import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../database/entities/class.entity';
import { Faculty, FacultyDocument } from '../../../database/entities/faculty.entity';
import { Enrollment, EnrollmentDocument } from '../../../database/entities/enrollment.entity';
import { EnrollmentRole } from '../../../database/interface/enrollment.interface';

import { CreateClassFacultyRequestDto, ClassFacultyResponseDto } from '../dto/class-faculty.dto';
import { ClassStatus } from '../../../database/interface/class.interface';

@Injectable()
export class CreateClassFacultyService {
    constructor(
        @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
        @InjectModel(Faculty.name) private readonly facultyModel: Model<FacultyDocument>,
        @InjectModel(Enrollment.name) private readonly enrollmentModel: Model<EnrollmentDocument>,
    ) { }

    async execute(
        userId: string,
        classId: string,
        dto: CreateClassFacultyRequestDto,
    ): Promise<ClassFacultyResponseDto> {
        const userObjectId = new Types.ObjectId(userId);
        const classObjectId = new Types.ObjectId(classId);

        // Check if class exists
        const existingClass = await this.classModel.findById(classId);
        if (!existingClass) throw new NotFoundException('Class not found');

        // Check if class is ended
        if (existingClass.status === ClassStatus.ENDED) {
            throw new ForbiddenException('Cannot add faculty to an ended class');
        }

        const isAssistant = await this.enrollmentModel.exists({
            userId: userObjectId,
            classId: classObjectId,
            role: EnrollmentRole.ASSISTANT,
        });

        if (!existingClass.instructorId.equals(userObjectId) && !isAssistant) {
            throw new ForbiddenException('Only the instructor and assistants can add faculties');
        }

        const faculty = new this.facultyModel({
            classId: new Types.ObjectId(classId),
            name: dto.name,
            designation: dto.designation,
            location: dto.location,
            email: dto.email,
            avatarUrl: dto.avatarUrl,
            phone: dto.phone,
            classroomCode: dto.classroomCode,
        });

        await faculty.save();

        return {
            success: true,
            message: 'Faculty added successfully',
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