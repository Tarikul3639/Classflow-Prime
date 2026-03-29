import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../database/entities/class.entity';
import { Faculty, FacultyDocument } from '../../../database/entities/faculty.entity';

import { CreateClassFacultyRequestDto, ClassFacultyResponseDto } from '../dto/class-faculty.dto';

@Injectable()
export class CreateClassFacultyService {
    constructor(
        @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
        @InjectModel(Faculty.name) private readonly facultyModel: Model<FacultyDocument>,
    ) { }

    async execute(
        userId: string,
        classId: string,
        dto: CreateClassFacultyRequestDto,
    ): Promise<ClassFacultyResponseDto> {
        const existingClass = await this.classModel.findById(classId);
        if (!existingClass) throw new NotFoundException('Class not found');

        if (existingClass.instructorId.toString() !== userId) {
            throw new ForbiddenException('Only the instructor can add faculties');
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