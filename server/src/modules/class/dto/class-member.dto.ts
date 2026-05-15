import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { EnrollmentRole } from '../../../database/interface/enrollment.interface';

// ─── Response Class members DTO ─────────────────────────────────────────────────────────────

export class ClassMemberDto {
  @ApiProperty({ example: '12345', description: 'Unique identifier of the member' })
  @IsString()
  @IsNotEmpty({ message: 'Member ID is required' })
  userId!: string;

  @ApiProperty({ example: 'Dr. John Doe', description: 'Full name of the member' })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(3, { message: 'Name must be at least 3 characters' })
  @MaxLength(100, { message: 'Name must be at most 100 characters' })
  name!: string;

  @ApiProperty({ example: 'example@gmail.com', description: 'Email address of the member' })
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @ApiProperty({ example: 'https://example.com/avatar.png', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Avatar URL must be at most 255 characters' })
  avatarUrl?: string;

  @ApiProperty({
    example: 'instructor',
    description: 'Role of the member in the class',
    enum: EnrollmentRole,
  })
  @IsNotEmpty({ message: 'Role is required' })
  role!: EnrollmentRole;

  @ApiProperty({ example: true, description: 'Whether the member is verified' })
  @IsOptional()
  verified?: boolean;
}

export class GetClassMembersResponseDto {
  @ApiProperty({ example: '12345', description: 'Unique identifier of the class' })
  @IsString()
  @IsNotEmpty({ message: 'Class ID is required' })
  classId!: string;

  @ApiProperty({ type: [ClassMemberDto], description: 'List of class members' })
  members!: ClassMemberDto[];
}

export class GetClassMembersResponseWrapperDto {
  @ApiProperty({ example: true, description: 'Indicates if the request was successful' })
  success!: boolean;

  @ApiProperty({ example: 'Members fetched successfully', description: 'Response message' })
  message!: string;

  @ApiProperty({
    type: GetClassMembersResponseDto,
    description: 'Data containing class members',
  })
  data!: GetClassMembersResponseDto;
}

export class AssignAssistantRequestDto {
  @ApiProperty({
    example: '12345',
    description: 'Unique identifier of the member to be assigned as assistant',
  })
  @IsString()
  @IsNotEmpty({ message: 'User ID is required' })
  userId!: string;
}

export class AssignAssistantResponseDto {
  @ApiProperty({ example: true, description: 'Indicates if the assistant was assigned successfully' })
  success!: boolean;

  @ApiProperty({ example: 'Assistant assigned successfully', description: 'Response message' })
  message!: string;

  @ApiProperty({
    description: 'Data containing the user ID of the assigned assistant',
    example: { userId: '12345' },
  })
  data!: {
    userId: string;
  };
}

export class RevokeAssistantRequestDto {
  @ApiProperty({
    example: '12345',
    description: 'Unique identifier of the member to have assistant role revoked',
  })
  @IsString()
  @IsNotEmpty({ message: 'User ID is required' })
  userId!: string;
}

export class RevokeAssistantResponseDto {
  @ApiProperty({ example: true, description: 'Indicates if the assistant was revoked successfully' })
  success!: boolean;

  @ApiProperty({ example: 'Assistant revoked successfully', description: 'Response message' })
  message!: string;

  @ApiProperty({
    description: 'Data containing the user ID of the revoked assistant',
    example: { userId: '12345' },
  })
  data!: {
    userId: string;
  };
}

export class RevokeMemberResponseDto {
  @ApiProperty({ example: true, description: 'Indicates if the member was revoked successfully' })
  success!: boolean;

  @ApiProperty({ example: 'Member revoked successfully', description: 'Response message' })
  message!: string;

  @ApiProperty({
    description: 'Data containing the user ID of the revoked member',
    example: { userId: '12345' },
  })
  data!: {
    userId: string;
  };
}