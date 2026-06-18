import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';

import {
  Class,
  ClassDocument,
} from '../../../../infrastructure/database/entities/class.entity';

import {
  Enrollment,
  EnrollmentDocument,
} from '../../../../infrastructure/database/entities/enrollment.entity';

import {
  EnrollmentRole,
} from '../../../../infrastructure/database/interface/enrollment.interface';

import { LeaveClassResponseDto } from '../../dto/class-settings.dto';

@Injectable()
export class LeaveClassService {
  constructor(
    @InjectModel(Class.name)
    private readonly classModel: Model<ClassDocument>,

    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<EnrollmentDocument>,
  ) {}

  async execute(
    userId: string,
    classId: string,
  ): Promise<LeaveClassResponseDto> {
    const userObjectId = new Types.ObjectId(userId);
    const classObjectId = new Types.ObjectId(classId);

    const existingClass = await this.classModel
      .findById(classObjectId)
      .select('_id')
      .lean();

    if (!existingClass) {
      throw new NotFoundException('Class not found');
    }

    const enrollment = await this.enrollmentModel.findOne({
      classId: classObjectId,
      userId: userObjectId,
    });

    if (!enrollment) {
      throw new NotFoundException('You are not enrolled in this class');
    }

    if (enrollment.role === EnrollmentRole.INSTRUCTOR) {
      throw new ForbiddenException('Instructor cannot leave their own class');
    }

    await enrollment.deleteOne();

    return {
      success: true,
      message: 'You have left the class.',
    };
  }
}