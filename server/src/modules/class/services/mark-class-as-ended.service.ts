// mark-class-as-ended.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../infrastructure/database/entities/class.entity';
import { ClassStatus} from '../../../infrastructure/database/interface/class.interface';
import { MarkClassAsEndedResponseDto } from '../dto/class-settings.dto';

@Injectable()
export class MarkClassAsEndedService {
    constructor(
        @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
    ) {}

    async execute(userId: string, classId: string): Promise<MarkClassAsEndedResponseDto> {
        const userObjectId = new Types.ObjectId(userId);
        const classObjectId = new Types.ObjectId(classId);

        // Check if class exists
        const existingClass = await this.classModel.findById(classObjectId);
        if (!existingClass) throw new NotFoundException('Class not found');

        if (!existingClass.instructorId.equals(userObjectId)) {
            throw new ForbiddenException('Only the instructor can mark this class as ended');
        }

        await this.classModel.findByIdAndUpdate(classObjectId, {
            $set: { status: ClassStatus.ENDED },
        });

        return {
            success: true,
            message: 'Class marked as ended.',
            data: {
                classId,
                isEnded: true,
            },
        };
    }
}