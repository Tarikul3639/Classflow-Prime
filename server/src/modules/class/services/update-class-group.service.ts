// update-class-group.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Class, ClassDocument } from '../../../database/entities/class.entity';
import { ClassGroup, GroupDocument } from '../../../database/entities/group.entity';
import { CreateClassGroupRequestDto } from '../dto/class-group.dto';

@Injectable()
export class UpdateClassGroupService {
    constructor(
        @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
        @InjectModel(ClassGroup.name) private readonly groupModel: Model<GroupDocument>,
    ) {}

    async execute(
        userId: string,
        classId: string,
        groupId: string,
        dto: Partial<CreateClassGroupRequestDto>,
    ) {
        const existingClass = await this.classModel.findById(classId);
        if (!existingClass) throw new NotFoundException('Class not found');

        if (existingClass.instructorId.toString() !== userId) {
            throw new ForbiddenException('Only the instructor can update groups');
        }

        const group = await this.groupModel.findOneAndUpdate(
            { _id: groupId, classId },
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