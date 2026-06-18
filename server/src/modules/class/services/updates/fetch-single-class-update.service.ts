import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../../infrastructure/database/entities/class.entity';
import { ClassUpdate, ClassUpdateDocument } from '../../../../infrastructure/database/entities/update.entity';
import { Material, MaterialDocument } from '../../../../infrastructure/database/entities/material.entity';
import { FetchSingleClassUpdateResponseDto } from '../../dto/fetch-single-class-update.dto';

@Injectable()
export class FetchSingleClassUpdateService {
  constructor(
    @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
    @InjectModel(ClassUpdate.name) private readonly classUpdateModel: Model<ClassUpdateDocument>,
    @InjectModel(Material.name) private readonly materialModel: Model<MaterialDocument>,
  ) {}

  async execute(classId: string, updateId: string): Promise<FetchSingleClassUpdateResponseDto> {
    const classObjectId = new Types.ObjectId(classId);
    const updateObjectId = new Types.ObjectId(updateId);

    // ── Validate Class Existence ──────────
    const existingClass = await this.classModel.findById(classObjectId).select('_id').lean();
    if (!existingClass) throw new NotFoundException('Class not found');

    // ── Fetch Update Details ──────────────
    const update = await this.classUpdateModel
      .findOne({ _id: updateObjectId, classId: classObjectId })
      .populate('postedBy', 'name avatarUrl')
      .lean();

    if (!update) throw new NotFoundException('The update was not found.');

    // ── Fetch Materials ──────────────────
    const materials = await this.materialModel.find({ updateId: updateObjectId }).lean();

    // ── Response ──────────────────────────
    const postedBy = update.postedBy as any;

    return {
      success: true,
      message: 'Class update details fetched successfully',
      data: {
        update: {
          _id: update._id.toString(),
          classId: update.classId.toString(),
          title: update.title,
          description: update.description ?? null,
          category: update.category,
          isPinned: update.isPinned,
          eventAt: update.eventAt ? update.eventAt.toISOString() : null,
          createdAt: update.createdAt.toISOString(),
          updatedAt: update.updatedAt.toISOString(),
          postedBy: {
            _id: postedBy?._id?.toString() ?? '',
            name: postedBy?.name ?? 'Unknown User',
            avatarUrl: postedBy?.avatarUrl ?? null,
          },
          materials: materials.map((m) => ({
            _id: m._id.toString(),
            name: m.name ?? 'Untitled File',
            url: m.url,
            type: m.type,
            size: m.size ?? 0,
          })),
          engagement: { avatars: [], commentCount: 0 },
        },
      },
    };
  }
}