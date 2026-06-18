import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../../infrastructure/database/entities/class.entity';
import { RegenerateClassCodeResponseDto } from '../../dto/class-settings.dto';

@Injectable()
export class RegenerateClassCodeService {
  constructor(
    @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
  ) {}

  private generateCode(length = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () => 
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
  }

  async execute(classId: string): Promise<RegenerateClassCodeResponseDto> {
    const classObjectId = new Types.ObjectId(classId);

    // ── Validate Class Existence ──────────────────
    const existingClass = await this.classModel.findById(classObjectId).select('_id');
    if (!existingClass) throw new NotFoundException('Class not found');

    // ── Generate Unique Code ──────────────────────
    let newCode: string;
    let exists: boolean;
    do {
      newCode = this.generateCode();
      exists = !!(await this.classModel.exists({ enrollCode: newCode }));
    } while (exists);

    // ── Update Code ──────────────────────────────
    await this.classModel.findByIdAndUpdate(classObjectId, { 
      $set: { enrollCode: newCode } 
    });

    return {
      success: true,
      message: 'Class code regenerated successfully.',
      data: { code: newCode },
    };
  }
}