import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, PipelineStage } from 'mongoose';
import { Class, ClassDocument } from '../../../database/entities/class.entity';
import {
  Enrollment,
  EnrollmentDocument,
} from '../../../database/entities/enrollment.entity';
import {
  EnrollClassRequestDto,
  EnrollClassResponseDto,
} from '../dto/enroll-class.dto';
import { EnrollmentRole } from '../../../database/interface/enrollment.interface';

@Injectable()
export class EnrollClassService {
  constructor(
    @InjectModel(Class.name)
    private readonly classModel: Model<ClassDocument>,
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<EnrollmentDocument>,
  ) { }

  async execute(
    userId: string,
    dto: EnrollClassRequestDto,
  ): Promise<EnrollClassResponseDto> {

    // ── Validate userId string before converting to ObjectId ──────────────
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const userObjId = new Types.ObjectId(userId);

    // ── Single aggregation pipeline to validate class and user state ───────
    // This avoids multiple round-trips by checking enrollment status,
    // instructor status, and class settings all at once.
    const pipeline: PipelineStage[] = [
      // Match the class by enroll code
      { $match: { enrollCode: dto.enrollCode } },

      // Look up any existing enrollment for this user in this class
      {
        $lookup: {
          from: 'enrollments',
          let: { cid: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$classId', '$$cid'] },
                    { $eq: ['$userId', userObjId] },
                  ],
                },
              },
            },
          ],
          as: 'userEnrollment',
        },
      },

      // Look up assistant enrollments to check if this user is an assistant.
      // Assistants are stored in the Enrollment collection (not on the class doc),
      // so we need a separate lookup instead of relying on a class-level field.
      {
        $lookup: {
          from: 'enrollments',
          let: { cid: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$classId', '$$cid'] },
                    { $eq: ['$userId', userObjId] },
                    { $eq: ['$role', EnrollmentRole.ASSISTANT] },
                  ],
                },
              },
            },
          ],
          as: 'assistantEnrollment',
        },
      },

      {
        $project: {
          name: 1,
          allowEnroll: 1,
          isArchived: 1,
          instructorId: 1,

          // True if the user already has any enrollment record in this class
          isAlreadyEnrolled: { $gt: [{ $size: '$userEnrollment' }, 0] },

          // True if the user is the instructor OR an assistant —
          // renamed from isInstructor to avoid confusion
          isPrivilegedUser: {
            $or: [
              { $eq: ['$instructorId', userObjId] },
              { $gt: [{ $size: '$assistantEnrollment' }, 0] },
            ],
          },
        },
      },
    ];

    const classInfo = await this.classModel
      .aggregate(pipeline)
      .exec()
      .then((results) => results[0]);

    // ── Business logic checks ──────────────────────────────────────────────

    if (!classInfo) {
      return {
        success: false,
        message: 'Invalid enroll code. Class not found.',
        data: { classId: null },
      };
    }

    if (classInfo.isAlreadyEnrolled) {
      return {
        success: false,
        message: 'You are already a member of this class.',
        data: { classId: classInfo._id.toString() },
      };
    }

    // Instructors and assistants cannot enroll as learners
    if (classInfo.isPrivilegedUser) {
      return {
        success: false,
        message: 'Teachers or assistants cannot enroll as students.',
        data: { classId: classInfo._id.toString() },
      };
    }

    if (!classInfo.allowEnroll || classInfo.isArchived) {
      return {
        success: false,
        message: 'This class is currently closed for new enrollments.',
        data: { classId: classInfo._id.toString() },
      };
    }

    // ── Perform the enrollment write ───────────────────────────────────────
    try {
      await this.enrollmentModel.create({
        userId: userObjId,
        classId: classInfo._id,
        role: EnrollmentRole.LEARNER,
        enrolledAt: new Date(),
      });

      return {
        success: true,
        message: `Successfully enrolled in ${classInfo.name}`,
        data: { classId: classInfo._id.toString() },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Enrollment failed. Please try again later.',
        data: { classId: classInfo._id.toString() },
      };
    }
  }
}