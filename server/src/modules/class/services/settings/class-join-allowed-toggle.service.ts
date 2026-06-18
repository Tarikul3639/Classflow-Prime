import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../../infrastructure/database/entities/class.entity';
import { ClassStatus } from '../../../../infrastructure/database/interface/class.interface';
import { ToggleJoiningAllowedResponseDto } from '../../dto/class-settings.dto';

@Injectable()
export class ClassJoinAllowedToggleService {
  constructor(
    @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
  ) {}

  async execute(classId: string): Promise<ToggleJoiningAllowedResponseDto> {
    const classObjectId = new Types.ObjectId(classId);

    // ── Validate Class & Status ──────────────────
    const existingClass = await this.classModel.findById(classObjectId);
    if (!existingClass) throw new NotFoundException('Class not found');

    if (existingClass.status === ClassStatus.ENDED) {
      throw new ForbiddenException('Cannot toggle joining allowed status for an ended class');
    }

    // ── Toggle AllowEnroll Status ───────────────
    existingClass.allowEnroll = !existingClass.allowEnroll;
    await existingClass.save();

    return {
      success: true,
      message: `Joining is now ${existingClass.allowEnroll ? 'enabled' : 'disabled'}.`,
      data: {
        classId,
        isJoiningAllowed: existingClass.allowEnroll,
      },
    };
  }
}