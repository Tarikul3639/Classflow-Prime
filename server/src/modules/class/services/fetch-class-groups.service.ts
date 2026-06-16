// fetch-class-groups.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Class, ClassDocument } from '../../../infrastructure/database/entities/class.entity';
import { ClassGroup, GroupDocument } from '../../../infrastructure/database/entities/group.entity';
import { GetClassGroupsResponseDto } from '../dto/class-group.dto';

@Injectable()
export class FetchClassGroupsService {
    constructor(
        @InjectModel(Class.name) private readonly classModel: Model<ClassDocument>,
        @InjectModel(ClassGroup.name) private readonly groupModel: Model<GroupDocument>,
    ) { }

    async execute(userId: string, classId: string): Promise<GetClassGroupsResponseDto> {
        const classObjectId = new Types.ObjectId(classId);
        const userObjectId = new Types.ObjectId(userId);

        const existingClass = await this.classModel.findById(classObjectId);
        if (!existingClass) throw new NotFoundException('Class not found');

        const groups = await this.groupModel.find({ classId: classObjectId }).lean();

        return {
            success: true,
            message: 'Groups fetched successfully',
            data: {
                classId,
                groups: groups.map((g) => ({
                    groupId: g._id.toString(),
                    name: g.name,
                    description: g.description,
                    link: g.link,
                    platform: g.platform,
                    uiConfig: g.uiConfig,
                    createdBy: g.createdBy.toString(),
                    createdAt: g.createdAt?.toISOString() ?? new Date().toISOString(),
                    updatedAt: g.updatedAt?.toISOString() ?? new Date().toISOString(),
                })),
            },
        };
    }
}