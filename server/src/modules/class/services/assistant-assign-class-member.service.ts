import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../database/entities/class.entity';
import { Enrollment, EnrollmentDocument } from '../../../database/entities/enrollment.entity';
import { EnrollmentRole } from '../../../database/interface/enrollment.interface';
import { User, UserDocument } from '../../../database/entities/user.entity';
import { AssignAssistantRequestDto, AssignAssistantResponseDto } from '../dto/class-member.dto';

@Injectable()
export class AssistantAssignClassMemberService {
    constructor(
        @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
        @InjectModel(Enrollment.name) private readonly enrollmentModel: Model<EnrollmentDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) { }

    async execute(
        userId: string,
        classId: string,
        dto: AssignAssistantRequestDto,
    ): Promise<AssignAssistantResponseDto> {
        const userObjectId = new Types.ObjectId(dto.userId);
        const classObjectId = new Types.ObjectId(classId);

        // Validate user existence
        const user = await this.userModel.findById(dto.userId);
        if (!user) throw new NotFoundException('User not found');

        // Validate class existence and instructor permissions
        const existingClass = await this.classModel.findById(classObjectId);
        if (!existingClass) throw new NotFoundException('Class not found');
        if (!existingClass.instructorId.equals(userId)) {
            throw new ForbiddenException('Only the instructor can assign assistants');
        }

        // Validate enrollment existence
        const enrollment = await this.enrollmentModel.findOne({
            classId: classObjectId,
            userId: userObjectId,
        });
        if (!enrollment) throw new NotFoundException('User is not enrolled in the class');

        // Update enrollment role to assistant
        enrollment.role = EnrollmentRole.ASSISTANT;
        await enrollment.save();

        return {
            success: true,
            message: 'Assistant assigned successfully',
            data: {
                userId: dto.userId,
            },
        };
    }

}