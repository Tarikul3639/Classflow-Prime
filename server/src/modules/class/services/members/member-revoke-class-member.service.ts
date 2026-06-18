import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../../infrastructure/database/entities/class.entity';
import { Enrollment, EnrollmentDocument } from '../../../../infrastructure/database/entities/enrollment.entity';
import { User, UserDocument } from '../../../../infrastructure/database/entities/user.entity';
import { EnrollmentRole } from '../../../../infrastructure/database/interface/enrollment.interface';
import { RevokeMemberResponseDto } from '../../dto/class-member.dto';

@Injectable()
export class MemberRevokeClassMemberService {
  constructor(
    @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
    @InjectModel(Enrollment.name) private readonly enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async execute(classId: string, memberId: string): Promise<RevokeMemberResponseDto> {
    const classObjectId = new Types.ObjectId(classId);
    const memberObjectId = new Types.ObjectId(memberId);

    // ── Validate Existence ──────────────────────
    const [existingClass, member, enrollment] = await Promise.all([
      this.classModel.exists({ _id: classObjectId }),
      this.userModel.exists({ _id: memberObjectId }),
      this.enrollmentModel.findOne({ classId: classObjectId, userId: memberObjectId }),
    ]);

    if (!existingClass) throw new NotFoundException('Class not found');
    if (!member) throw new NotFoundException('User not found');
    if (!enrollment) throw new NotFoundException('User is not enrolled in the class');

    // ── Prevent removing instructor ─────────────
    if (enrollment.role === EnrollmentRole.INSTRUCTOR) {
      throw new BadRequestException('Instructor cannot be removed');
    }

    // ── Remove Member ──────────────────────────
    await enrollment.deleteOne();

    return {
      success: true,
      message: 'Member revoked successfully',
      data: { userId: memberId },
    };
  }
}