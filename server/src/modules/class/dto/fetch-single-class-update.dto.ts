import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsArray,
  IsUrl,
  IsInt,
  IsDate,
  ValidateNested,
} from 'class-validator';
import { UpdateCategory } from '../../../database/interface/update.interface';

/**
 * DTO for the user who posted the update (Reuse the same logic)
 */
class PostedByDto {
  @ApiProperty({ example: 'u123' })
  @IsString()
  _id!: string;

  @ApiProperty({ example: 'Ariful Islam' })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'https://cdn.example.com/avatar.jpg',
    required: false,
    nullable: true,
  })
  @IsOptional()
  avatarUrl!: string | null;
}

/**
 * DTO for update engagement metrics
 */
class UpdateEngagementDto {
  @ApiProperty({ type: [String], example: ['url1', 'url2'] })
  @IsArray()
  avatars!: string[];

  @ApiProperty({ example: 5 })
  @IsInt()
  commentCount!: number;
}

/**
 * DTO for materials/materials in an update
 */
class MaterialDto {
  @ApiProperty({ example: 'm789' })
  @IsString()
  _id!: string;

  @ApiProperty({ example: 'Lecture_Notes.pdf' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 2500000, description: 'Size in bytes' })
  @IsInt()
  size!: number;

  @ApiProperty({ example: 'https://storage.example.com/file.pdf' })
  @IsUrl()
  url!: string;

  @ApiProperty({ example: 'pdf' })
  @IsString()
  type!: string;
}

/**
 * Main Class Update Item DTO
 */
export class ClassUpdateItemDto {
  @ApiProperty({ example: 'up123' })
  @IsString()
  _id!: string;

  @ApiProperty({ example: 'c456' })
  @IsString()
  classId!: string;

  @ApiProperty({ enum: UpdateCategory, example: 'exam' })
  @IsEnum(UpdateCategory)
  category!: UpdateCategory;

  @ApiProperty({ example: 'Midterm Exam Schedule' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Please be advised the exam is moved to Wednesday.' })
  @IsString()
  description!: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isPinned!: boolean;

  @ApiProperty({ type: PostedByDto })
  @ValidateNested()
  @Type(() => PostedByDto)
  postedBy!: PostedByDto;

  @ApiProperty({
    type: Date,
    example: '2026-03-24T05:43:38Z',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  eventAt!: Date | null;

  @ApiProperty({ type: Date, example: '2026-03-24T05:00:00Z' })
  @IsDate()
  @Type(() => Date)
  createdAt!: Date;

  @ApiProperty({ type: Date, example: '2026-03-24T06:00:00Z', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updatedAt?: Date;

  @ApiProperty({ type: [MaterialDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialDto)
  materials?: MaterialDto[];

  @ApiProperty({ type: UpdateEngagementDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateEngagementDto)
  engagement?: UpdateEngagementDto;
}

/**
 * Data Payload DTO (Single Update Object)
 */
export class FetchSingleClassUpdateDataDto {
  @ApiProperty({
    type: ClassUpdateItemDto,
    description: 'Single class update details',
  })
  @ValidateNested()
  @Type(() => ClassUpdateItemDto)
  update!: ClassUpdateItemDto;
}

/**
 * Final Response DTO for Fetch by ID
 */
export class FetchSingleClassUpdateResponseDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  success!: boolean;

  @ApiProperty({ example: 'Class update fetched successfully' })
  @IsString()
  message!: string;

  @ApiProperty({ type: FetchSingleClassUpdateDataDto })
  @ValidateNested()
  @Type(() => FetchSingleClassUpdateDataDto)
  data!: FetchSingleClassUpdateDataDto;
}