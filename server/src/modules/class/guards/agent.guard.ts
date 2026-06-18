import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Agent,
  AgentDocument,
} from '../../../infrastructure/database/entities/agent.entity';
import { AgentStatus } from '../../../infrastructure/database/interface/agent.interface';

@Injectable()
export class AgentGuard implements CanActivate {
  constructor(
    @InjectModel(Agent.name)
    private readonly agentModel: Model<AgentDocument>,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest();

    const rawApiKey = request.headers['x-api-key'];
    const apiKey = Array.isArray(rawApiKey) ? rawApiKey[0] : rawApiKey;

    if (!apiKey || typeof apiKey !== 'string') {
      throw new UnauthorizedException('API key is required');
    }

    const prefix = apiKey.split('_').slice(0, 2).join('_');

    const agent = await this.agentModel
      .findOne({
        apiKeyPrefix: prefix,
        status: AgentStatus.ACTIVE,
      })
      .exec();

    if (!agent) {
      throw new UnauthorizedException('API key not found');
    }

    const isValid = await agent.compareApiKey(apiKey);
    if (!isValid) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (agent.isExpired()) {
      throw new UnauthorizedException('Agent expired');
    }

    if (
      request.params?.classId &&
      agent.classId &&
      agent.classId.toString() !== request.params.classId
    ) {
      throw new ForbiddenException('This agent cannot access this class');
    }

    request.agent = {
      _id: agent._id,
      userId: agent.userId,
      classId: agent.classId,
      scopes: agent.scopes,
      status: agent.status,
      expiresAt: agent.expiresAt,
      apiKeyPrefix: agent.apiKeyPrefix,
    };

    return true;
  }
}