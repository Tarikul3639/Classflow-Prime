import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
    Class,
    ClassDocument,
} from '../../../infrastructure/database/entities/class.entity';
import {
    UpdateClassRequestDto,
    UpdateClassResponseDto,
} from '../dto/update-class.dto';

@Injectable()
export class UpdateClassService {
    constructor(
        @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
    ) { }

    async execute(
        classId: string,
        dto: UpdateClassRequestDto,
    ): Promise<UpdateClassResponseDto> {
        if (!Types.ObjectId.isValid(classId)) {
            throw new NotFoundException('Class not found');
        }

        const existingClass = await this.classModel.findById(classId).lean().exec();

        if (!existingClass) {
            throw new NotFoundException('Class not found');
        }

        const updatePayload: Partial<{
            className: string;
            department: string;
            semester: string;
            coverImage: string;
            themeColor: string;
            allowEnroll: boolean;
        }> = {};

        if (dto.className !== undefined) updatePayload.className = dto.className;
        if (dto.department !== undefined) updatePayload.department = dto.department;
        if (dto.semester !== undefined) updatePayload.semester = dto.semester;
        if (dto.coverImage !== undefined) updatePayload.coverImage = dto.coverImage;
        if (dto.themeColor !== undefined) updatePayload.themeColor = dto.themeColor;
        if (dto.allowEnroll !== undefined)
            updatePayload.allowEnroll = dto.allowEnroll;

        await this.classModel
            .findByIdAndUpdate(classId, { $set: updatePayload }, { new: true })
            .exec();

        return {
            success: true,
            message: 'Class updated successfully',
            data: { classId },
        };
    }
}
