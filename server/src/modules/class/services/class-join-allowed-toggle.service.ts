// class-join-allowed-toggle.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../database/entities/class.entity';
import { ClassStatus} from '../../../database/interface/class.interface';

import { ToggleJoiningAllowedResponseDto } from '../dto/class-settings.dto';

@Injectable()
export class ClassJoinAllowedToggleService {
    constructor(
        @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
    ) {}

    async execute(userId: string, classId: string): Promise<ToggleJoiningAllowedResponseDto> {
        const userObjectId = new Types.ObjectId(userId);
        const classObjectId = new Types.ObjectId(classId);

        // Check if class exists
        const existingClass = await this.classModel.findById(classObjectId);
        if (!existingClass) throw new NotFoundException('Class not found');
        if (!existingClass.instructorId.equals(userObjectId)) {
            throw new ForbiddenException('Only the instructor can toggle joining allowed status');
        }

        const isClassEnded = existingClass.status === ClassStatus.ENDED;
        if (isClassEnded) {
            throw new ForbiddenException('Cannot toggle joining allowed status for an ended class');
        }

        await this.classModel.findByIdAndUpdate(classObjectId, {
            $set: { allowEnroll: !existingClass.allowEnroll },
        });

        return { 
            success: true,
            message: `Joining allowed status toggled successfully. Joining is now ${!existingClass.allowEnroll ? 'enabled' : 'disabled'}.`,

            data: {
                classId,
                isJoiningAllowed: !existingClass.allowEnroll,
            },
         };
    }
}