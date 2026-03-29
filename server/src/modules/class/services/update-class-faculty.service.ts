import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Class, ClassDocument } from '../../../database/entities/class.entity';
import { Faculty, FacultyDocument } from '../../../database/entities/faculty.entity';

import { UpdateClassFacultyRequestDto, ClassFacultyResponseDto } from '../dto/class-faculty.dto';

@Injectable()
export class UpdateClassFacultyService {
    constructor(
        @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
        @InjectModel(Faculty.name) private readonly facultyModel: Model<FacultyDocument>,
    ) { }

    async execute(
        userId: string,
        classId: string,
        facultyId: string,
        dto: UpdateClassFacultyRequestDto,
    ): Promise<ClassFacultyResponseDto> {
        const existingClass = await this.classModel.findById(classId);
        if (!existingClass) throw new NotFoundException('Class not found');

        if (existingClass.instructorId.toString() !== userId) {
            throw new ForbiddenException('Only the instructor can update faculties');
        }

        const faculty = await this.facultyModel.findOneAndUpdate(
            { _id: facultyId, classId },
            { $set: dto },
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