import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Enrollment, EnrollmentDocument } from '../../../../infrastructure/database/entities/enrollment.entity';
import { User, UserDocument } from '../../../../infrastructure/database/entities/user.entity';
import { EnrollmentRole } from '../../../../infrastructure/database/interface/enrollment.interface';
import { RevokeAssistantRequestDto, RevokeAssistantResponseDto } from '../../dto/class-member.dto';

@Injectable()
export class AssistantRevokeClassMemberService {
  constructor(
    @InjectModel(Enrollment.name) private readonly enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async execute(
    classId: string,
    dto: RevokeAssistantRequestDto,
  ): Promise<RevokeAssistantResponseDto> {
    const classObjectId = new Types.ObjectId(classId);
    const userObjectId = new Types.ObjectId(dto.userId);

    // ── Validate User & Enrollment ────────────────────────
    const [user, enrollment] = await Promise.all([
      this.userModel.exists({ _id: userObjectId }),
      this.enrollmentModel.findOne({ classId: classObjectId, userId: userObjectId }),
    ]);

    if (!user) throw new NotFoundException('User not found');
    if (!enrollment) throw new NotFoundException('User is not enrolled in the class');

    // ── Verify Assistant Status ──────────────────────────
    if (enrollment.role !== EnrollmentRole.ASSISTANT) {
      throw new NotFoundException('User is not an assistant');
    }

    // ── Revoke Role ──────────────────────────────────────
    enrollment.role = EnrollmentRole.LEARNER;
    await enrollment.save();

    return {
      success: true,
      message: 'Assistant revoked successfully',
      data: { userId: dto.userId },
    };
  }
}