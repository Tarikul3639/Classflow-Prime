import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for creating a new class
 * Includes validation rules and API documentation for each field
 */
export class CreateClassRequestDto {
  @ApiProperty({
    example: 'Math 101',
    description: 'Name of the class',
  })
  @IsString()
  @IsNotEmpty({ message: 'Class name is required' })
  @MinLength(3, { message: 'Class name must be at least 3 characters' })
  @MaxLength(30, { message: 'Class name must be at most 30 characters' })
  className!: string;

  @ApiProperty({
    example: 'Computer Science',
    description: 'Department offering the class',
  })
  @IsString()
  @IsNotEmpty({ message: 'Department is required' })
  @MinLength(2, { message: 'Department must be at least 2 characters' })
  @MaxLength(30, { message: 'Department must be at most 30 characters' })
  department!: string;

  @ApiProperty({
    example: 'Fall 2024',
    description: 'Semester for the class',
  })
  @IsString()
  @IsNotEmpty({ message: 'Semester is required' })
  @MinLength(2, { message: 'Semester must be at least 2 characters' })
  @MaxLength(10, { message: 'Semester must be at most 10 characters' })
  semester!: string;

  @ApiProperty({
    example: 'https://example.com/cover-image.png',
    description: 'URL for the class cover image',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Cover image URL must be at most 255 characters' })
  coverImage?: string;

  @ApiProperty({
    example: '#3B82F6',
    description: 'Hex code for the class theme color',
  })
  @IsOptional()
  @IsString()
  @MaxLength(7, { message: 'Theme color must be a valid hex code' })
  @Transform(({ value }) => value?.trim())
  themeColor?: string;

  @ApiProperty({
    example: true,
    description:
      'Whether to allow students to enroll the class without approval',
  })
  @IsOptional()
  allowEnroll?: boolean;
}

/**
 * Response DTO for class creation
 * Includes a success message and the ID of the newly created class
 */

class CreateClassDataDto {
  @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d1' })
  classId!: string;
}

export class CreateClassResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Class created successfully' })
  message!: string;

  @ApiProperty({ type: CreateClassDataDto })
  data!: CreateClassDataDto;
}