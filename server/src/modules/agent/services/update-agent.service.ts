import {
    Injectable,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Agent, AgentDocument } from '../../../database/entities/agent.entity';
import { Class, ClassDocument } from '../../../database/entities/class.entity';
import { Enrollment, EnrollmentDocument } from '../../../database/entities/enrollment.entity';
import { UpdateAgentRequestDto } from '../dto/update-agent.dto';

interface IClass {
    _id: Types.ObjectId;
    name: string;
}

@Injectable()
export class UpdateAgentService {
    constructor(
        @InjectModel(Agent.name) private agentModel: Model<AgentDocument>,
        @InjectModel(Class.name) private classModel: Model<ClassDocument>,
        @InjectModel(Enrollment.name) private enrollmentModel: Model<EnrollmentDocument>,
    ) { }

    async execute(userId: string, agentId: string, dto: UpdateAgentRequestDto) {
        const userObjectId = new Types.ObjectId(userId);
        const agent = await this.agentModel.findById(agentId).exec();

        if (!agent) {
            throw new NotFoundException('Agent not found');
        }

        if (agent.userId.toString() !== userId) {
            throw new ForbiddenException('You do not have permission to update this agent');
        }

        // Update fields
        if (dto.name !== undefined) agent.name = dto.name;
        if (dto.scopes !== undefined) agent.scopes = dto.scopes;
        if (dto.allowedClassIds !== undefined) {
            agent.allowedClassIds = dto.allowedClassIds.map((id) => new Types.ObjectId(id));
        }
        if (dto.expiresAt !== undefined) {
            agent.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : undefined;
        }

        await agent.save();

        // Fetch classes and enrollments
        const [instructorClasses, enrollments] = await Promise.all([
            this.classModel.find({ instructorId: userObjectId }).select('_id name').lean().exec(),
            this.enrollmentModel
                .find({ userId: userObjectId })
                .populate<{ classId: IClass }>('classId', '_id name')
                .lean()
                .exec(),
        ]);

        const classMap = new Map<string, { _id: string; name: string }>();

        instructorClasses.forEach((cls) => {
            classMap.set(cls._id.toString(), { _id: cls._id.toString(), name: cls.name });
        });

        enrollments.forEach((enrollment) => {
            const cls = enrollment.classId;
            classMap.set(cls._id.toString(), { _id: cls._id.toString(), name: cls.name });
        });

        const allowedSet = new Set(agent.allowedClassIds.map((id) => id.toString()));

        return {
            success: true,
            message: 'Agent updated successfully',
            data: {
                agent: {
                    _id: agent._id.toString(),
                    name: agent.name,
                    apiKey: agent.apiKey,
                    apiKeyPrefix: agent.apiKeyPrefix,
                    scopes: {
                        create: agent.scopes?.create ?? false,
                        update: agent.scopes?.update ?? false,
                        delete: agent.scopes?.delete ?? false,
                    },
                    classList: Array.from(classMap.values()).map((cls) => ({
                        _id: cls._id,
                        name: cls.name,
                        allowed: allowedSet.has(cls._id),
                    })),
                    status: agent.status,
                    expiresAt: agent.expiresAt ? agent.expiresAt.toISOString() : null,
                },
            },
        };
    }
}