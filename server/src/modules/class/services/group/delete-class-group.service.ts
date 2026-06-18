import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../../infrastructure/database/entities/class.entity';
import { ClassGroup, GroupDocument } from '../../../../infrastructure/database/entities/group.entity';

@Injectable()
export class DeleteClassGroupService {
  constructor(
    @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
    @InjectModel(ClassGroup.name) private readonly groupModel: Model<GroupDocument>,
  ) {}

  async execute(classId: string, groupId: string) {
    const classObjectId = new Types.ObjectId(classId);
    const groupObjectId = new Types.ObjectId(groupId);

    // ── Validate Class Existence ──────────
    const existingClass = await this.classModel
      .findById(classObjectId)
      .select('_id')
      .lean();

    if (!existingClass) throw new NotFoundException('Class not found');

    // ── Delete Group ──────────────────────
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