import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
    Agent,
    AgentDocument,
} from '../../../infrastructure/database/entities/agent.entity';
import {
    FetchAgentsResponseDto,
    AgentItemDto,
    AgentClassDto,
} from '../dto/fetch-agents.dto';

@Injectable()
export class FetchAgentsService {
    constructor(
        @InjectModel(Agent.name)
        private readonly agentModel: Model<AgentDocument>,
    ) { }

    async execute(userId: string): Promise<FetchAgentsResponseDto> {
        // 1. Fetch agents associated with the user
        const agents = await this.agentModel
            .find({
                userId: new Types.ObjectId(userId),
            })
            .populate<{ classId: AgentClassDto }>({
                path: 'classId',
                select: '_id className',
            })
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        const responseAgents: AgentItemDto[] = agents.map((agent) => ({
            _id: agent._id.toString(),
            name: agent.name,
            apiKey: agent.apiKey,
            apiKeyPrefix: agent.apiKeyPrefix,
            scopes: {
                create: agent.scopes?.create ?? false,
                update: agent.scopes?.update ?? false,
                delete: agent.scopes?.delete ?? false,
            },
            class: {
                _id: agent.classId?._id.toString() ?? null,
                className: agent.classId?.className ?? null,
            },
            status: agent.status,
            expiresAt: agent.expiresAt ? agent.expiresAt.toISOString() : null,
            createdAt: agent.createdAt.toISOString(),
            updatedAt: agent.updatedAt.toISOString(),
        }));

        // 2. Map agents to the response DTO
        return {
            success: true,
            message: 'Agents loaded successfully',
            data: {
                agents: responseAgents,
            },
        };
    }
}
