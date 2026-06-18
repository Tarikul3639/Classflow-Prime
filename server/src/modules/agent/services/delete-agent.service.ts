import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import {
  Model,
  Types,
} from 'mongoose';

import {
  Agent,
  AgentDocument,
} from '../../../infrastructure/database/entities/agent.entity';

@Injectable()
export class DeleteAgentService {
  constructor(
    @InjectModel(Agent.name)
    private readonly agentModel: Model<AgentDocument>,
  ) {}

  async execute(
    userId: string,
    agentId: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {

    if (!Types.ObjectId.isValid(agentId)) {
      throw new BadRequestException('Invalid agent id');
    }

    const agent = await this.agentModel
      .findById(agentId)
      .select('_id userId')
      .lean()
      .exec();

    if (!agent) {
      throw new NotFoundException(
        'Agent not found',
      );
    }

    if (agent.userId.toString() !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this agent',
      );
    }

    await this.agentModel.deleteOne({
      _id: agent._id,
    });

    return {
      success: true,
      message: 'Agent deleted successfully',
    };
  }
}