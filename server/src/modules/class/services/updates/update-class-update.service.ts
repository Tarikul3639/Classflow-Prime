// update-class-update.service.ts

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

// Entities
import { Class, ClassDocument } from '../../../../infrastructure/database/entities/class.entity';
import { ClassUpdate, ClassUpdateDocument } from '../../../../infrastructure/database/entities/update.entity';
import { Material, MaterialDocument } from '../../../../infrastructure/database/entities/material.entity';
import { Enrollment, EnrollmentDocument } from '../../../../infrastructure/database/entities/enrollment.entity';
import { NotificationType } from '../../../../infrastructure/database/entities/notification.entity';

// Interfaces
import { ClassStatus } from '../../../../infrastructure/database/interface/class.interface';
import { UpdateCategory } from '../../../../infrastructure/database/interface/update.interface';

// DTOs & Services
import { UpdateClassUpdateRequestDto, UpdateClassUpdateResponseDto } from '../../dto/update-class-update.dto';
import { NotificationService } from '../../../notification/services/notification.service';

@Injectable()
export class UpdateClassUpdateService {
  constructor(
    @InjectModel(Class.name)
    private readonly classModel: Model<ClassDocument>,

    @InjectModel(ClassUpdate.name)
    private readonly classUpdateModel: Model<ClassUpdateDocument>,

    @InjectModel(Material.name)
    private readonly materialModel: Model<MaterialDocument>,

    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<EnrollmentDocument>,

    private readonly notificationService: NotificationService,
  ) {}

  async execute(
    classId: string,
    updateId: string,
    dto: UpdateClassUpdateRequestDto,
  ): Promise<UpdateClassUpdateResponseDto> {
    
    // 1. Validation check (ObjectId)
    if (!Types.ObjectId.isValid(classId)) {
      throw new NotFoundException('Invalid class id');
    }

    if (!Types.ObjectId.isValid(updateId)) {
      throw new NotFoundException('Invalid update id');
    }

    const classObjectId = new Types.ObjectId(classId);
    const updateObjectId = new Types.ObjectId(updateId);

    // 2. Fetch class data and check status
    const classData = await this.classModel
      .findById(classObjectId)
      .select('name status')
      .lean<{ name: string; status: ClassStatus }>();

    if (!classData) {
      throw new NotFoundException('Class not found');
    }

    if (classData.status === ClassStatus.ENDED) {
      throw new ForbiddenException('Cannot modify updates of an ended class');
    }

    // 3. Find the existing update
    const existingUpdate = await this.classUpdateModel
      .findOne({
        _id: updateObjectId,
        classId: classObjectId,
      })
      .select('title description category eventAt postedBy')
      .lean<{
        title: string;
        description: string;
        category: UpdateCategory;
        eventAt?: Date | null;
        postedBy: Types.ObjectId;
      }>();

    if (!existingUpdate) {
      throw new NotFoundException('Update not found');
    }

    // 4. Track changes for notifications
    const changes: string[] = [];

    if (dto.title !== undefined && dto.title !== existingUpdate.title) {
      changes.push('Title updated');
    }

    if (dto.description !== undefined && dto.description !== existingUpdate.description) {
      changes.push('Description updated');
    }

    if (dto.category !== undefined && dto.category !== existingUpdate.category) {
      changes.push('Category updated');
    }

    if (dto.eventAt !== undefined) {
      const oldDate = existingUpdate.eventAt ? existingUpdate.eventAt.toISOString() : null;
      const newDate = dto.eventAt ? new Date(dto.eventAt).toISOString() : null;

      if (oldDate !== newDate) {
        changes.push('Event date updated');
      }
    }

    if (dto.materials !== undefined) {
      changes.push('Materials updated');
    }

    // 5. Prepare update fields
    const updateFields: Record<string, unknown> = {};

    if (dto.title !== undefined) updateFields.title = dto.title;
    if (dto.description !== undefined) updateFields.description = dto.description;
    if (dto.category !== undefined) updateFields.category = dto.category;
    if (dto.isPinned !== undefined) updateFields.isPinned = dto.isPinned;
    if (dto.eventAt !== undefined) {
      updateFields.eventAt = dto.eventAt ? new Date(dto.eventAt) : undefined;
    }

    // 6. Start database transaction
    const session = await this.classModel.db.startSession();
    session.startTransaction();

    try {
      await this.classUpdateModel.findByIdAndUpdate(
        updateObjectId,
        { $set: updateFields },
        { session },
      );

      // Handle material updates
      if (dto.materials !== undefined) {
        await this.materialModel.deleteMany(
          { updateId: updateObjectId },
          { session },
        );

        if (dto.materials.length > 0) {
          const newMaterials = dto.materials.map((m) => ({
            classId: classObjectId,
            updateId: updateObjectId,
            url: m.url,
            name: m.name,
            type: m.type,
            size: m.size,
            uploadedBy: existingUpdate.postedBy,
          }));

          const savedMaterials = await this.materialModel.insertMany(newMaterials, {
            session,
          });

          await this.classUpdateModel.findByIdAndUpdate(
            updateObjectId,
            {
              $set: {
                materials: savedMaterials.map((m) => m._id),
              },
            },
            { session },
          );
        } else {
          await this.classUpdateModel.findByIdAndUpdate(
            updateObjectId,
            { $set: { materials: [] } },
            { session },
          );
        }
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to modify class update');
    } finally {
      session.endSession();
    }

    // 7. Fetch updated data and send notifications
    const updatedDoc = await this.classUpdateModel
      .findById(updateObjectId)
      .populate<{
        postedBy: {
          _id: Types.ObjectId;
          name: string;
          avatarUrl: string | null;
        };
      }>('postedBy', 'name avatarUrl')
      .lean()
      .exec();

    if (!updatedDoc) {
      throw new NotFoundException('Update not found after save');
    }

    const materials = await this.materialModel
      .find({ updateId: updateObjectId })
      .lean()
      .exec();

    const enrollments = await this.enrollmentModel
      .find({ classId: classObjectId })
      .select('userId')
      .lean<{ userId: Types.ObjectId }[]>()
      .exec();

    const recipientIds = [
      ...new Set(enrollments.map((e) => e.userId.toString())),
    ].filter((id) => id !== updatedDoc.postedBy._id.toString());

    const message = changes.length > 0 ? changes.join(', ') : 'An update has been modified.';

    if (recipientIds.length > 0) {
      await this.notificationService.createBulk({
        recipientIds,
        senderId: updatedDoc.postedBy._id.toString(),
        title: classData.name,
        message,
        type: NotificationType.UPDATE,
        metadata: {
          classId,
          updateId: updateObjectId.toString(),
        },
      });
    }

    // 8. Return response
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
          createdAt: updatedDoc.createdAt.toISOString(),
          updatedAt: updatedDoc.updatedAt.toISOString(),
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