import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  MaxLength,
  MinLength,
  IsUrl,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { UpdateCategory } from '../../../infrastructure/database/interface/update.interface';
import { MaterialType } from '../../../infrastructure/database/interface/material.interface';

// ── Constants ──────────────────────────────────────────────
const HTML_DESCRIPTION_EXAMPLE = `
<h1>Topics Covered</h1>
<ol>
  <li>DDA Line Drawing Algorithm</li>
  <li>Bresenham’s Line Drawing Algorithm</li>
</ol>`.trim();

// ── Material DTOs ──────────────────────────────────────────

export class CreateMaterialDto {
  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d1' })
  @IsString()
  @IsOptional()
  _id?: string;

  @ApiProperty({ example: 'https://example.com/syllabus.pdf', description: 'File or link URL' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  @MaxLength(255)
  url!: string;

  @ApiProperty({ example: 'exam-syllabus.pdf', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ enum: MaterialType, example: MaterialType.PDF })
  @IsEnum(MaterialType)
  type!: MaterialType;

  @ApiProperty({ example: 2500000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  size?: number;
}

// ── Request DTO ────────────────────────────────────────────

export class CreateClassUpdateRequestDto {
  @ApiProperty({ enum: UpdateCategory, example: UpdateCategory.ANNOUNCEMENT })
  @IsEnum(UpdateCategory)
  @IsNotEmpty()
  category!: UpdateCategory;

  @ApiProperty({ example: 'Midterm Exam Schedule Revision' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  title!: string;

  @ApiProperty({ example: 'The midterm exam has been moved to Wednesday.' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  description!: string;

  @ApiProperty({ example: '2026-03-15T10:30:00.000Z', required: false })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsDateString()
  eventAt?: string | null;

  @ApiProperty({ type: [CreateMaterialDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMaterialDto)
  materials?: CreateMaterialDto[];
}

// ── Response DTOs ──────────────────────────────────────────

class PostedByDto {
  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d1' })
  _id!: string;
  @ApiProperty({ example: 'Dr. Alan Grant' })
  name!: string;
  @ApiProperty({ example: 'https://example.com/avatar.png', nullable: true })
  avatarUrl!: string | null;
}

class MaterialResponseDto {
  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d1' })
  _id!: string;
  @ApiProperty({ example: 'https://example.com/syllabus.pdf' })
  url!: string;
  @ApiProperty({ example: 'exam-syllabus.pdf', nullable: true })
  name?: string;
  @ApiProperty({ enum: MaterialType })
  type!: MaterialType;
  @ApiProperty({ example: 2500000, nullable: true })
  size?: number;
}

class ClassUpdateItemDto {
  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d1' })
  _id!: string;
  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d1' })
  classId!: string;
  @ApiProperty({ enum: UpdateCategory })
  category!: UpdateCategory;
  @ApiProperty({ example: 'Midterm Exam Schedule Revision' })
  title!: string;
  @ApiProperty({ example: HTML_DESCRIPTION_EXAMPLE, description: 'HTML formatted description' })
  description!: string;
  @ApiProperty({ example: false })
  isPinned!: boolean;
  @ApiProperty({ type: PostedByDto })
  postedBy!: PostedByDto;
  @ApiProperty({ example: '2026-03-15T10:30:00.000Z', nullable: true })
  eventAt!: string | null;
  @ApiProperty({ example: '2026-03-24T08:00:00.000Z' })
  createdAt!: string;
  @ApiProperty({ type: [MaterialResponseDto], required: false })
  materials?: MaterialResponseDto[];
}

// 1. Defined a class to handle the nested "data" property
export class CreateClassUpdateDataDto {
  @ApiProperty({ type: ClassUpdateItemDto })
  update!: ClassUpdateItemDto;
}

// 2. Used the class above as the type
export class CreateClassUpdateResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;
  @ApiProperty({ example: 'Update created successfully' })
  message!: string;
  @ApiProperty({ type: CreateClassUpdateDataDto })
  data!: CreateClassUpdateDataDto;
}