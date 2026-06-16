import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomBytes } from 'crypto';

import { Agent, AgentDocument } from '../../../infrastructure/database/entities/agent.entity';
import { AgentStatus } from '../../../infrastructure/database/interface/agent.interface';
import { CreateAgentRequestDto, CreateAgentResponseDto } from '../dto/create-agent.dto';

@Injectable()
export class CreateAgentService {
    constructor(
        @InjectModel(Agent.name) private agentModel: Model<AgentDocument>,
    ) { }

    async execute(userId: string, dto: CreateAgentRequestDto): Promise<CreateAgentResponseDto> {
        const rawApiKey = `hat_live_${randomBytes(32).toString('hex')}`;

        const agent = new this.agentModel({
            name: dto.name,
            userId: new Types.ObjectId(userId),
            scopes: dto.scopes ?? {
                create: false,
                update: false,
                delete: false,
            },
            allowedClassIds: (dto.allowedClassIds ?? []).map((id) => new Types.ObjectId(id)),
            status: AgentStatus.ACTIVE,
            expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        });

        await agent.setApiKey(rawApiKey);
        await agent.save();

        return {
            success: true,
            message: 'Agent created successfully',
            data: {
                agent: {
                    _id: agent._id.toString(),
                    name: agent.name,
                    apiKeyPrefix: agent.apiKeyPrefix,
                    scopes: {
                        create: dto.scopes?.create ?? false,
                        update: dto.scopes?.update ?? false,
                        delete: dto.scopes?.delete ?? false,
                    },
                    allowedClassIds: agent.allowedClassIds.map((id) => id.toString()),
                    status: agent.status,
                    expiresAt: agent.expiresAt ? agent.expiresAt.toISOString() : null,
                    apiKey: rawApiKey,
                },
            },
        };
    }
}