import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomBytes } from 'crypto';

import { Agent, AgentDocument } from '../../../infrastructure/database/entities/agent.entity';
import { AgentStatus } from '../../../infrastructure/database/interface/agent.interface';
import { Enrollment, EnrollmentDocument } from '../../../infrastructure/database/entities/enrollment.entity';
import { EnrollmentRole } from '../../../infrastructure/database/interface/enrollment.interface';
import { ClassStatus } from '../../../infrastructure/database/interface/class.interface';
import { CreateAgentRequestDto, CreateAgentResponseDto } from '../dto/create-agent.dto';

@Injectable()
export class CreateAgentService {
  constructor(
    @InjectModel(Agent.name) private readonly agentModel: Model<AgentDocument>,
    @InjectModel(Enrollment.name) private readonly enrollmentModel: Model<EnrollmentDocument>,
  ) { }

  async execute(userId: string, dto: CreateAgentRequestDto): Promise<CreateAgentResponseDto> {
    const classObjectId = new Types.ObjectId(dto.classId);
    const userObjectId = new Types.ObjectId(userId);

    // 1. Validate User Access & Class Status
    const enrollment = await this.enrollmentModel
      .findOne({
        userId: userObjectId,
        classId: classObjectId,
        role: { $in: [EnrollmentRole.INSTRUCTOR, EnrollmentRole.ASSISTANT] },
      })
      .populate<{ classId: { _id: Types.ObjectId; className: string } }>({
        path: 'classId',
        select: '_id className status',
        match: { status: ClassStatus.ACTIVE },
      })
      .exec();

    if (!enrollment || !enrollment.classId) {
      throw new ForbiddenException('You are not allowed to create an agent for this class');
    }

    // 2. Generate API Key and Save Agent
    const rawApiKey = `hat_live_${randomBytes(32).toString('hex')}`;

    const agent = new this.agentModel({
      name: dto.name,
      userId: userObjectId,
      classId: classObjectId,
      scopes: dto.scopes ?? { create: false, update: false, delete: false },
      status: AgentStatus.ACTIVE,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });

    agent.setApiKey(rawApiKey);
    await agent.save();

    // 3. Return Response
    return {
      success: true,
      message: 'Agent created successfully',
      data: {
        agent: {
          _id: agent._id.toString(),
          name: agent.name,
          class: {
            _id: enrollment.classId._id.toString(),
            className: enrollment.classId.className,
          },
          apiKeyPrefix: agent.apiKeyPrefix,
          scopes: {
            create: agent.scopes.create,
            update: agent.scopes.update,
            delete: agent.scopes.delete,
          },
          status: agent.status,
          expiresAt: agent.expiresAt ? agent.expiresAt.toISOString() : null,
          createdAt: agent.createdAt.toISOString(),
          updatedAt: agent.updatedAt.toISOString(),
          apiKey: rawApiKey,
        },
      },
    };
  }
}