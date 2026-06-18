import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../../infrastructure/database/entities/class.entity';
import { Faculty, FacultyDocument } from '../../../../infrastructure/database/entities/faculty.entity';
import { ClassStatus } from '../../../../infrastructure/database/interface/class.interface';
import { UpdateSingleClassFacultyRequestDto, ClassFacultyResponseDto } from '../../dto/class-faculty.dto';

@Injectable()
export class UpdateSingleClassFacultyService {
    constructor(
        @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
        @InjectModel(Faculty.name) private readonly facultyModel: Model<FacultyDocument>,
    ) { }

    async execute(
        classId: string,
        facultyId: string,
        dto: UpdateSingleClassFacultyRequestDto,
    ): Promise<ClassFacultyResponseDto> {
        const classObjectId = new Types.ObjectId(classId);
        const facultyObjectId = new Types.ObjectId(facultyId);

        // ── Validate Class Existence & Status ──────────
        const existingClass = await this.classModel.findById(classObjectId).select('status').lean();
        if (!existingClass) throw new NotFoundException('Class not found');
        if (existingClass.status === ClassStatus.ENDED) {
            throw new ForbiddenException('Cannot update faculty in an ended class');
        }

        // ── Prepare Update Data (Remove undefined fields) ──
        const updateData = Object.fromEntries(
            Object.entries(dto).filter(([_, value]) => value !== undefined)
        );

        if (Object.keys(updateData).length === 0) {
            throw new ForbiddenException('No valid fields provided for update');
        }

        // ── Update Faculty ──────────────────────────────
        const faculty = await this.facultyModel.findOneAndUpdate(
            { _id: facultyObjectId, classId: classObjectId },
            { $set: updateData },
            { new: true }
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