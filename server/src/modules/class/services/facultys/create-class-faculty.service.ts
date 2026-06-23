import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../../infrastructure/database/entities/class.entity';
import { Faculty, FacultyDocument } from '../../../../infrastructure/database/entities/faculty.entity';
import { ClassStatus } from '../../../../infrastructure/database/interface/class.interface';
import { CreateClassFacultyRequestDto, ClassFacultyResponseDto } from '../../dto/class-faculty.dto';

@Injectable()
export class CreateClassFacultyService {
  constructor(
    @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
    @InjectModel(Faculty.name) private readonly facultyModel: Model<FacultyDocument>,
  ) {}

  async execute(classId: string, dto: CreateClassFacultyRequestDto): Promise<ClassFacultyResponseDto> {
    const classObjectId = new Types.ObjectId(classId);

    // ── Validate Class ──────────────────────────
    const existingClass = await this.classModel
      .findById(classObjectId)
      .select('_id status')
      .lean();

    if (!existingClass) throw new NotFoundException('Class not found');
    if (existingClass.status === ClassStatus.ENDED) {
      throw new ForbiddenException('Cannot add faculty to an ended class');
    }

    // ── Create Faculty ──────────────────────────
    const faculty = await this.facultyModel.create({
      classId: classObjectId,
      ...dto,
    });

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
          classroomInviteLink: faculty.classroomInviteLink,
        },
      },
    };
  }
}