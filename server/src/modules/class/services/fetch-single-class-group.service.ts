// fetch-single-class-group.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../infrastructure/database/entities/class.entity';
import { Enrollment, EnrollmentDocument } from '../../../infrastructure/database/entities/enrollment.entity';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';
import { ClassGroup, GroupDocument } from '../../../infrastructure/database/entities/group.entity';

@Injectable()
export class FetchSingleClassGroupService {
    constructor(
        @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
        @InjectModel(Enrollment.name) private readonly enrollmentModel: Model<EnrollmentDocument>,
        @InjectModel(ClassGroup.name) private readonly groupModel: Model<GroupDocument>,
    ) { }

    async execute(userId: string, classId: string, groupId: string) {
        const classObjectId = new Types.ObjectId(classId);
        const userObjectId = new Types.ObjectId(userId);
        const groupObjectId = new Types.ObjectId(groupId);

        // Validate class existence and user authorization
        const existingClass = await this.classModel.findById(classObjectId);
        if (!existingClass) throw new NotFoundException('Class not found');

        const isAssistant = await this.enrollmentModel.findOne({ classId: classObjectId, userId: userObjectId, role: EnrollmentRole.ASSISTANT });

        if (!existingClass.instructorId.equals(userObjectId) && !isAssistant) {
            throw new ForbiddenException('You do not have access to this class');
        }

        const group = await this.groupModel.findOne({ _id: groupObjectId, classId: classObjectId }).lean();
        if (!group) throw new NotFoundException('Group not found');

        return {
            success: true,
            message: 'Group fetched successfully',
            data: {
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