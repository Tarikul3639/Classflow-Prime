// server/src/modules/class/services/updates/update-class-update.service.ts

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../../infrastructure/database/entities/class.entity';
import { ClassUpdate, ClassUpdateDocument } from '../../../../infrastructure/database/entities/update.entity';
import { Material, MaterialDocument } from '../../../../infrastructure/database/entities/material.entity';
import { Enrollment, EnrollmentDocument } from '../../../../infrastructure/database/entities/enrollment.entity';
import { NotificationType } from '../../../../infrastructure/database/entities/notification.entity';

import { ClassStatus } from '../../../../infrastructure/database/interface/class.interface';

import {
  UpdateClassUpdateRequestDto,
  UpdateClassUpdateResponseDto,
} from '../../dto/update-class-update.dto';
import { NotificationService } from '../../../notification/services/notification.service';
import { buildChangeTrackedUpdate, trackDerivedChange } from '../../../../utils/change-tracker.util';

type PostedByDoc = { _id: Types.ObjectId; name: string; avatarUrl: string | null };

type ExistingUpdateDoc = {
  title: string;
  description: string;
  category: string;
  eventAt?: Date | null;
  postedBy: Types.ObjectId;
  isPinned: boolean;
};

@Injectable()
export class UpdateClassUpdateService {
  constructor(
    @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
    @InjectModel(ClassUpdate.name) private readonly classUpdateModel: Model<ClassUpdateDocument>,
    @InjectModel(Material.name) private readonly materialModel: Model<MaterialDocument>,
    @InjectModel(Enrollment.name) private readonly enrollmentModel: Model<EnrollmentDocument>,
    private readonly notificationService: NotificationService,
  ) { }

  async execute(
    classId: string,
    updateId: string,
    dto: UpdateClassUpdateRequestDto,
  ): Promise<UpdateClassUpdateResponseDto> {
    if (!Types.ObjectId.isValid(classId)) throw new NotFoundException('Invalid class id');
    if (!Types.ObjectId.isValid(updateId)) throw new NotFoundException('Invalid update id');

    const classObjectId = new Types.ObjectId(classId);
    const updateObjectId = new Types.ObjectId(updateId);

    const classData = await this.classModel
      .findById(classObjectId)
      .select('className status')
      .lean<{ className: string; status: ClassStatus }>()
      .exec();
    if (!classData) throw new NotFoundException('Class not found');
    if (classData.status === ClassStatus.ENDED) {
      throw new ForbiddenException('Cannot modify updates of an ended class');
    }

    const existingUpdate = await this.classUpdateModel
      .findOne({ _id: updateObjectId, classId: classObjectId })
      .select('title description category eventAt postedBy isPinned')
      .lean<ExistingUpdateDoc>()
      .exec();
    if (!existingUpdate) throw new NotFoundException('Update not found');

    // --- single source of truth: field-by-field config drives BOTH the
    // Mongo $set payload AND the human-readable change log ---
    const { updateFields, changes } = buildChangeTrackedUpdate(
      existingUpdate,
      dto,
      {
        title: { label: 'Title' },
        description: { label: 'Description' },
        category: { label: 'Category' },
        eventAt: {
          label: 'Event date',
          transform: (v) => (v ? new Date(v) : null),
          formatter: (v) => (v instanceof Date ? v.toLocaleString() : v ? String(v) : 'Empty'),
        },
      },
    );

    // isPinned has no display value in the change log (kept silent like before)
    if (dto.isPinned !== undefined) updateFields.isPinned = dto.isPinned;

    // materials is a derived count, not a direct entity field
    if (dto.materials !== undefined) {
      const previousMaterialsCount = await this.materialModel.countDocuments({
        updateId: updateObjectId,
      });
      const materialsChange = trackDerivedChange(
        'Materials',
        previousMaterialsCount,
        dto.materials.length,
        (v) => `${v} file${Number(v) === 1 ? '' : 's'}`,
      );
      if (materialsChange) changes.push(materialsChange);
    }

    const session = await this.classModel.db.startSession();
    session.startTransaction();

    try {
      await this.classUpdateModel.findByIdAndUpdate(updateObjectId, { $set: updateFields }, { session });

      if (dto.materials !== undefined) {
        await this.materialModel.deleteMany({ updateId: updateObjectId }, { session });

        const materialIds = dto.materials.length
          ? (
            await this.materialModel.insertMany(
              dto.materials.map((m) => ({
                classId: classObjectId,
                updateId: updateObjectId,
                url: m.url,
                name: m.name,
                type: m.type,
                size: m.size,
                uploadedBy: existingUpdate.postedBy,
              })),
              { session },
            )
          ).map((m) => m._id)
          : [];

        await this.classUpdateModel.findByIdAndUpdate(
          updateObjectId,
          { $set: { materials: materialIds } },
          { session },
        );
      }

      await session.commitTransaction();
    } catch {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to modify class update');
    } finally {
      session.endSession();
    }

    const updatedDoc = await this.classUpdateModel
      .findById(updateObjectId)
      .populate<{ postedBy: PostedByDoc }>('postedBy', 'name avatarUrl')
      .lean()
      .exec();
    if (!updatedDoc) throw new NotFoundException('Update not found after save');

    const materials = await this.materialModel.find({ updateId: updateObjectId }).lean().exec();

    const enrollments = await this.enrollmentModel
      .find({ classId: classObjectId })
      .select('userId')
      .lean<{ userId: Types.ObjectId }[]>()
      .exec();

    const recipientIds = [...new Set(enrollments.map((e) => e.userId.toString()))].filter(
      (id) => id !== updatedDoc.postedBy._id.toString(),
    );

    if (recipientIds.length > 0) {
      await this.notificationService.createBulk({
        recipientIds,
        senderId: updatedDoc.postedBy._id.toString(),
        title: classData.className,
        message: changes.length ? changes.join('\n') : 'An update has been modified.',
        type: NotificationType.UPDATE,
        metadata: { classId, updateId: updateObjectId.toString() },
      });
    }

    return {
      success: true,
      message: 'Update modified successfully',
      data: {
        update: {
          _id: updatedDoc._id.toString(),
          classId: updatedDoc.classId.toString(),
          category: updatedDoc.category,
          title: updatedDoc.title,
          description: updatedDoc.description,
          isPinned: updatedDoc.isPinned,
          postedBy: {
            _id: updatedDoc.postedBy._id.toString(),
            name: updatedDoc.postedBy.name,
            avatarUrl: updatedDoc.postedBy.avatarUrl ?? null,
          },
          eventAt: updatedDoc.eventAt ? updatedDoc.eventAt.toISOString() : null,
          createdAt: updatedDoc.createdAt?.toISOString?.() ?? new Date().toISOString(),
          updatedAt: updatedDoc.updatedAt?.toISOString?.() ?? new Date().toISOString(),
          materials: materials.map((m) => ({
            _id: m._id.toString(),
            url: m.url,
            name: m.name ?? 'Untitled File',
            type: m.type,
            size: m.size ?? 0,
          })),
        },
      },
    };
  }
}