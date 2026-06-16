import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { ClassUpdate, ClassUpdateDocument } from '../../../infrastructure/database/entities/update.entity';
import { Class, ClassDocument } from '../../../infrastructure/database/entities/class.entity';
import { Material, MaterialDocument } from '../../../infrastructure/database/entities/material.entity';
import { Enrollment, EnrollmentDocument } from '../../../infrastructure/database/entities/enrollment.entity';
import { NotificationType } from '../../../infrastructure/database/entities/notification.entity';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';
import { ClassStatus } from '../../../infrastructure/database/interface/class.interface';
import { MaterialType } from '../../../infrastructure/database/interface/material.interface';

import { CreateClassUpdateRequestDto, CreateClassUpdateResponseDto } from '../dto/create-class-update.dto';
import { NotificationService } from '../../notification/services/notification.service';
import { ActorType, type IActor } from '../../auth/interfaces/actor.interface';
import { ClassAccessService } from './class-access.service';

@Injectable()
export class CreateClassUpdateService {
  constructor(
    @InjectModel(ClassUpdate.name) private classUpdateModel: Model<ClassUpdateDocument>,
    @InjectModel(Class.name) private classModel: Model<ClassDocument>,
    @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
    @InjectModel(Enrollment.name) private enrollmentModel: Model<EnrollmentDocument>,
    private notificationService: NotificationService,
    private classAccessService: ClassAccessService,
  ) { }

  async execute(
    classId: string,
    actor: IActor,
    dto: CreateClassUpdateRequestDto,
  ): Promise<CreateClassUpdateResponseDto> {
    if (!Types.ObjectId.isValid(classId)) {
      throw new NotFoundException('Invalid Class ID format');
    }

    const classObjId = new Types.ObjectId(classId);
    const targetClass = await this.classModel.findById(classObjId).exec();

    if (!targetClass) {
      throw new NotFoundException('Class not found');
    }

    if (targetClass.status === ClassStatus.ENDED) {
      throw new ForbiddenException('Cannot post updates to an ended class');
    }

    await this.classAccessService.canCreateUpdate(targetClass, actor);

    const postedById = actor.type === ActorType.USER
      ? new Types.ObjectId(actor.userId)
      : targetClass.instructorId;

    const session = await this.classModel.db.startSession();
    session.startTransaction();

    let newUpdateId: Types.ObjectId;

    try {
      const [newUpdate] = await this.classUpdateModel.create([{
        classId: targetClass._id,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        eventAt: dto.eventAt ? new Date(dto.eventAt) : undefined,
        postedBy: postedById,
      }], { session });

      if (dto.materials?.length) {
        const materialsToCreate = dto.materials.map((m) => ({
          classId: targetClass._id,
          updateId: newUpdate._id,
          url: m.url,
          name: m.name,
          type: m.type,
          size: m.size,
          uploadedBy: postedById,
        }));

        const createdMaterials = await this.materialModel.insertMany(materialsToCreate, { session });

        await this.classUpdateModel.updateOne(
          { _id: newUpdate._id },
          { $set: { materials: createdMaterials.map((m) => m._id) } },
          { session },
        );
      }

      newUpdateId = newUpdate._id as Types.ObjectId;
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create class update');
    } finally {
      session.endSession();
    }

    const data = await this.classUpdateModel
      .findById(newUpdateId)
      .populate<{ postedBy: { _id: Types.ObjectId; name: string; avatarUrl: string | null } }>(
        'postedBy', 'name avatarUrl'
      )
      .populate<{ materials: Array<{ _id: Types.ObjectId; url: string; name?: string; type: MaterialType; size?: number }> }>(
        'materials'
      )
      .lean()
      .exec();

    if (!data) {
      throw new InternalServerErrorException('Failed to retrieve created update');
    }

    await this.sendNotifications(targetClass, data, actor, postedById);

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
          createdAt: data.createdAt ? data.createdAt.toISOString() : new Date().toISOString(),
          postedBy: {
            _id: data.postedBy._id.toString(),
            name: data.postedBy.name,
            avatarUrl: data.postedBy.avatarUrl ?? null,
          },
          materials: (data.materials ?? []).map((m) => ({
            _id: m._id.toString(),
            url: m.url,
            name: m.name,
            type: m.type,
            size: m.size,
          })),
        },
      },
    };
  }

  private async sendNotifications(targetClass: ClassDocument, data: any, actor: IActor, postedById: Types.ObjectId) {
    const allEnrollments = await this.enrollmentModel
      .find({
        classId: targetClass._id,
        role: { $in: [EnrollmentRole.LEARNER, EnrollmentRole.ASSISTANT] },
      })
      .select('userId role')
      .lean();

    const recipients = [
      ...new Set([
        ...allEnrollments.map((e) => e.userId.toString()),
        targetClass.instructorId.toString(),
      ]),
    ].filter((id) => (actor.type === ActorType.USER ? id !== actor.userId : true));

    if (recipients.length > 0) {
      await this.notificationService.createBulk({
        recipientIds: recipients,
        senderId: postedById.toString(),
        title: targetClass.name,
        message: 'A new update has been posted. Please check the latest update in the class.',
        type: NotificationType.UPDATE,
        metadata: { classId: targetClass._id.toString(), updateId: data._id.toString() },
      });
    }
  }
}