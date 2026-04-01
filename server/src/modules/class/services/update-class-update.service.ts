// update-class-update.service.ts

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Class, ClassDocument } from '../../../database/entities/class.entity';
import {
  ClassUpdate,
  ClassUpdateDocument,
} from '../../../database/entities/update.entity';
import {
  Material,
  MaterialDocument,
} from '../../../database/entities/material.entity';
import { UpdateClassUpdateRequestDto } from '../dto/update-class-update.dto';
import { UpdateClassUpdateResponseDto } from '../dto/update-class-update.dto';

import { Enrollment, EnrollmentDocument } from '../../../database/entities/enrollment.entity';
import { EnrollmentRole } from '../../../database/interface/enrollment.interface';

import { NotificationService } from '../../notification/services/notification.service';
import { NotificationType } from '../../../database/entities/notification.entity';

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
  ) { }

  async execute(
    userId: string,
    classId: string,
    updateId: string,
    dto: UpdateClassUpdateRequestDto,
  ): Promise<UpdateClassUpdateResponseDto> {
    const userObjectId = new Types.ObjectId(userId);
    const classObjectId = new Types.ObjectId(classId);
    const updateObjectId = new Types.ObjectId(updateId);

    console.log(
      `Updating Update - Class: ${classId}, Update: ${updateId}, User: ${userId}, Body: ${JSON.stringify(dto)}`,
    );

    // Step 1: check if class exists
    const classData = await this.classModel.findOne({
      _id: classObjectId,
      isArchived: false,
    });

    if (!classData) {
      throw new NotFoundException('Class not found');
    }

    // Step 2: Permission check
    const isInstructor = classData.instructorId.equals(userObjectId);
    const isAssistant = await this.enrollmentModel.exists({
      userId: userObjectId,
      classId: classObjectId,
      role: EnrollmentRole.ASSISTANT,
    });

    if (!isInstructor && !isAssistant) {
      throw new ForbiddenException(
        'Only instructors and assistants can edit updates',
      );
    }

    // Step 3: Check if the update exists
    const existingUpdate = await this.classUpdateModel.findOne({
      _id: updateObjectId,
      classId: classObjectId,
    });

    if (!existingUpdate) {
      throw new NotFoundException('Update not found');
    }

    // Step 5: Update fields prepare করো
    const updateFields: Record<string, unknown> = {};
    if (dto.title !== undefined) updateFields.title = dto.title;
    if (dto.description !== undefined)
      updateFields.description = dto.description;
    if (dto.category !== undefined) updateFields.category = dto.category;
    if (dto.isPinned !== undefined) updateFields.isPinned = dto.isPinned;
    if (dto.eventAt !== undefined) updateFields.eventAt = dto.eventAt;

    // Step 6: Update the class update document
    await this.classUpdateModel.findByIdAndUpdate(updateObjectId, {
      $set: updateFields,
    });

    // Step 7: Materials update if provided
    if (dto.materials !== undefined) {
      // Old materials delete
      await this.materialModel.deleteMany({ updateId: updateObjectId });

      // New materials create
      if (dto.materials.length > 0) {
        const newMaterials = dto.materials.map((m) => ({
          classId: classObjectId,
          updateId: updateObjectId,
          url: m.url,
          name: m.name,
          type: m.type,
          size: m.size,
          uploadedBy: userObjectId,
        }));

        const savedMaterials =
          await this.materialModel.insertMany(newMaterials);

        await this.classUpdateModel.findByIdAndUpdate(updateObjectId, {
          $set: {
            materials: savedMaterials.map((m) => m._id),
          },
        });
      } else {
        // If materials array is empty, just clear the materials field
        await this.classUpdateModel.findByIdAndUpdate(updateObjectId, {
          $set: { materials: [] },
        });
      }
    }

    // Step 8: Updated document populate করে return করো
    const updatedDoc = await this.classUpdateModel
      .findById(updateObjectId)
      .populate<{
        postedBy: {
          _id: Types.ObjectId;
          name: string;
          avatarUrl: string | null;
        };
      }>('postedBy', 'name avatarUrl')
      .lean();

    if (!updatedDoc) {
      throw new NotFoundException('Update not found after save');
    }

    const materials = await this.materialModel
      .find({ updateId: updateObjectId })
      .lean();

    /**
     * After successfully updating the class update and associated materials,
     * we need to notify all relevant users (learners, assistants, instructor).
     * This is done after the transaction commits to ensure we only notify if the update was modified successfully.
     */

    // ── 1. Get all enrolled learners ───────────────────────
    const enrollments = await this.enrollmentModel
      .find({ classId: classObjectId })
      .select('userId')
      .lean();

    // Extract userIds from enrollments
    const enrollmentIds = enrollments.map((e) => e.userId.toString());

    // ── 2. Get assistants and instructor ───────────────────
    const instructorId = classData.instructorId.toString();

    // ── 3. Combine all recipient IDs and remove duplicates ──
    const allRecipients = [
      ...new Set([...enrollmentIds, instructorId]),
    ].filter((id) => id !== userId); // remove whoever posted

    // ── 4. Send notifications ───────────────────────────────
    if (allRecipients.length > 0) {
      await this.notificationService.createBulk({
        recipientIds: allRecipients,
        senderId: userObjectId as any,
        title: classData.name,
        message: `An update has been modified please check the latest changes in the class.`,
        type: NotificationType.UPDATE,
        metadata: {
          classId,
          updateId: updateObjectId.toString(),
        },
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
          eventAt: updatedDoc.eventAt ?? null,
          createdAt: updatedDoc.createdAt || new Date(),
          updatedAt: updatedDoc.updatedAt || new Date(),
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
