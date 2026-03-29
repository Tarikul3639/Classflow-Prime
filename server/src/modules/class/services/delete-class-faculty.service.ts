import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Class, ClassDocument } from '../../../database/entities/class.entity';
import { Faculty, FacultyDocument } from '../../../database/entities/faculty.entity';

import { DeleteClassFacultyResponseDto } from '../dto/class-faculty.dto';

@Injectable()
export class DeleteClassFacultyService {
  constructor(
    @InjectModel(Class.name)  private readonly classModel: Model<ClassDocument>,
    @InjectModel(Faculty.name) private readonly facultyModel: Model<FacultyDocument>,
  ) {}

  async execute(
    userId: string,
    classId: string,
    facultyId: string,
  ): Promise<DeleteClassFacultyResponseDto> {
    const existingClass = await this.classModel.findById(classId);
    if (!existingClass) throw new NotFoundException('Class not found');

    if (existingClass.instructorId.toString() !== userId) {
      throw new ForbiddenException('Only the instructor can remove faculties');
    }

    const faculty = await this.facultyModel.findOneAndDelete({
      _id: facultyId,
      classId,
    });

    if (!faculty) throw new NotFoundException('Faculty not found');

    return {
      success: true,
      message: 'Faculty removed successfully',
    };
  }
}