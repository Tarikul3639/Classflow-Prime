import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../../infrastructure/database/entities/class.entity';
import { Faculty, FacultyDocument } from '../../../../infrastructure/database/entities/faculty.entity';
import { FetchClassFacultiesResponseDto } from '../../dto/class-faculty.dto';

@Injectable()
export class FetchClassFacultiesService {
    constructor(
        @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
        @InjectModel(Faculty.name) private readonly facultyModel: Model<FacultyDocument>,
    ) { }

    async execute(classId: string): Promise<FetchClassFacultiesResponseDto> {
        const classObjectId = new Types.ObjectId(classId);

        // ── Validate Class Existence ──────────────────
        const existingClass = await this.classModel
            .findById(classObjectId)
            .select('_id')
            .lean();

        if (!existingClass) throw new NotFoundException('Class not found');

        // ── Fetch Faculties ──────────────────────────
        const faculties = await this.facultyModel
            .find({ classId: classObjectId })
            .lean()
            .exec();

        return {
            success: true,
            message: 'Faculties fetched successfully',
            data: {
                classId,
                faculties: faculties.map((f) => ({
                    facultyId: f._id.toString(),
                    name: f.name,
                    designation: f.designation,
                    location: f.location,
                    email: f.email,
                    avatarUrl: f.avatarUrl,
                    phone: f.phone,
                    classroomCode: f.classroomCode,
                    classroomInviteLink: f.classroomInviteLink ?? '',
                })),
            },
        };
    }
}