import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    ValidateNested,
    IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

import { IAgentScopes, AgentStatus } from '../../../infrastructure/database/interface/agent.interface';

export class AgentScopesDto implements IAgentScopes {
    @ApiProperty({ example: false })
    @IsBoolean()
    create!: boolean;

    @ApiProperty({ example: false })
    @IsBoolean()
    update!: boolean;

    @ApiProperty({ example: false })
    @IsBoolean()
    delete!: boolean;
}

export class CreateAgentRequestDto {
    @ApiProperty({ example: 'Hermes', description: 'Agent display name' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name!: string;

    @ApiProperty({
        type: AgentScopesDto,
        required: false,
        example: { create: true, update: false, delete: false },
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => AgentScopesDto)
    scopes?: AgentScopesDto;

    @ApiProperty({
        type: [String],
        example: ['6851fd7f2f7f4b8e11d8f0a1', '6851fd7f2f7f4b8e11d8f0a2'],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    allowedClassIds?: string[];

    @ApiProperty({ example: '2027-01-01T00:00:00.000Z', required: false })
    @IsOptional()
    expiresAt?: string;
}

class AgentItemDto {
    @ApiProperty({ example: '6851fd7f2f7f4b8e11d8f0a1' })
    _id!: string;

    @ApiProperty({ example: 'Hermes' })
    name!: string;

    @ApiProperty({ example: 'hat_live' })
    apiKeyPrefix!: string;

    @ApiProperty({ type: AgentScopesDto })
    scopes!: AgentScopesDto;

    @ApiProperty({ type: [String] })
    allowedClassIds!: string[];

    @ApiProperty({ enum: AgentStatus, example: AgentStatus.ACTIVE })
    status!: AgentStatus;

    @ApiProperty({ example: '2027-01-01T00:00:00.000Z', nullable: true })
    expiresAt?: string | null;

    @ApiProperty({
        example: 'hat_live_9f3d8ab72e...',
        description: 'Raw API key. Returned only once during creation.',
    })
    apiKey!: string;
}

class CreateAgentDataDto {
    @ApiProperty({ type: AgentItemDto })
    agent!: AgentItemDto;
}

export class CreateAgentResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: 'Agent created successfully' })
    message!: string;

    @ApiProperty({ type: CreateAgentDataDto })
    data!: CreateAgentDataDto;
}