import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  IsUrl,
  IsInt,
} from 'class-validator';
import { UpdateCategory } from '../../../infrastructure/database/interface/update.interface';

/**
 * Request DTO for fetching updates by Class ID
 */
export class FetchClassUpdateRequestDto {
  @ApiProperty({
    example: 'c456',
    description: 'Class ID to fetch updates for',
  })
  @IsNotEmpty()
  @IsString()
  classId!: string;
}

/**
 * DTO for the user who posted the update
 */
class PostedByDto {
  @ApiProperty({ example: 'u123', description: 'Unique ID of the user' })
  _id!: string;

  @ApiProperty({ example: 'Ariful Islam', description: 'Name of the user' })
  name!: string;

  @ApiProperty({
    example: 'https://cdn.example.com/avatar.jpg',
    required: false,
  })
  avatarUrl!: string | null;
}

/**
 * DTO for update engagement metrics
 */
class UpdateEngagementDto {
  @ApiProperty({
    type: [String],
    example: ['url1', 'url2'],
    description: 'List of avatar URLs of commenter',
  })
  avatars!: string[];

  @ApiProperty({ example: 5, description: 'Number of comments' })
  @IsInt()
  commentCount!: number;
}

/**
 * DTO for materials in an update
 */
class MaterialDto {
  @ApiProperty({ example: 'a456', description: 'Unique ID of the material' })
  _id!: string;

  @ApiProperty({ example: 'Lecture_Notes.pdf' })
  name!: string;

  @ApiProperty({ example: '2.5 MB' })
  size!: string;

  @ApiProperty({ example: 'https://storage.example.com/file.pdf' })
  @IsUrl()
  url!: string;

  @ApiProperty({ example: 'pdf' })
  type!: string;
}

/**
 * Main Class Update Item DTO
 */
export class ClassUpdateItemDto {
  @ApiProperty({ example: 'up123' })
  _id!: string;

  @ApiProperty({ example: 'c456' })
  classId!: string;

  @ApiProperty({ enum: UpdateCategory, example: 'exam' })
  category!: UpdateCategory;

  @ApiProperty({ example: 'Midterm Exam Schedule' })
  title!: string;

  @ApiProperty({ example: 'Please be advised the exam is moved to Wednesday.' })
  description!: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isPinned!: boolean;

  @ApiProperty({ type: PostedByDto })
  postedBy!: PostedByDto;

  @ApiProperty({ example: '2026-03-24T05:43:38Z', required: false })
  eventAt!: string | null;

  @ApiProperty({ example: '2026-03-24T05:00:00Z' })
  @IsString()
  createdAt!: string;

  @ApiProperty({ example: '2026-03-24T05:43:38Z' })
  @IsString()
  updatedAt!: string;

  @ApiProperty({ type: [MaterialDto], required: false })
  @IsOptional()
  @IsArray()
  materials?: MaterialDto[];

  @ApiProperty({ type: UpdateEngagementDto, required: false })
  @IsOptional()
  engagement?: UpdateEngagementDto;
}

/**
 * Data Payload DTO
 */
export class FetchClassUpdateDataDto {
  @ApiProperty({
    type: [ClassUpdateItemDto],
    description: 'List of updates for the class',
  })
  update!: ClassUpdateItemDto[];
}

/**
 * Final Response DTO
 */
export class FetchClassUpdateResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Class updates fetched successfully' })
  message!: string;

  @ApiProperty({ type: FetchClassUpdateDataDto })
  data!: FetchClassUpdateDataDto;
}