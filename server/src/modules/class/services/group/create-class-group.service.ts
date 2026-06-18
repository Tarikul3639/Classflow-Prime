// create-class-group.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { ClassGroup, GroupDocument } from '../../../../infrastructure/database/entities/group.entity';
import { CreateClassGroupRequestDto } from '../../dto/class-group.dto';

@Injectable()
export class CreateClassGroupService {
    constructor(
        @InjectModel(ClassGroup.name) private readonly groupModel: Model<GroupDocument>,
    ) { }

    async execute(userId: string, classId: string, dto: CreateClassGroupRequestDto) {
        const userObjectId = new Types.ObjectId(userId);
        const classObjectId = new Types.ObjectId(classId);

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