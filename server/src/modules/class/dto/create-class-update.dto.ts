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
import { UpdateCategory } from '../../../database/interface/update.interface';
import { MaterialType } from '../../../database/interface/material.interface';

// ==================== Material DTO ====================

export class CreateMaterialDto {
  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d1' })
  @IsString()
  @IsOptional()
  _id?: string;

  @ApiProperty({
    example: 'https://example.com/syllabus.pdf',
    description: 'File or link URL',
  })
  @IsString()
  @IsNotEmpty({ message: 'URL is required' })
  @IsUrl({}, { message: 'URL must be a valid URL' })
  @MaxLength(255, { message: 'URL must be at most 255 characters' })
  url!: string;

  @ApiProperty({
    example: 'exam-syllabus.pdf',
    description: 'Original file name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'File name must be at most 100 characters' })
  name?: string;

  @ApiProperty({
    enum: MaterialType,
    example: MaterialType.PDF,
    description: 'Type of material',
  })
  @IsEnum(MaterialType, { message: 'Invalid material type' })
  type!: MaterialType;

  @ApiProperty({
    example: 2500000,
    description: 'File size in bytes',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Size must be a number' })
  @Min(0, { message: 'Size must be a positive number' })
  size?: number;
}

// ==================== Request DTO ====================

export class CreateClassUpdateRequestDto {
  @ApiProperty({
    enum: UpdateCategory,
    example: UpdateCategory.ANNOUNCEMENT,
    description: 'Category of the update',
  })
  @IsEnum(UpdateCategory, { message: 'Invalid update category' })
  @IsNotEmpty({ message: 'Category is required' })
  category!: UpdateCategory;

  @ApiProperty({
    example: 'Midterm Exam Schedule Revision',
    description: 'Title of the update',
  })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  @MaxLength(100, { message: 'Title must be at most 100 characters' })
  title!: string;

  @ApiProperty({
    example: 'The midterm exam has been moved to Wednesday.',
    description: 'Detailed description of the update',
  })
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  @MinLength(10, { message: 'Description must be at least 10 characters' })
  @MaxLength(2000, { message: 'Description must be at most 2000 characters' })
  description!: string;

  @ApiProperty({
    example: '2026-03-15T10:30:00.000Z',
    description: 'Scheduled event time (optional)',
    required: false,
  })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsDateString({}, { message: 'eventAt must be a valid ISO date string' })
  eventAt?: string | null;

  @ApiProperty({
    type: [CreateMaterialDto],
    required: false,
    description: 'Attached materials (files, links)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMaterialDto)
  materials?: CreateMaterialDto[];
}

// ==================== Response DTOs ====================

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

  @ApiProperty({ example: 'The midterm exam has been moved to Wednesday.' })
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

class CreateClassUpdateDataDto {
  @ApiProperty({ type: ClassUpdateItemDto })
  update!: ClassUpdateItemDto;
}

export class CreateClassUpdateResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Update created successfully' })
  message!: string;

  @ApiProperty({ type: CreateClassUpdateDataDto })
  data!: CreateClassUpdateDataDto;
}