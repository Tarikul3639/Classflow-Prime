import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Agent, AgentDocument } from '../../../database/entities/agent.entity';
import { Class, ClassDocument } from '../../../database/entities/class.entity';
import { Enrollment, EnrollmentDocument } from '../../../database/entities/enrollment.entity';
import { FetchAgentsResponseDto } from '../dto/fetch-agents.dto';

interface IClass {
    _id: Types.ObjectId;
    name: string;
}

@Injectable()
export class FetchAgentsService {
    constructor(
        @InjectModel(Agent.name) private agentModel: Model<AgentDocument>,
        @InjectModel(Class.name) private classModel: Model<ClassDocument>,
        @InjectModel(Enrollment.name) private enrollmentModel: Model<EnrollmentDocument>,
    ) {}

    async execute(userId: string): Promise<FetchAgentsResponseDto> {
        const userObjectId = new Types.ObjectId(userId);

        const [agents, instructorClasses, enrollments] = await Promise.all([
            this.agentModel
                .find({ userId: userObjectId })
                .sort({ createdAt: -1 })
                .lean()
                .exec(),
            this.classModel
                .find({ instructorId: userObjectId })
                .select('_id name')
                .lean()
                .exec(),
            this.enrollmentModel
                .find({ userId: userObjectId })
                .populate<{ classId: IClass }>('classId', '_id name')
                .lean()
                .exec(),
        ]);

        const classMap = new Map<string, { _id: string; name: string }>();

        // Instructor classes
        for (const cls of instructorClasses) {
            classMap.set(cls._id.toString(), {
                _id: cls._id.toString(),
                name: cls.name,
            });
        }

        // Enrolled classes
        for (const enrollment of enrollments) {
            const cls = enrollment.classId;
            classMap.set(cls._id.toString(), {
                _id: cls._id.toString(),
                name: cls.name,
            });
        }

        return {
            success: true,
            message: 'Agents loaded successfully',
            data: {
                agents: agents.map((agent) => {
                    const allowedSet = new Set(
                        agent.allowedClassIds.map((id) => id.toString())
                    );

                    return {
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
                    };
                }),
            },
        };
    }
}