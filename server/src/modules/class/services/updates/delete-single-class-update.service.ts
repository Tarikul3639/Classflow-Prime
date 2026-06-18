import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../../infrastructure/database/entities/class.entity';
import { ClassUpdate, ClassUpdateDocument } from '../../../../infrastructure/database/entities/update.entity';
import { ClassStatus } from '../../../../infrastructure/database/interface/class.interface';
import { DeleteSingleClassUpdateResponseDto } from '../../dto/delete-single-class-update.dto';

@Injectable()
export class DeleteSingleClassUpdateService {
  constructor(
    @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
    @InjectModel(ClassUpdate.name) private readonly classUpdateModel: Model<ClassUpdateDocument>,
  ) {}

  async execute(classId: string, updateId: string): Promise<DeleteSingleClassUpdateResponseDto> {
    const classObjectId = new Types.ObjectId(classId);
    const updateObjectId = new Types.ObjectId(updateId);

    // ── Validate Class & Status ──────────
    const classData = await this.classModel
      .findById(classObjectId)
      .select('status')
      .lean();

    if (!classData) throw new NotFoundException('Class not found');
    
    if (classData.status === ClassStatus.ENDED) {
      throw new BadRequestException('Cannot delete updates from an ended class');
    }

    // ── Delete Update ────────────────────
    const deleteResult = await this.classUpdateModel.deleteOne({
      _id: updateObjectId,
      classId: classObjectId,
    });

    if (deleteResult.deletedCount === 0) {
      throw new NotFoundException('Update not found or already deleted');
    }

    return {
      success: true,
      message: 'Class update deleted successfully',
      data: { updateId },
    };
  }
}