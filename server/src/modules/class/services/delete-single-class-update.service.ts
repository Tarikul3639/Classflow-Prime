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

import { DeleteSingleClassUpdateResponseDto } from '../dto/delete-single-class-update.dto';

@Injectable()
export class DeleteSingleClassUpdateService {
    constructor(
        @InjectModel(Class.name)
        private readonly classModel: Model<ClassDocument>,
        @InjectModel(Enrollment.name)
        private readonly enrollmentModel: Model<EnrollmentDocument>,
        @InjectModel(ClassUpdate.name)
        private readonly classUpdateModel: Model<ClassUpdateDocument>,
    ) { }

    async execute(
        userId: string,
        classId: string,
        updateId: string,
    ): Promise<DeleteSingleClassUpdateResponseDto> {
        const userObjectId = new Types.ObjectId(userId);
        const classObjectId = new Types.ObjectId(classId);
        const updateObjectId = new Types.ObjectId(updateId);

        // Step 1: Check if class exists
        const classData = await this.classModel.findOne({
            _id: classObjectId.toString(),
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
            throw new ForbiddenException('You do not have permission to delete this update');
        }

        // Step 3: Delete the update
        const deleteResult = await this.classUpdateModel.deleteOne({
            _id: updateObjectId.toString(),
            classId: classObjectId,
        });

        if (deleteResult.deletedCount === 0) {
            throw new NotFoundException('Update not found or already deleted');
        }

        return {
            success: true,
            message: 'Class update deleted successfully',
            data: {
                updateId: updateId,
            },
        };
    }
}