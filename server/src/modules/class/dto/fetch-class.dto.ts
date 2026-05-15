import { IsOptional, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FetchClassRequestDto {
  @ApiProperty({
    example: '123',
    description: 'Unique identifier of the class to fetch',
  })
  @IsNotEmpty({ message: 'Class ID is required' })
  @IsString({ message: 'Class ID must be a string' })
  classId!: string;
}

class ClassDetailsDto {
  @ApiProperty({
    example: '123',
    description: 'Unique identifier of the class',
  })
  classId!: string;

  @ApiProperty({
    example: 'Computer Science',
    description: 'Department offering the class',
  })
  department!: string;

  @ApiProperty({
    example: 'Introduction to Programming',
    description: 'Name of the class',
  })
  name!: string;

  @ApiProperty({
    example: 30,
    description:
      'Number of student, assistant and teacher enrolled in the class',
  })
  members!: number;

  @ApiProperty({
    example: 'John Doe',
    description: 'Name of the instructor for the class',
  })
  instructor!: string;

  @ApiProperty({
    example: 'Fall 2024',
    description: 'Semester during which the class is offered',
  })
  semester!: string;

  @ApiProperty({
    example: '#FF5733',
    description: 'Theme color associated with the class in HEX format',
  })
  themeColor!: string;

  @ApiProperty({
    example: 'https://example.com/cover.jpg',
    description: 'URL of the class cover image',
    required: false,
  })
  @IsOptional()
  coverImage?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: "URL of the instructor's avatar image",
    required: false,
  })
  @IsOptional()
  avatarUrl?: string | null;

  @ApiProperty({
    example: 'active',
    description: 'Status of the class (e.g., active, archived)',
  })
  status!: 'active' | 'archived';

  @ApiProperty({
    example: true,
    description: 'Indicates if the current user is the instructor of the class',
  })
  isInstructor!: boolean;

  @ApiProperty({
    example: false,
    description: 'Indicates if the current user is an assistant of the class',
  })
  isAssistant!: boolean;
}

export class FetchClassDataDto {
  @ApiProperty({
    description: 'Detailed information about the class',
  })
  class!: ClassDetailsDto | null;
}

export class FetchClassResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indicates whether the fetch operation was successful',
  })
  success!: boolean;

  @ApiProperty({
    example: 'Class details fetched successfully',
    description:
      'Response message indicating the result of the fetch operation',
  })
  @IsString()
  message!: string;

  @ApiProperty({
    description: 'Data containing the class details',
  })
  data!: FetchClassDataDto;
}