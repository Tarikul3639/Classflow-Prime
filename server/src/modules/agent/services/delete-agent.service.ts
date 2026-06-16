import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Agent, AgentDocument } from '../../../infrastructure/database/entities/agent.entity';

@Injectable()
export class DeleteAgentService {
  constructor(
    @InjectModel(Agent.name)
    private readonly agentModel: Model<AgentDocument>,
  ) {}

  async execute(userId: string, agentId: string) {
    const agent = await this.agentModel
      .findById(agentId)
      .select('userId')
      .lean()
      .exec();

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    if (agent.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have permission to delete this agent');
    }

    await this.agentModel.findByIdAndDelete(agentId).exec();

    return {
      success: true,
      message: 'Agent deleted successfully',
    };
  }
}