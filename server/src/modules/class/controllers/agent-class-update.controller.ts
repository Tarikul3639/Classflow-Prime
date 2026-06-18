import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';

import {
    CreateClassUpdateRequestDto,
    CreateClassUpdateResponseDto,
} from '../dto/create-class-update.dto';
import { CreateClassUpdateService } from '../services/updates/create-class-update.service';
import { AgentGuard } from '../guards/agent.guard';
import { AgentPermissionGuard } from '../guards/agent-permission.guard';
import { AgentPermission } from '../decorators/agent-permission.decorator';
import { CurrentAgent } from '../decorators/current-agent.decorator';
import type { AgentDocument } from '../../../infrastructure/database/entities/agent.entity';

@ApiTags('Agent Class Updates')
@ApiSecurity('x-api-key')
@Controller('agent/classes/:classId/updates')
export class AgentClassUpdateController {
    constructor(
        private readonly createClassUpdateService: CreateClassUpdateService,
    ) { }

    @Post()
    @UseGuards(AgentGuard, AgentPermissionGuard)
    @AgentPermission('create')
    @ApiOperation({ summary: 'Create class update using agent API key' })
    @ApiResponse({
        status: 201,
        description: 'Class update created successfully',
        type: CreateClassUpdateResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Invalid API key' })
    @ApiResponse({ status: 403, description: 'Insufficient permissions' })
    async createClassUpdate(
        @CurrentAgent() agent: AgentDocument,
        @Param('classId') classId: string,
        @Body() dto: CreateClassUpdateRequestDto,
    ): Promise<CreateClassUpdateResponseDto> {
        return this.createClassUpdateService.execute(
            classId,
            agent.userId.toString(),
            dto,
        );
    }
}