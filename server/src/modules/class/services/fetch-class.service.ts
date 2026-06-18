import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../infrastructure/database/entities/class.entity';
import { Enrollment, EnrollmentDocument } from '../../../infrastructure/database/entities/enrollment.entity';
import { User, UserDocument } from '../../../infrastructure/database/entities/user.entity';

import { FetchClassResponseDto, ClassDetailsDto } from '../dto/fetch-class.dto';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';

type LeanEnrollment = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  classId: Types.ObjectId;
  role: EnrollmentRole;
};

type LeanUser = {
  _id: Types.ObjectId;
  name: string;
  avatarUrl?: string | null;
};

@Injectable()
export class FetchClassService {
  constructor(
    @InjectModel(Class.name)
    private readonly classModel: Model<ClassDocument>,

    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<EnrollmentDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) { }

  async execute(
    userId: string,
    classId: string,
  ): Promise<FetchClassResponseDto> {
    if (!Types.ObjectId.isValid(classId)) {
      return {
        success: false,
        message: 'Class not found or access denied',
        data: { class: null },
      };
    }

    if (!Types.ObjectId.isValid(userId)) {
      return {
        success: false,
        message: 'Class not found or access denied',
        data: { class: null },
      };
    }

    const classObjectId = new Types.ObjectId(classId);
    const userObjectId = new Types.ObjectId(userId);

    const classData = await this.classModel
      .findById(classObjectId)
      .select('_id className department semester themeColor coverImage status allowEnroll')
      .lean()
      .exec();

    if (!classData) {
      return {
        success: false,
        message: 'Class not found or access denied',
        data: { class: null },
      };
    }

    const [currentUserEnrollment, allEnrollments] = await Promise.all([
      this.enrollmentModel
        .findOne({
          classId: classObjectId,
          userId: userObjectId,
        })
        .select('_id userId classId role')
        .lean<LeanEnrollment | null>()
        .exec(),

      this.enrollmentModel
        .find({ classId: classObjectId })
        .select('_id userId classId role')
        .lean<LeanEnrollment[]>()
        .exec(),
    ]);

    if (!currentUserEnrollment) {
      return {
        success: false,
        message: 'Class not found or access denied',
        data: { class: null },
      };
    }

    const instructorEnrollment = allEnrollments.find(
      (enrollment) => enrollment.role === EnrollmentRole.INSTRUCTOR,
    );

    const instructorUser = instructorEnrollment
      ? await this.userModel
        .findById(instructorEnrollment.userId)
        .select('name avatarUrl')
        .lean<LeanUser | null>()
        .exec()
      : null;

    const isInstructor =
      currentUserEnrollment.role === EnrollmentRole.INSTRUCTOR;

    const isAssistant =
      currentUserEnrollment.role === EnrollmentRole.ASSISTANT;

    const responseClass: ClassDetailsDto = {
      classId: classData._id.toString(),
      className: classData.className,
      department: classData.department ?? 'General',
      semester: classData.semester ?? 'TBA',
      themeColor: classData.themeColor ?? '#3B82F6',
      coverImage: classData.coverImage ?? null,
      allowEnroll: classData.allowEnroll,
      members: allEnrollments.length,
      instructor: instructorUser?.name ?? 'Unknown',
      avatarUrl: instructorUser?.avatarUrl ?? null,
      status: classData.status,
      isInstructor,
      isAssistant,
    };

    return {
      success: true,
      message: 'Class fetched successfully',
      data: { class: responseClass },
    };
  }
}