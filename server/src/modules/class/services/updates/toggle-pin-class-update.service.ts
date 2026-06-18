import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../../infrastructure/database/entities/class.entity';
import { ClassUpdate, ClassUpdateDocument } from '../../../../infrastructure/database/entities/update.entity';
import { ClassStatus } from '../../../../infrastructure/database/interface/class.interface';
import { TogglePinClassUpdateRequestDto, TogglePinClassUpdateResponseDto } from '../../dto/toggle-pin-class-update.dto';

@Injectable()
export class TogglePinClassUpdateService {
  constructor(
    @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
    @InjectModel(ClassUpdate.name) private readonly classUpdateModel: Model<ClassUpdateDocument>,
  ) {}

  async execute(
    classId: string,
    updateId: string,
    dto: TogglePinClassUpdateRequestDto,
  ): Promise<TogglePinClassUpdateResponseDto> {
    const classObjectId = new Types.ObjectId(classId);
    const updateObjectId = new Types.ObjectId(updateId);

    // ── Validate Class & Status ──────────────────
    const existingClass = await this.classModel
      .findById(classObjectId)
      .select('status')
      .lean();

    if (!existingClass) throw new NotFoundException('Class not found');
    
    if (existingClass.status === ClassStatus.ENDED) {
      throw new BadRequestException('Cannot pin or unpin updates in an ended class');
    }

    // ── Update Pin Status ───────────────────────
    const update = await this.classUpdateModel
      .findOneAndUpdate(
        { _id: updateObjectId, classId: classObjectId },
        { $set: { isPinned: dto.isPinned } },
        { new: true }
      )
      .lean();

    if (!update) throw new NotFoundException('Update not found');

    return {
      success: true,
      message: 'Pin status updated successfully',
      data: {
        update: {
          updateId: update._id.toString(),
          isPinned: update.isPinned,
        },
      },
    };
  }
}