// fetch-class-code.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../database/entities/class.entity';
import { FetchClassSettingsResponseDto } from '../dto/class-settings.dto';

@Injectable()
export class FetchClassSettingsService {
    constructor(
        @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
    ) { }

    async execute(userId: string, classId: string): Promise<FetchClassSettingsResponseDto> {
        const userObjectId = new Types.ObjectId(userId);
        const classObjectId = new Types.ObjectId(classId);

        // Check if class exists
        const existingClass = await this.classModel.findById(classObjectId);
        if (!existingClass) throw new NotFoundException('Class not found');

        if (!existingClass.instructorId.equals(userObjectId)) {
            throw new ForbiddenException('Only the instructor can view the class code');
        }

        return {
            success: true,
            message: 'Class code fetched successfully.',
            data: {
                code: existingClass.enrollCode,
                isJoiningAllowed: existingClass.allowEnroll,
            },
        };
    }
}