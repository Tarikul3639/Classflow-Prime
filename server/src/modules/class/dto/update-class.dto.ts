import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsHexColor,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateClassRequestDto {
  @ApiPropertyOptional({ example: 'Advanced Computer Science' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  className?: string;

  @ApiPropertyOptional({ example: 'Computer Science' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ example: 'Fall 2026' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  semester?: string;

  @ApiPropertyOptional({ example: 'https://api.dicebear.com/9.x/shapes/svg?seed=abc' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsOptional()
  @IsHexColor()
  themeColor?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  allowEnroll?: boolean;
}

export class UpdateClassResponseDto {
  success!: boolean;
  message?: string;
  data!: {
    classId: string;
  };
}