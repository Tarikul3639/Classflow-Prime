import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Class,
  ClassDocument,
} from '../../../infrastructure/database/entities/class.entity';
import {
  Enrollment,
  EnrollmentDocument,
} from '../../../infrastructure/database/entities/enrollment.entity';
import {
  User,
  UserDocument,
} from '../../../infrastructure/database/entities/user.entity';

import {
  FetchClassesResponseDto,
  ClassItemDto,
} from '../dto/fetch-enrolled-classes.dto';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';
import { ClassStatus } from '../../../infrastructure/database/interface/class.interface';

@Injectable()
export class FetchEnrolledClassesService {
  constructor(
    @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) { }

  async execute(userId: string): Promise<FetchClassesResponseDto> {
    // ── Validate User ID ──────────────────────────
    if (!Types.ObjectId.isValid(userId)) {
      return {
        success: false,
        message: 'Invalid user id',
        data: { classes: [] },
      };
    }

    const userObjectId = new Types.ObjectId(userId);

    // ── Fetch My Enrollments ──────────────────────
    const myEnrollments = await this.enrollmentModel
      .find({ userId: userObjectId })
      .select('userId classId role')
      .lean()
      .exec();

    if (!myEnrollments.length) {
      return {
        success: true,
        message: 'Classes fetched successfully',
        data: { classes: [] },
      };
    }

    const classIds = myEnrollments.map((e) => e.classId);

    // ── Fetch Classes & All Related Enrollments ──
    const [classes, allEnrollments] = await Promise.all([
      this.classModel
        .find({ _id: { $in: classIds } })
        .lean()
        .exec(),
      this.enrollmentModel
        .find({ classId: { $in: classIds } })
        .select('userId classId role')
        .lean()
        .exec(),
    ]);

    // ── Fetch Instructors ─────────────────────────
    const instructorIds = [
      ...new Set(
        allEnrollments
          .filter((e) => e.role === EnrollmentRole.INSTRUCTOR)
          .map((e) => e.userId),
      ),
    ];

    const instructors = await this.userModel
      .find({ _id: { $in: instructorIds } })
      .select('name avatarUrl')
      .lean()
      .exec();

    // ── Build Response DTOs ───────────────────────
    const responseClasses: ClassItemDto[] = classes.map((classData) => {
      const classIdStr = classData._id.toString();

      const enrollments = allEnrollments.filter(
        (e) => e.classId.toString() === classIdStr,
      );
      const myEnrollment = myEnrollments.find(
        (e) => e.classId.toString() === classIdStr,
      );
      const instructorEnrollment = enrollments.find(
        (e) => e.role === EnrollmentRole.INSTRUCTOR,
      );
      const instructorUser = instructors.find(
        (u) => u._id.toString() === instructorEnrollment?.userId.toString(),
      );

      return {
        classId: classIdStr,
        title: classData.className ?? 'Unknown',
        department: classData.department ?? 'General',
        students: enrollments.length,
        instructor: instructorUser?.name ?? 'Unknown',
        semester: classData.semester ?? 'TBA',
        themeColor: classData.themeColor ?? '#3B82F6',
        coverImage: classData.coverImage ?? null,
        avatarUrl: instructorUser?.avatarUrl ?? null,
        isInstructor: myEnrollment?.role === EnrollmentRole.INSTRUCTOR,
        isAssistant: myEnrollment?.role === EnrollmentRole.ASSISTANT,
        status: classData.status,
      };
    });

    return {
      success: true,
      message: 'Classes fetched successfully',
      data: { classes: responseClasses },
    };
  }
}
