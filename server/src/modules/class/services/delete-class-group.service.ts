// delete-class-group.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Class, ClassDocument } from '../../../database/entities/class.entity';
import { ClassGroup, GroupDocument } from '../../../database/entities/group.entity';

@Injectable()
export class DeleteClassGroupService {
    constructor(
        @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
        @InjectModel(ClassGroup.name) private readonly groupModel: Model<GroupDocument>,
    ) {}

    async execute(userId: string, classId: string, groupId: string) {
        const existingClass = await this.classModel.findById(classId);
        if (!existingClass) throw new NotFoundException('Class not found');

        if (existingClass.instructorId.toString() !== userId) {
            throw new ForbiddenException('Only the instructor can delete groups');
        }

        const group = await this.groupModel.findOneAndDelete({ _id: groupId, classId });
        if (!group) throw new NotFoundException('Group not found');

        return {
            success: true,
            message: 'Group deleted successfully',
            data: { groupId },
        };
    }
}