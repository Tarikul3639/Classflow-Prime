// create-class-update.service.ts

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';

// Entities
import {
  ClassUpdate,
  ClassUpdateDocument,
} from '../../../../infrastructure/database/entities/update.entity';

import {
  Class,
  ClassDocument,
} from '../../../../infrastructure/database/entities/class.entity';

import {
  Material,
  MaterialDocument,
} from '../../../../infrastructure/database/entities/material.entity';

import {
  Enrollment,
  EnrollmentDocument,
} from '../../../../infrastructure/database/entities/enrollment.entity';

import {
  NotificationType,
} from '../../../../infrastructure/database/entities/notification.entity';

// Interfaces
import {
  EnrollmentRole,
} from '../../../../infrastructure/database/interface/enrollment.interface';

import {
  ClassStatus,
} from '../../../../infrastructure/database/interface/class.interface';

import {
  MaterialType,
} from '../../../../infrastructure/database/interface/material.interface';

// DTOs & Services
import {
  CreateClassUpdateRequestDto,
  CreateClassUpdateResponseDto,
} from '../../dto/create-class-update.dto';

import {
  NotificationService,
} from '../../../notification/services/notification.service';


@Injectable()
export class CreateClassUpdateService {
  constructor(
    @InjectModel(ClassUpdate.name)
    private readonly classUpdateModel: Model<ClassUpdateDocument>,

    @InjectModel(Class.name)
    private readonly classModel: Model<ClassDocument>,

    @InjectModel(Material.name)
    private readonly materialModel: Model<MaterialDocument>,

    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<EnrollmentDocument>,

    private readonly notificationService: NotificationService,
  ) { }

  async execute(
    classId: string,
    userId: string,
    dto: CreateClassUpdateRequestDto,
  ): Promise<CreateClassUpdateResponseDto> {
    if (!Types.ObjectId.isValid(classId)) {
      throw new NotFoundException('Invalid class id');
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new ForbiddenException('Invalid user');
    }

    const classObjectId = new Types.ObjectId(classId);
    const senderId = new Types.ObjectId(userId);

    const targetClass = await this.classModel
      .findById(classObjectId)
      .select('name status')
      .lean<{ name: string; status: ClassStatus }>();

    if (!targetClass) {
      throw new NotFoundException('Class not found');
    }

    if (targetClass.status === ClassStatus.ENDED) {
      throw new ForbiddenException('Cannot post updates to an ended class');
    }

    const session = await this.classModel.db.startSession();

    let newUpdateId: Types.ObjectId;

    try {
      session.startTransaction();

      const [newUpdate] = await this.classUpdateModel.create(
        [
          {
            classId: classObjectId,
            title: dto.title,
            description: dto.description,
            category: dto.category,
            eventAt: dto.eventAt ? new Date(dto.eventAt) : undefined,
            postedBy: senderId,
          },
        ],
        { session },
      );

      if (dto.materials?.length) {
        const materialsToCreate = dto.materials.map((m) => ({
          classId: classObjectId,
          updateId: newUpdate._id,
          url: m.url,
          name: m.name,
          type: m.type,
          size: m.size,
          uploadedBy: senderId,
        }));

        const createdMaterials = await this.materialModel.insertMany(
          materialsToCreate,
          { session },
        );

        await this.classUpdateModel.updateOne(
          { _id: newUpdate._id },
          {
            $set: {
              materials: createdMaterials.map((m) => m._id),
            },
          },
          { session },
        );
      }

      newUpdateId = newUpdate._id as Types.ObjectId;

      await session.commitTransaction();
    } catch {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create class update');
    } finally {
      session.endSession();
    }

    const data = await this.classUpdateModel
      .findById(newUpdateId)
      .populate<{
        postedBy: {
          _id: Types.ObjectId;
          name: string;
          avatarUrl: string | null;
        };
      }>('postedBy', 'name avatarUrl')
      .populate<{
        materials: {
          _id: Types.ObjectId;
          url: string;
          name?: string;
          type: MaterialType;
          size?: number;
        }[];
      }>('materials')
      .lean()
      .exec();

    if (!data) {
      throw new InternalServerErrorException(
        'Failed to retrieve created update',
      );
    }

    await this.sendNotifications(
      classObjectId,
      targetClass.name ?? 'Class',
      data._id as Types.ObjectId,
      senderId,
    );

    return {
      success: true,
      message: 'Class update created successfully',
      data: {
        update: {
          _id: data._id.toString(),
          classId: data.classId.toString(),
          category: data.category,
          title: data.title,
          description: data.description,
          isPinned: data.isPinned,
          eventAt: data.eventAt ? data.eventAt.toISOString() : null,
          createdAt: data.createdAt
            ? data.createdAt.toISOString()
            : new Date().toISOString(),
          postedBy: {
            _id: data.postedBy._id.toString(),
            name: data.postedBy.name,
            avatarUrl: data.postedBy.avatarUrl ?? null,
          },
          materials: (data.materials ?? []).map((m) => ({
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

  private async sendNotifications(
    classId: Types.ObjectId,
    className: string,
    updateId: Types.ObjectId,
    senderId: Types.ObjectId,
  ) {
    const enrollments = await this.enrollmentModel
      .find({
        classId,
        role: {
          $in: [
            EnrollmentRole.INSTRUCTOR,
            EnrollmentRole.LEARNER,
            EnrollmentRole.ASSISTANT,
          ],
        },
      })
      .select('userId')
      .lean<{ userId: Types.ObjectId }[]>()
      .exec();

    const recipientIds = [
      ...new Set(enrollments.map((e) => e.userId.toString())),
    ].filter((id) => id !== senderId.toString());

    if (!recipientIds.length) {
      return;
    }

    await this.notificationService.createBulk({
      recipientIds,
      senderId: senderId.toString(),
      title: className,
      message:
        'A new update has been posted. Please check the latest update in the class.',
      type: NotificationType.UPDATE,
      metadata: {
        classId: classId.toString(),
        updateId: updateId.toString(),
      },
    });
  }
}