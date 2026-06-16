// create-class-group.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../infrastructure/database/entities/class.entity';
import { Enrollment, EnrollmentDocument } from '../../../infrastructure/database/entities/enrollment.entity';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';
import { ClassGroup, GroupDocument } from '../../../infrastructure/database/entities/group.entity';
import { CreateClassGroupRequestDto } from '../dto/class-group.dto';
import { ClassStatus } from '../../../infrastructure/database/interface/class.interface';

@Injectable()
export class CreateClassGroupService {
    constructor(
        @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
        @InjectModel(ClassGroup.name) private readonly groupModel: Model<GroupDocument>,
        @InjectModel(Enrollment.name) private readonly enrollmentModel: Model<EnrollmentDocument>,
    ) { }

    async execute(userId: string, classId: string, dto: CreateClassGroupRequestDto) {
        const userObjectId = new Types.ObjectId(userId);
        const classObjectId = new Types.ObjectId(classId);

        // Validate class existence and instructor authorization
        const existingClass = await this.classModel.findById(classObjectId);
        if (!existingClass) throw new NotFoundException('Class not found');

        if (existingClass.status === ClassStatus.ENDED) {
            throw new ForbiddenException('Cannot add groups to an ended class');
        }

        // Find if the user is an assistant for the class
        const isAssistant = await this.enrollmentModel.findOne({ classId: classObjectId, userId: userObjectId, role: EnrollmentRole.ASSISTANT });

        if (!existingClass.instructorId.equals(userObjectId) && !isAssistant) {
            throw new ForbiddenException('Only the instructor can add groups');
        }

        const group = new this.groupModel({
            classId: classObjectId,
            name: dto.name,
            description: dto.description,
            link: dto.link,
            platform: dto.platform,
            uiConfig: dto.uiConfig,
            createdBy: userObjectId,
        });

        await group.save();

        return {
            success: true,
            message: 'Group created successfully',
            data: {
                classId,
                group: {
                    groupId: group._id.toString(),
                    name: group.name,
                    description: group.description,
                    link: group.link,
                    platform: group.platform,
                    uiConfig: group.uiConfig,
                    createdBy: group.createdBy,
                    createdAt: group.createdAt,
                    updatedAt: group.updatedAt,
                },
            },
        };
    }
}