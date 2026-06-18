import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../infrastructure/database/entities/class.entity';
import { Enrollment, EnrollmentDocument } from '../../../infrastructure/database/entities/enrollment.entity';
import { CreateClassResponseDto, CreateClassRequestDto } from '../dto/create-class.dto';
import { ClassStatus } from '../../../infrastructure/database/interface/class.interface';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';

@Injectable()
export class CreateClassService {
  constructor(
    @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
    @InjectModel(Enrollment.name) private readonly enrollmentModel: Model<EnrollmentDocument>,
  ) { }

  async execute(userId: string, dto: CreateClassRequestDto): Promise<CreateClassResponseDto> {
    const userObjectId = new Types.ObjectId(userId);
    const enrollCode = await this.generateUniqueEnrollCode();
    const session = await this.classModel.db.startSession();

    session.startTransaction();
    try {
      const [newClass] = await this.classModel.create([{
        className: dto.className,
        department: dto.department,
        semester: dto.semester,
        coverImage: dto.coverImage,
        themeColor: dto.themeColor || '#3B82F6',
        allowEnroll: dto.allowEnroll ?? true,
        status: ClassStatus.ACTIVE,
        enrollCode,
      }], { session });

      await this.enrollmentModel.create([{
        userId: userObjectId,
        classId: newClass._id,
        role: EnrollmentRole.INSTRUCTOR,
        enrolledAt: new Date(),
      }], { session });

      await session.commitTransaction();

      return {
        success: true,
        message: 'Class created successfully',
        data: { classId: newClass._id.toString() },
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  private async generateUniqueEnrollCode(): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let exists = true;

    while (exists) {
      code = Array.from({ length: 6 }, () =>
        characters.charAt(Math.floor(Math.random() * characters.length))
      ).join('');

      exists = !!(await this.classModel.exists({ enrollCode: code }));
    }
    return code;
  }
}