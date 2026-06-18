// update-class-update.dto.ts

import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

import { CreateClassUpdateRequestDto } from './create-class-update.dto';
import { FetchSingleClassUpdateResponseDto } from './fetch-single-class-update.dto';

export class UpdateClassUpdateRequestDto extends PartialType(
  CreateClassUpdateRequestDto,
) {
  @ApiProperty({
    example: true,
    description: 'Pin or unpin the update',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}

export class UpdateClassUpdateResponseDto extends FetchSingleClassUpdateResponseDto {}