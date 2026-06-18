import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../../infrastructure/database/entities/class.entity';
import { ClassGroup, GroupDocument } from '../../../../infrastructure/database/entities/group.entity';

@Injectable()
export class FetchSingleClassGroupService {
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

    // ── Find Group ────────────────────────
    const group = await this.groupModel
      .findOne({ _id: groupObjectId, classId: classObjectId })
      .lean();

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