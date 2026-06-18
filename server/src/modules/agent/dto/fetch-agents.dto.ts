import { ApiProperty } from '@nestjs/swagger';

import {
  AgentStatus,
} from '../../../infrastructure/database/interface/agent.interface';

class AgentScopesDto {
  @ApiProperty({
    example: false,
  })
  create!: boolean;

  @ApiProperty({
    example: false,
  })
  update!: boolean;

  @ApiProperty({
    example: false,
  })
  delete!: boolean;
}

export class AgentClassDto {
  @ApiProperty({
    example: '6851fd7f2f7f4b8e11d8f0a1',
  })
  _id!: string;

  @ApiProperty({
    example: 'Physics',
  })
  className!: string;
}

export class AgentItemDto {
  @ApiProperty({
    example: '6851fd7f2f7f4b8e11d8f0a1',
  })
  _id!: string;

  @ApiProperty({
    example: 'Hermes',
  })
  name!: string;

  @ApiProperty({
    example: 'hat_live',
  })
  apiKeyPrefix!: string;

  @ApiProperty({
    type: AgentScopesDto,
  })
  scopes!: AgentScopesDto;

  @ApiProperty({
    type: AgentClassDto,
    nullable: true,
  })
  class!: AgentClassDto | null;

  @ApiProperty({
    enum: AgentStatus,
    example: AgentStatus.ACTIVE,
  })
  status!: AgentStatus;

  @ApiProperty({
    nullable: true,
    example: '2026-12-31T23:59:59.000Z',
  })
  expiresAt?: string | null;

  @ApiProperty({
    nullable: true,
    example: '2026-06-19T18:30:00.000Z',
  })
  updatedAt?: string | null;

  @ApiProperty({
    example: '2026-06-19T18:30:00.000Z',
  })
  createdAt!: string;
}

class FetchAgentsDataDto {
  @ApiProperty({
    type: [AgentItemDto],
  })
  agents!: AgentItemDto[];
}

export class FetchAgentsResponseDto {
  @ApiProperty({
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    example: 'Agents loaded successfully',
  })
  message!: string;

  @ApiProperty({
    type: FetchAgentsDataDto,
  })
  data!: FetchAgentsDataDto;
}