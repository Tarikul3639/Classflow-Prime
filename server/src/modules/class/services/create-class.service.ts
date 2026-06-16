import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Class, ClassDocument } from '../../../infrastructure/database/entities/class.entity';
import {
  CreateClassResponseDto,
  CreateClassRequestDto,
} from '../dto/create-class.dto';
import {
  IClass,
  ClassStatus,
} from '../../../infrastructure/database/interface/class.interface';

@Injectable()
export class CreateClassService {
  constructor(
    @InjectModel(Class.name)
    private readonly classModel: Model<ClassDocument>,
  ) {}

  async execute(
    userId: string,
    dto: CreateClassRequestDto,
  ): Promise<CreateClassResponseDto> {
    // Generate uppercase, unique enroll code
    const enrollCode = await this.generateUniqueEnrollCode();

    const newClass = new this.classModel<IClass>({
      name: dto.className,
      department: dto.department,
      semester: dto.semester,
      coverImage: dto.coverImage,
      themeColor: dto.themeColor || '#3B82F6',
      allowEnroll: dto.allowEnroll ?? true,
      instructorId: new Types.ObjectId(userId),
      status: ClassStatus.ACTIVE,
      enrollCode,
    });

    await newClass.save();

    return {
      success: true,
      message: 'Class created successfully',
      data: {
        classId: newClass._id.toString(),
      },
    };
  }

  // Utility: generate unique uppercase enroll code
  private async generateUniqueEnrollCode(): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const ClassModel = this.classModel;

    let code = '';
    let exists = true;

    while (exists) {
      code = Array.from({ length: 6 }, () =>
        characters.charAt(Math.floor(Math.random() * characters.length)),
      ).join('');

      exists = !!(await ClassModel.exists({ enrollCode: code }));
    }

    return code;
  }
}
