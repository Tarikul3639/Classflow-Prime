// update-class-group.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../infrastructure/database/entities/class.entity';
import { ClassStatus } from '../../../infrastructure/database/interface/class.interface';
import { Enrollment, EnrollmentDocument } from '../../../infrastructure/database/entities/enrollment.entity';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';
import { ClassGroup, GroupDocument } from '../../../infrastructure/database/entities/group.entity';
import { CreateClassGroupRequestDto } from '../dto/class-group.dto';

@Injectable()
export class UpdateClassGroupService {
    constructor(
        @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
        @InjectModel(Enrollment.name) private readonly enrollmentModel: Model<EnrollmentDocument>,
        @InjectModel(ClassGroup.name) private readonly groupModel: Model<GroupDocument>,
    ) { }

    async execute(
        userId: string,
        classId: string,
        groupId: string,
        dto: Partial<CreateClassGroupRequestDto>,
    ) {
        const userObjectId = new Types.ObjectId(userId);
        const classObjectId = new Types.ObjectId(classId);
        const groupObjectId = new Types.ObjectId(groupId);

        // Validate class existence and instructor authorization
        const existingClass = await this.classModel.findById(classObjectId);
        if (!existingClass) throw new NotFoundException('Class not found');

        if (existingClass.status === ClassStatus.ENDED) {
            throw new ForbiddenException('Cannot update groups in an ended class');
        }

        const isAssistant = await this.enrollmentModel.findOne({ classId: classObjectId, userId: userObjectId, role: EnrollmentRole.ASSISTANT });

        if (!existingClass.instructorId.equals(userObjectId) && !isAssistant) {
            throw new ForbiddenException('Only the instructor and assistant can update groups');
        }

        const group = await this.groupModel.findOneAndUpdate(
            { _id: groupObjectId, classId: classObjectId },
            { $set: dto },
            { new: true },
        );

        if (!group) throw new NotFoundException('Group not found');

        return {
            success: true,
            message: 'Group updated successfully',
            data: {
                classId,
                group: {
                    groupId: group._id.toString(),
                    name: group.name,
                    description: group.description,
                    link: group.link,
                    platform: group.platform,
                    uiConfig: group.uiConfig,
                    createdBy: group.createdBy,
                    createdAt: group.createdAt,
                    updatedAt: group.updatedAt,
                },
            },
        };
    }
}