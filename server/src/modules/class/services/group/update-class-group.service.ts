import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../../infrastructure/database/entities/class.entity';
import { ClassGroup, GroupDocument } from '../../../../infrastructure/database/entities/group.entity';
import { CreateClassGroupRequestDto } from '../../dto/class-group.dto';
import { ClassStatus } from '../../../../infrastructure/database/interface/class.interface';

@Injectable()
export class UpdateClassGroupService {
  constructor(
    @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
    @InjectModel(ClassGroup.name) private readonly groupModel: Model<GroupDocument>,
  ) {}

  async execute(
    classId: string,
    groupId: string,
    dto: Partial<CreateClassGroupRequestDto>,
  ) {
    const classObjectId = new Types.ObjectId(classId);
    const groupObjectId = new Types.ObjectId(groupId);

    // ── Validate Class & Status ──────────────
    const existingClass = await this.classModel
      .findById(classObjectId)
      .select('status')
      .lean();

    if (!existingClass) throw new NotFoundException('Class not found');
    if (existingClass.status === ClassStatus.ENDED) {
      throw new BadRequestException('Cannot update groups in an ended class');
    }

    // ── Prepare Update Data (Remove undefined) ──
    const updateData = Object.fromEntries(
      Object.entries(dto).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No valid fields provided');
    }

    // ── Update Group ──────────────────────────
    const group = await this.groupModel.findOneAndUpdate(
      { _id: groupObjectId, classId: classObjectId },
      { $set: updateData },
      { new: true }
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