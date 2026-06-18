import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../../infrastructure/database/entities/class.entity';
import { Enrollment, EnrollmentDocument } from '../../../../infrastructure/database/entities/enrollment.entity';
import { User, UserDocument } from '../../../../infrastructure/database/entities/user.entity';
import { GetClassMembersResponseWrapperDto } from '../../dto/class-member.dto';
import { maskEmail } from '../../../../common/utils/mask-email.util';

@Injectable()
export class FetchClassMembersService {
  constructor(
    @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
    @InjectModel(Enrollment.name) private readonly enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async execute(classId: string): Promise<GetClassMembersResponseWrapperDto> {
    const classObjectId = new Types.ObjectId(classId);

    // ── Validate Class ──────────────────────────
    const existingClass = await this.classModel.findById(classObjectId).select('_id').lean();
    if (!existingClass) throw new NotFoundException('Class not found');

    // ── Fetch Enrollments & Users ──────────────
    const enrollments = await this.enrollmentModel.find({ classId: classObjectId }).lean();
    
    const userIds = enrollments.map((e) => e.userId);
    const users = await this.userModel.find({ _id: { $in: userIds } }).lean();
    
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    // ── Build Members List ─────────────────────
    const members = enrollments.map((e) => {
      const u = userMap.get(e.userId.toString());
      return {
        userId: e.userId.toString(),
        name: u?.name ?? 'Unknown User',
        email: maskEmail(u?.email),
        verified: u?.emailVerified ?? false,
        avatarUrl: u?.avatarUrl ?? '',
        role: e.role,
        enrolledAt: e.enrolledAt,
      };
    });

    return {
      success: true,
      message: 'Class members fetched successfully',
      data: { classId, members },
    };
  }
}