import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../../infrastructure/database/entities/class.entity';
import { Faculty, FacultyDocument } from '../../../../infrastructure/database/entities/faculty.entity';
import { FetchSingleClassFacultyResponseDto } from '../../dto/class-faculty.dto';

@Injectable()
export class FetchSingleClassFacultyService {
  constructor(
    @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
    @InjectModel(Faculty.name) private readonly facultyModel: Model<FacultyDocument>,
  ) {}

  async execute(classId: string, facultyId: string): Promise<FetchSingleClassFacultyResponseDto> {
    const classObjectId = new Types.ObjectId(classId);
    const facultyObjectId = new Types.ObjectId(facultyId);

    // ── Validate Class Existence ──────────────────
    const existingClass = await this.classModel
      .findById(classObjectId)
      .select('_id')
      .lean();

    if (!existingClass) throw new NotFoundException('Class not found');

    // ── Find Faculty ─────────────────────────────
    const faculty = await this.facultyModel
      .findOne({ _id: facultyObjectId, classId: classObjectId })
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
          classroomInviteLink: faculty.classroomInviteLink,
        },
      },
    };
  }
}