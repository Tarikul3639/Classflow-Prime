import { ApiProperty } from '@nestjs/swagger';
import { AgentStatus } from '../../../database/interface/agent.interface';

class AgentScopesDto {
    @ApiProperty({ example: false })
    create!: boolean;

    @ApiProperty({ example: false })
    update!: boolean;

    @ApiProperty({ example: false })
    delete!: boolean;
}

class ClassListItemDto {
    @ApiProperty({ example: '6851fd7f2f7f4b8e11d8f0a1' })
    _id!: string;

    @ApiProperty({ example: 'Physics' })
    name!: string;

    @ApiProperty({ example: true })
    allowed!: boolean;
}

class AgentItemDto {
    @ApiProperty({ example: '6851fd7f2f7f4b8e11d8f0a1' })
    _id!: string;

    @ApiProperty({ example: 'Hermes' })
    name!: string;

    @ApiProperty({ example: 'hat_live' })
    apiKeyPrefix!: string;

    @ApiProperty({ example: 'bcrypt_hashed_api_key' })
    apiKey!: string;

    @ApiProperty({ type: AgentScopesDto })
    scopes!: AgentScopesDto;

    @ApiProperty({ type: [ClassListItemDto] })
    classList!: ClassListItemDto[];

    @ApiProperty({ enum: AgentStatus })
    status!: AgentStatus;

    @ApiProperty({ nullable: true, example: '2026-12-31T23:59:59.000Z' })
    expiresAt?: string | null;
}

class FetchAgentsDataDto {
    @ApiProperty({ type: [AgentItemDto] })
    agents!: AgentItemDto[];
}

export class FetchAgentsResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: 'Agents loaded successfully' })
    message!: string;

    @ApiProperty({ type: FetchAgentsDataDto })
    data!: FetchAgentsDataDto;
}