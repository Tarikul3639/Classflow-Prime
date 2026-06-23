import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export class CreateClassFacultyRequestDto {
    @ApiProperty({ example: 'Dr. John Doe', description: 'Full name of the faculty' })
    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    @MinLength(3, { message: 'Name must be at least 3 characters' })
    @MaxLength(100, { message: 'Name must be at most 100 characters' })
    name!: string;

    @ApiProperty({ example: 'Professor', description: 'Designation of the faculty' })
    @IsString()
    @IsNotEmpty({ message: 'Designation is required' })
    @MaxLength(100, { message: 'Designation must be at most 100 characters' })
    designation!: string;

    @ApiProperty({ example: 'Room 204, Building A', description: 'Office location' })
    @IsString()
    @IsNotEmpty({ message: 'Location is required' })
    @MaxLength(255, { message: 'Location must be at most 255 characters' })
    location!: string;

    @ApiProperty({ example: 'john.doe@university.edu', description: 'Faculty email' })
    @IsEmail({}, { message: 'Invalid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email!: string;

    @ApiProperty({ example: 'https://example.com/avatar.png', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255, { message: 'Avatar URL must be at most 255 characters' })
    avatarUrl?: string;

    @ApiProperty({ example: '+8801700000000', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(20, { message: 'Phone must be at most 20 characters' })
    phone?: string;

    @ApiProperty({ example: 'CSE-101', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(50, { message: 'Classroom code must be at most 50 characters' })
    classroomCode?: string;

    @ApiProperty({ example: 'https://classroom.example.com/invite/abc123', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255, { message: 'Invite link must be at most 255 characters' })
    classroomInviteLink?: string;
}

export class UpdateSingleClassFacultyRequestDto {
    @ApiProperty({ example: 'Dr. Jane Doe', required: false })
    @IsOptional()
    @IsString()
    @MinLength(3, { message: 'Name must be at least 3 characters' })
    @MaxLength(100, { message: 'Name must be at most 100 characters' })
    name?: string;

    @ApiProperty({ example: 'Associate Professor', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    designation?: string;

    @ApiProperty({ example: 'Room 301, Building B', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    location?: string;

    @ApiProperty({ example: 'jane.doe@university.edu', required: false })
    @IsOptional()
    @IsEmail({}, { message: 'Invalid email address' })
    email?: string;

    @ApiProperty({ example: 'https://example.com/new-avatar.png', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    avatarUrl?: string;

    @ApiProperty({ example: '+8801711111111', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone?: string;

    @ApiProperty({ example: 'CSE-202', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    classroomCode?: string;

    @ApiProperty({ example: 'https://classroom.example.com/invite/abc123', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255, { message: 'Invite link must be at most 255 characters' })
    classroomInviteLink?: string;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

class FacultyDataDto {
    @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d1' })
    facultyId!: string;

    @ApiProperty({ example: 'Dr. John Doe' })
    name!: string;

    @ApiProperty({ example: 'https://example.com/avatar.png', required: false })
    avatarUrl?: string;

    @ApiProperty({ example: 'Professor' })
    designation!: string;

    @ApiProperty({ example: 'Room 204, Building A' })
    location!: string;

    @ApiProperty({ example: 'john.doe@university.edu' })
    email!: string;

    @ApiProperty({ example: '+8801700000000', required: false })
    phone?: string;

    @ApiProperty({ example: 'CSE-101', required: false })
    classroomCode?: string;

    @ApiProperty({ example: 'https://classroom.example.com/invite/abc123', required: false })
    classroomInviteLink?: string;
}

class ClassFacultyDataDto {
    @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d1' })
    classId!: string;

    @ApiProperty({ type: FacultyDataDto })
    faculty!: FacultyDataDto;
}

export class ClassFacultyResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: 'Faculty added successfully' })
    message!: string;

    @ApiProperty({ type: ClassFacultyDataDto })
    data!: ClassFacultyDataDto;
}

export class DeleteClassFacultyResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: 'Faculty removed successfully' })
    message!: string;
}


// ─── Additional DTOs for Fetching Multiple Faculties ─────────────────────────
class FacultiesDataDto {
    @ApiProperty({ example: '65f1a2b3c4d5e6f7a8b9c0d1' })
    classId!: string;

    @ApiProperty({ type: [FacultyDataDto] })
    faculties!: FacultyDataDto[];
}

export class FetchClassFacultiesResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: 'Faculties fetched successfully' })
    message!: string;

    @ApiProperty({ type: FacultiesDataDto })
    data!: FacultiesDataDto;
}

// ─── Additional DTO for Fetching Single Faculty ─────────────────────────────
export class FetchSingleClassFacultyResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;
    @ApiProperty({ example: 'Faculty fetched successfully' })
    message!: string;
    @ApiProperty({ type: ClassFacultyDataDto })
    data!: ClassFacultyDataDto;
}