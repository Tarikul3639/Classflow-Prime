import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../../infrastructure/database/entities/class.entity';
import { ClassUpdate, ClassUpdateDocument } from '../../../../infrastructure/database/entities/update.entity';
import { Material, MaterialDocument } from '../../../../infrastructure/database/entities/material.entity';
import { FetchClassUpdateResponseDto } from '../../dto/fetch-class-update.dto';

@Injectable()
export class FetchClassUpdateService {
  constructor(
    @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
    @InjectModel(ClassUpdate.name) private readonly classUpdateModel: Model<ClassUpdateDocument>,
    @InjectModel(Material.name) private readonly materialModel: Model<MaterialDocument>,
  ) {}

  async execute(classId: string): Promise<FetchClassUpdateResponseDto> {
    const classObjectId = new Types.ObjectId(classId);

    // ── Validate Class ──────────────────────────
    const existingClass = await this.classModel
      .findById(classObjectId)
      .select('_id')
      .lean();

    if (!existingClass) throw new NotFoundException('Class not found');

    // ── Fetch Updates ──────────────────────────
    const updates = await this.classUpdateModel
      .find({ classId: classObjectId })
      .populate('postedBy', 'name avatarUrl')
      .sort({ isPinned: -1, eventAt: 1, createdAt: -1 })
      .lean();

    // ── Fetch Materials & Grouping ──────────────
    const updateIds = updates.map((u) => u._id);
    const materials = await this.materialModel.find({ updateId: { $in: updateIds } }).lean();

    const materialMap = new Map<string, any[]>();
    for (const m of materials) {
      const key = m.updateId.toString();
      if (!materialMap.has(key)) materialMap.set(key, []);
      materialMap.get(key)?.push({
        _id: m._id.toString(),
        name: m.name ?? 'Untitled File',
        url: m.url,
        type: m.type,
        size: m.size ?? 0,
      });
    }

    // ── Response ────────────────────────────────
    return {
      success: true,
      message: 'Class updates fetched successfully',
      data: {
        update: updates.map((u: any) => ({
          _id: u._id.toString(),
          classId: u.classId.toString(),
          title: u.title,
          description: u.description ?? null,
          category: u.category,
          isPinned: u.isPinned,
          eventAt: u.eventAt,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
          postedBy: {
            _id: u.postedBy?._id?.toString() ?? '',
            name: u.postedBy?.name ?? 'Unknown User',
            avatarUrl: u.postedBy?.avatarUrl ?? null,
          },
          materials: materialMap.get(u._id.toString()) ?? [],
          engagement: { avatars: [], commentCount: 0 },
        })),
      },
    };
  }
}