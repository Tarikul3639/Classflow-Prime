import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ClassUpdate,
  ClassUpdateDocument,
} from '../../../database/entities/update.entity';
import { Class, ClassDocument } from '../../../database/entities/class.entity';
import {
  Material,
  MaterialDocument,
} from '../../../database/entities/material.entity';
import { CreateClassUpdateRequestDto } from '../dto/create-class-update.dto';
import { NotificationService } from '../../notification/services/notification.service';
import { NotificationType } from '../../../database/entities/notification.entity';
import {
  Enrollment,
  EnrollmentDocument,
} from '../../../database/entities/enrollment.entity';
import { EnrollmentRole } from '../../../database/interface/enrollment.interface';
import { ClassStatus } from '../../../database/interface/class.interface';

@Injectable()
export class CreateClassUpdateService {
  constructor(
    @InjectModel(ClassUpdate.name)
    private classUpdateModel: Model<ClassUpdateDocument>,
    @InjectModel(Class.name) private classModel: Model<ClassDocument>,
    @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    private notificationService: NotificationService,
  ) { }

  async execute(
    classId: string,
    userId: string,
    dto: CreateClassUpdateRequestDto,
  ) {
    console.log('--- EXECUTING CREATE UPDATE SERVICE ---', { userId, title: dto.title });

    const userObjId = new Types.ObjectId(userId);
    const classObjId = new Types.ObjectId(classId);

    // ── Validate Class ID format ───────────────────────────────────────────
    if (!Types.ObjectId.isValid(classObjId)) {
      throw new NotFoundException('Invalid Class ID format');
    }

    // ── Fetch the target class from the database ───────────────────────────
    const targetClass = await this.classModel.findById(classObjId).exec();

    if (!targetClass) {
      throw new NotFoundException('Class not found');
    }

    if (targetClass.status === ClassStatus.ENDED) {
      throw new ForbiddenException('Cannot post updates to an ended class');
    }

    // ── Check if the user is the instructor of the class ───────────────────
    const isInstructor = targetClass.instructorId.equals(userObjId);

    // ── Check if the user is an assistant of the class ────────────────────
    const isAssistant = await this.enrollmentModel.exists({
      classId: classObjId,
      userId: userObjId,
      role: EnrollmentRole.ASSISTANT,
    });

    // ── Only instructors and assistants are allowed to post updates ────────
    if (!isInstructor && !isAssistant) {
      throw new ForbiddenException(
        'You do not have permission to post updates',
      );
    }

    // ── Start a MongoDB session and transaction ────────────────────────────
    // This ensures the class update and its materials are created atomically.
    // If anything fails, the entire operation is rolled back.
    const session = await this.classModel.db.startSession();
    session.startTransaction();

    let newUpdateId: Types.ObjectId;

    try {
      // ── Create the class update document ──────────────────────────────
      const [newUpdate] = await this.classUpdateModel.create(
        [
          {
            classId: targetClass._id,
            title: dto.title,
            description: dto.description,
            category: dto.category,
            eventAt: dto.eventAt ? new Date(dto.eventAt) : undefined,
            postedBy: userObjId,
          },
        ],
        { session },
      );

      // ── If materials are provided, create and link them ────────────────
      if (dto.materials && dto.materials.length > 0) {
        const materialsToCreate = dto.materials.map((m) => ({
          classId: targetClass._id,
          updateId: newUpdate._id,
          url: m.url,
          name: m.name,
          type: m.type,
          size: m.size,
          uploadedBy: userObjId,
        }));

        // Insert all materials in a single bulk operation
        const createdMaterials = await this.materialModel.insertMany(
          materialsToCreate,
          { session },
        );

        // Extract the IDs of the newly created materials
        const materialIds = createdMaterials.map((m) => m._id);

        // Update the class update document to reference the material IDs
        await this.classUpdateModel.updateOne(
          { _id: newUpdate._id },
          { $set: { materials: materialIds } },
          { session },
        );
      }

      // ── Save the new update ID before committing ───────────────────────
      // We store this outside the try block scope so we can use it after commit.
      newUpdateId = newUpdate._id as Types.ObjectId;

      // ── Commit the transaction — all DB writes are now permanent ──────
      await session.commitTransaction();
    } catch (error) {
      // ── If anything failed, roll back all changes ──────────────────────
      await session.abortTransaction();
      console.error('Transaction Error:', error);
      throw new InternalServerErrorException('Failed to create class update');
    } finally {
      // ── Always close the session regardless of success or failure ──────
      session.endSession();
    }

    // ── Fetch the fully populated update AFTER the transaction closes ──────
    // This is intentionally outside the try/catch to avoid calling
    // abortTransaction() on an already-committed session if populate fails.
    const data = await this.classUpdateModel
      .findById(newUpdateId)
      .populate('postedBy', 'name avatarUrl')
      .populate('materials')
      .exec();

    // ── Fetch all enrolled learners AND assistants in a single DB query ────
    // Using $in on the role field avoids making two separate round-trips.
    const allEnrollments = await this.enrollmentModel
      .find({
        classId: classObjId,
        role: { $in: [EnrollmentRole.LEARNER, EnrollmentRole.ASSISTANT] },
      })
      .select('userId role')
      .lean();

    // ── Separate learner and assistant IDs from the combined result ────────
    const learnerIds = allEnrollments
      .filter((e) => e.role === EnrollmentRole.LEARNER)
      .map((e) => e.userId.toString());

    const assistantIds = allEnrollments
      .filter((e) => e.role === EnrollmentRole.ASSISTANT)
      .map((e) => e.userId.toString());

    // ── Include the class instructor ──────────────────────────────────────
    const instructorId = targetClass.instructorId.toString();

    // ── Merge all recipients and remove the poster to avoid self-notification
    const allRecipients = [
      ...new Set([...learnerIds, ...assistantIds, instructorId]),
    ].filter((id) => id !== userId);

    // ── Send bulk notifications to all recipients (if any) ────────────────
    if (allRecipients.length > 0) {
      await this.notificationService.createBulk({
        recipientIds: allRecipients,
        senderId: userObjId.toString(),
        title: targetClass.name,
        message: `A new update has been posted. Please check the latest update in the class.`,
        type: NotificationType.UPDATE,
        metadata: {
          classId,
          updateId: data?._id.toString(),
        },
      });
    }

    return {
      success: true,
      message: 'Class update created successfully',
      update: data,
    };
  }
}