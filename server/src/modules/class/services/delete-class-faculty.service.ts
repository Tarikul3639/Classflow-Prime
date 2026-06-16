import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../infrastructure/database/entities/class.entity';
import {
  Enrollment,
  EnrollmentDocument,
} from '../../../infrastructure/database/entities/enrollment.entity';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';
import {
  Faculty,
  FacultyDocument,
} from '../../../infrastructure/database/entities/faculty.entity';

import { DeleteClassFacultyResponseDto } from '../dto/class-faculty.dto';

@Injectable()
export class DeleteClassFacultyService {
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
  ): Promise<DeleteClassFacultyResponseDto> {
    const userObjectId = new Types.ObjectId(userId);
    const classObjectId = new Types.ObjectId(classId);
    const facultyObjectId = new Types.ObjectId(facultyId);

    const existingClass = await this.classModel.findById(classObjectId);
    if (!existingClass) throw new NotFoundException('Class not found');

    const isAssistant = await this.enrollmentModel.exists({
      userId: userObjectId,
      classId: classObjectId,
      role: EnrollmentRole.ASSISTANT,
    });

    if (!existingClass.instructorId.equals(userObjectId) && !isAssistant) {
      throw new ForbiddenException('Only the instructor can remove faculties');
    }

    const faculty = await this.facultyModel.findOneAndDelete({
      _id: facultyObjectId,
      classId: classObjectId,
    });

    if (!faculty) throw new NotFoundException('Faculty not found');

    return {
      success: true,
      message: 'Faculty removed successfully',
    };
  }
}
