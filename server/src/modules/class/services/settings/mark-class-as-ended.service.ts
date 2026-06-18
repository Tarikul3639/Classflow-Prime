import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../../infrastructure/database/entities/class.entity';
import { ClassStatus } from '../../../../infrastructure/database/interface/class.interface';
import { MarkClassAsEndedResponseDto } from '../../dto/class-settings.dto';

@Injectable()
export class MarkClassAsEndedService {
  constructor(
    @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
  ) {}

  async execute(classId: string): Promise<MarkClassAsEndedResponseDto> {
    const classObjectId = new Types.ObjectId(classId);

    // ── Validate Class Existence & Status ──────────
    const existingClass = await this.classModel
      .findById(classObjectId)
      .select('status')
      .lean();

    if (!existingClass) throw new NotFoundException('Class not found');
    if (existingClass.status === ClassStatus.ENDED) {
      throw new BadRequestException('Class is already ended');
    }

    // ── Mark Class as Ended ────────────────────────
    await this.classModel.findByIdAndUpdate(classObjectId, {
      $set: { status: ClassStatus.ENDED },
    });

    return {
      success: true,
      message: 'Class marked as ended.',
      data: {
        classId,
        isEnded: true,
      },
    };
  }
}