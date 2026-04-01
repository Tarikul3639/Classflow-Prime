import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../database/entities/class.entity';
import { Enrollment, EnrollmentDocument } from '../../../database/entities/enrollment.entity';
import { User, UserDocument } from '../../../database/entities/user.entity';
import { RevokeMemberResponseDto } from '../dto/class-member.dto';

@Injectable()
export class MemberRevokeClassMemberService {
    constructor(
        @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
        @InjectModel(Enrollment.name) private readonly enrollmentModel: Model<EnrollmentDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) { }

    async execute(
        userId: string,
        classId: string,
        memberId: string,
    ): Promise<RevokeMemberResponseDto> {
        const classObjectId = new Types.ObjectId(classId);
        const userObjectId = new Types.ObjectId(userId);
        const memberObjectId = new Types.ObjectId(memberId);

        // Validate user existence
        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        // Validate class existence and instructor permissions
        const existingClass = await this.classModel.findById(classObjectId);
        if (!existingClass) throw new NotFoundException('Class not found');
        if (!existingClass.instructorId.equals(userId) && !existingClass.assistantIds?.some(id => id.equals(userId))) {
            throw new ForbiddenException('Only the instructor can revoke members');
        }
        // Validate enrollment existence
        const enrollment = await this.enrollmentModel.findOne({
            classId: classObjectId,
            userId: memberObjectId,
        });
        if (!enrollment) throw new NotFoundException('User is not enrolled in the class');

        // Remove the enrollment to revoke membership
        await this.enrollmentModel.deleteOne({
            classId: classObjectId,
            userId: memberObjectId,
        });

        return {
            success: true,
            message: 'Member revoked successfully',
            data: {
                userId: memberId,
            },
        };
    }
}