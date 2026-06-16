import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../infrastructure/database/entities/class.entity';
import { Enrollment, EnrollmentDocument } from '../../../infrastructure/database/entities/enrollment.entity';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';
import { User, UserDocument } from '../../../infrastructure/database/entities/user.entity';
import { RevokeAssistantRequestDto, RevokeAssistantResponseDto } from '../dto/class-member.dto';

@Injectable()
export class AssistantRevokeClassMemberService {
    constructor(
        @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
        @InjectModel(Enrollment.name) private readonly enrollmentModel: Model<EnrollmentDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) { }

    async execute(
        userId: string,
        classId: string,
        dto: RevokeAssistantRequestDto,
    ): Promise<RevokeAssistantResponseDto> {
        const userObjectId = new Types.ObjectId(dto.userId);
        const classObjectId = new Types.ObjectId(classId);

        // Validate user existence
        const user = await this.userModel.findById(dto.userId);
        if (!user) throw new NotFoundException('User not found');

        // Validate class existence and instructor permissions
        const existingClass = await this.classModel.findById(classObjectId);
        if (!existingClass) throw new NotFoundException('Class not found');
        if (!existingClass.instructorId.equals(userId)) {
            throw new ForbiddenException('Only the instructor can revoke assistants');
        }

        // Validate enrollment existence
        const enrollment = await this.enrollmentModel.findOne({
            classId: classObjectId,
            userId: userObjectId,
        });
        if (!enrollment) throw new NotFoundException('User is not enrolled in the class');

        // Update enrollment role to assistant
        enrollment.role = EnrollmentRole.LEARNER;
        await enrollment.save();

        return {
            success: true,
            message: 'Assistant Revoke successfully',
            data: {
                userId: dto.userId,
            },
        };
    }

}