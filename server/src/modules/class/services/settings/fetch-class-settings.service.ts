import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../../infrastructure/database/entities/class.entity';
import { FetchClassSettingsResponseDto } from '../../dto/class-settings.dto';

@Injectable()
export class FetchClassSettingsService {
  constructor(
    @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
  ) {}

  async execute(classId: string): Promise<FetchClassSettingsResponseDto> {
    const classObjectId = new Types.ObjectId(classId);

    // ── Fetch & Validate Class Settings ──────────
    const existingClass = await this.classModel
      .findById(classObjectId)
      .select('enrollCode allowEnroll')
      .lean();

    if (!existingClass) throw new NotFoundException('Class not found');

    return {
      success: true,
      message: 'Class settings fetched successfully.',
      data: {
        code: existingClass.enrollCode,
        isJoiningAllowed: existingClass.allowEnroll,
      },
    };
  }
}