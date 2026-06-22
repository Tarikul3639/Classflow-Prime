import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../infrastructure/database/entities/class.entity';
import { Enrollment, EnrollmentDocument } from '../../../infrastructure/database/entities/enrollment.entity';
import { EnrollClassRequestDto, EnrollClassResponseDto } from '../dto/enroll-class.dto';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';
import { ClassStatus } from '../../../infrastructure/database/interface/class.interface';

@Injectable()
export class EnrollClassService {
  constructor(
    @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
    @InjectModel(Enrollment.name) private readonly enrollmentModel: Model<EnrollmentDocument>,
  ) {}

  async execute(userId: string, dto: EnrollClassRequestDto): Promise<EnrollClassResponseDto> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const userObjectId = new Types.ObjectId(userId);

    // 1. Find class
    const targetClass = await this.classModel
      .findOne({ enrollCode: dto.enrollCode })
      .select('_id className allowEnroll status')
      .lean();

    if (!targetClass) {
      return {
        success: false,
        status: 'invalid_code',
        message: 'Invalid enroll code. Class not found.',
        data: { classId: null },
      };
    }

    // 2. Validate class
    if (!targetClass.allowEnroll || targetClass.status === ClassStatus.ENDED) {
      return {
        success: false,
        status: 'closed',
        message: 'This class is currently closed for new enrollments.',
        data: { classId: targetClass._id.toString() },
      };
    }

    // 3. Check existing enrollment
    const existingEnrollment = await this.enrollmentModel
      .findOne({ classId: targetClass._id, userId: userObjectId })
      .select('_id role')
      .lean();

    if (existingEnrollment) {
      return {
        success: false,
        status: 'already_joined',
        message: 'You are already enrolled in this class.',
        data: { classId: targetClass._id.toString() },
      };
    }

    // 4. Perform enrollment
    try {
      await this.enrollmentModel.create({
        userId: userObjectId,
        classId: targetClass._id,
        role: EnrollmentRole.LEARNER,
        enrolledAt: new Date(),
      });

      return {
        success: true,
        status: 'enrolled',
        message: `Successfully enrolled in ${targetClass.className}`,
        data: { classId: targetClass._id.toString() },
      };
    } catch {
      return {
        success: false,
        status: 'error',
        message: 'Enrollment failed. Please try again later.',
        data: { classId: targetClass._id.toString() },
      };
    }
  }
}