import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Class, ClassDocument } from '../../../infrastructure/database/entities/class.entity';
import { ClassStatus } from '../../../infrastructure/database/interface/class.interface';
import { Enrollment, EnrollmentDocument } from '../../../infrastructure/database/entities/enrollment.entity';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';
import {
    ClassUpdate,
    ClassUpdateDocument,
} from '../../../infrastructure/database/entities/update.entity';

import { TogglePinClassUpdateRequestDto, TogglePinClassUpdateResponseDto } from '../dto/toggle-pin-class-update.dto';

@Injectable()
export class TogglePinClassUpdateService {
    constructor(
        @InjectModel(Class.name)
        private readonly classModel: Model<ClassDocument>,
        @InjectModel(ClassUpdate.name)
        private readonly classUpdateModel: Model<ClassUpdateDocument>,
        @InjectModel(Enrollment.name)
        private readonly enrollmentModel: Model<EnrollmentDocument>,
    ) { }

    async execute(
        userId: string,
        classId: string,
        updateId: string,
        dto: TogglePinClassUpdateRequestDto,
    ): Promise<TogglePinClassUpdateResponseDto> {
        const userObjectId = new Types.ObjectId(userId);
        const classObjectId = new Types.ObjectId(classId);
        const updateObjectId = new Types.ObjectId(updateId);

        // Step 1: Check if class exists
        const classData = await this.classModel.findOne({
            _id: classObjectId,
            status: { $ne: ClassStatus.ENDED },
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
            throw new ForbiddenException('You do not have permission to pin/unpin this update');
        }

        // Step 3: Update the pin status
        const update = await this.classUpdateModel.findOneAndUpdate(
            { _id: updateObjectId.toString(), classId: classObjectId },
            { $set: { isPinned: dto.isPinned } },
            { new: true },
        );

        if (!update) {
            throw new NotFoundException('Update not found');
        }

        return {
            success: true,
            message: 'Pin status updated successfully',
            data: {
                update: {
                    updateId: update._id.toString(),
                    isPinned: update.isPinned,
                },
            },
        }

    }
}