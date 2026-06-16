import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Agent, AgentDocument } from '../../infrastructure/database/entities/agent.entity';
import { AgentStatus } from '../../infrastructure/database/interface/agent.interface';

@Injectable()
export class AgentGuard implements CanActivate {
  constructor(
    @InjectModel(Agent.name) private agentModel: Model<AgentDocument>,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException();
    }

    // API Key Prefix extraction
    const prefix = apiKey.split('_').slice(0, 2).join('_');

    const agent = await this.agentModel
      .findOne({
        apiKeyPrefix: prefix,
        status: AgentStatus.ACTIVE,
      })
      .select('+apiKeyHash')
      .exec();

    if (!agent) {
      throw new UnauthorizedException();
    }

    // Validate API Key
    const isValid = await agent.compareApiKey(apiKey);
    if (!isValid) {
      throw new UnauthorizedException();
    }

    // Check expiration
    if (agent.isExpired()) {
      throw new UnauthorizedException('Agent expired');
    }

    // Attach agent to request object
    request.agent = agent;
    return true;
  }
}