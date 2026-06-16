import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import {
  Agent,
  AgentSchema,
} from '../../infrastructure/database/entities/agent.entity';

import {
  Class,
  ClassSchema,
} from '../../infrastructure/database/entities/class.entity';

import {
  Enrollment,
  EnrollmentSchema,
} from '../../infrastructure/database/entities/enrollment.entity';

import { AgentController } from './controllers/agent.controller';

import { CreateAgentService } from './services/create-agent.service';

import { UpdateAgentService } from './services/update-agent.service';

import { DeleteAgentService } from './services/delete-agent.service';

import { FetchAgentsService } from './services/fetch-agents.service';

import { AgentGuard } from '../../common/guards/agent.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Agent.name,
        schema: AgentSchema,
      },

      {
        name: Class.name,
        schema: ClassSchema,
      },

      {
        name: Enrollment.name,
        schema: EnrollmentSchema,
      },
    ]),
  ],

  controllers: [
    AgentController,
  ],

  providers: [
    CreateAgentService,

    UpdateAgentService,

    DeleteAgentService,

    FetchAgentsService,

    AgentGuard,
  ],

  exports: [
    AgentGuard,
  ],
})
export class AgentModule {}