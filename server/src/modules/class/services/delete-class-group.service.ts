// delete-class-group.service.ts
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../infrastructure/database/entities/class.entity';
import {
    Enrollment,
    EnrollmentDocument,
} from '../../../infrastructure/database/entities/enrollment.entity';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';
import {
    ClassGroup,
    GroupDocument,
} from '../../../infrastructure/database/entities/group.entity';

@Injectable()
export class DeleteClassGroupService {
    constructor(
        @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
        @InjectModel(Enrollment.name)
        private readonly enrollmentModel: Model<EnrollmentDocument>,
        @InjectModel(ClassGroup.name)
        private readonly groupModel: Model<GroupDocument>,
    ) { }

    async execute(userId: string, classId: string, groupId: string) {
        const userObjectId = new Types.ObjectId(userId);
        const classObjectId = new Types.ObjectId(classId);
        const groupObjectId = new Types.ObjectId(groupId);

        // Validate class existence and instructor authorization
        const existingClass = await this.classModel.findById(classObjectId);
        if (!existingClass) throw new NotFoundException('Class not found');

        // Find if the user is an assistant for the class
        const isAssistant = await this.enrollmentModel.findOne({
            classId: classObjectId,
            userId: userObjectId,
            role: EnrollmentRole.ASSISTANT,
        });

        if (!existingClass.instructorId.equals(userObjectId) && !isAssistant) {
            throw new ForbiddenException(
                'Only the instructor or assistant can delete groups',
            );
        }

        const group = await this.groupModel.findOneAndDelete({
            _id: groupObjectId,
            classId: classObjectId,
        });
        if (!group) throw new NotFoundException('Group not found');

        return {
            success: true,
            message: 'Group deleted successfully',
            data: { groupId },
        };
    }
}