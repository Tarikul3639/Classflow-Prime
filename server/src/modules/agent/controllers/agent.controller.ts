import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { IJwtPayload } from '../../auth/interfaces/jwt-payload.interface';

import { CreateAgentRequestDto, CreateAgentResponseDto } from '../dto/create-agent.dto';
import { UpdateAgentRequestDto } from '../dto/update-agent.dto';

import { CreateAgentService } from '../services/create-agent.service';
import { UpdateAgentService } from '../services/update-agent.service';
import { DeleteAgentService } from '../services/delete-agent.service';
import { FetchAgentsService } from '../services/fetch-agents.service';

@ApiTags('Agent')
@Controller('agents')
export class AgentController {
    constructor(
        private readonly createAgentService: CreateAgentService,
        private readonly updateAgentService: UpdateAgentService,
        private readonly deleteAgentService: DeleteAgentService,
        private readonly fetchAgentsService: FetchAgentsService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Fetch all AI agents' })
    @ApiResponse({ status: 200, description: 'Agents fetched successfully' })
    async fetch(
        @CurrentUser() user: IJwtPayload,
    ) {
        return this.fetchAgentsService.execute(user.userId.toString());
    }

    @Post()
    @ApiOperation({ summary: 'Create a new AI agent' })
    @ApiResponse({ status: 201, description: 'Agent created successfully' })
    async create(
        @CurrentUser() user: IJwtPayload,
        @Body() dto: CreateAgentRequestDto,
    ): Promise<CreateAgentResponseDto> {
        return this.createAgentService.execute(user.userId.toString(), dto);
    }

    @Patch(':agentId')
    @ApiOperation({ summary: 'Update an AI agent' })
    @ApiResponse({ status: 200, description: 'Agent updated successfully' })
    async update(
        @CurrentUser() user: IJwtPayload,
        @Param('agentId') agentId: string,
        @Body() dto: UpdateAgentRequestDto,
    ) {
        return this.updateAgentService.execute(user.userId.toString(), agentId, dto);
    }

    @Delete(':agentId')
    @ApiOperation({ summary: 'Revoke an AI agent' })
    @ApiResponse({ status: 200, description: 'Agent revoked successfully' })
    async delete(
        @CurrentUser() user: IJwtPayload,
        @Param('agentId') agentId: string,
    ) {
        return this.deleteAgentService.execute(user.userId.toString(), agentId);
    }
}