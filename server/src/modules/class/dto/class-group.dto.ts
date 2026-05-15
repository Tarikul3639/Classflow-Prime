import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
    IsUrl,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

// ─── Response Class group DTO ─────────────────────────────────────────────────────────────

class GroupUIConfigDto {
    @ApiProperty({
        example: 'text-emerald-600',
        description: 'Tailwind CSS text color class for the platform',
    })
    @IsString()
    @IsNotEmpty({ message: 'Platform color is required' })
    platformColor!: string;

    @ApiProperty({
        example: 'bg-emerald-50',
        description: 'Tailwind CSS background color class for the platform',
    })
    @IsString()
    @IsNotEmpty({ message: 'Platform background color is required' })
    platformBg!: string;

    @ApiProperty({
        example: 'MessageCircle',
        description: 'Icon name representing the platform',
    })
    @IsString()
    @IsNotEmpty({ message: 'Icon name is required' })
    iconName!: string;
}

export class ClassGroupDto {
    @ApiProperty({ example: '12345', description: 'Unique identifier of the class group' })
    @IsString()
    @IsNotEmpty({ message: 'Group ID is required' })
    groupId!: string;

    @ApiProperty({ example: 'Project Team A', description: 'Name of the class group' })
    @IsString()
    @IsNotEmpty({ message: 'Group name is required' })
    @MinLength(3, { message: 'Group name must be at least 3 characters' })
    @MaxLength(100, { message: 'Group name must be at most 100 characters' })
    name!: string;

    @ApiProperty({
        example: 'This group is for Project Team A',
        description: 'Description of the class group',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(255, { message: 'Group description must be at most 255 characters' })
    description?: string;

    @ApiProperty({
        example: 'https://chat.whatsapp.com/abc123',
        description: 'Enrollment link for the group',
    })
    @IsString()
    @IsUrl({}, { message: 'Group link must be a valid URL' })
    @IsNotEmpty({ message: 'Group link is required' })
    @MaxLength(255, { message: 'Group link must be at most 255 characters' })
    link!: string;

    @ApiProperty({ example: 'WhatsApp', description: 'Platform of the group' })
    @IsString()
    @IsNotEmpty({ message: 'Group platform is required' })
    platform!: string;

    @ApiProperty({
        type: GroupUIConfigDto,
        description: 'UI configuration for the group (for frontend display purposes)',
        required: false,
    })
    @IsOptional()
    uiConfig?: GroupUIConfigDto;

    @ApiProperty({ example: 'user123', description: 'Identifier of the user who created the group' })
    @IsString()
    @IsNotEmpty({ message: 'Created by user ID is required' })
    createdBy!: string;

    @ApiProperty({ example: '2024-01-01T00:00:00Z', description: 'Timestamp when the group was created' })
    @IsString()
    @IsNotEmpty({ message: 'Created at timestamp is required' })
    createdAt!: string;

    @ApiProperty({ example: '2024-01-02T00:00:00Z', description: 'Timestamp when the group was last updated' })
    @IsString()
    @IsNotEmpty({ message: 'Updated at timestamp is required' })
    updatedAt!: string;
}

export class GetClassGroupsResponseDto {
    @ApiProperty({ example: true, description: 'Indicates if the request was successful' })
    success!: boolean;

    @ApiProperty({ example: 'Groups fetched successfully', description: 'Response message' })
    message!: string;

    @ApiProperty({
        type: Object,
        description: 'List of class groups',
        example: {
            classId: '123',
            groups: [],
        },
    })
    data!: {
        classId: string;
        groups: ClassGroupDto[];
    };
}

export class CreateClassGroupRequestDto extends OmitType(ClassGroupDto, [
    'groupId',
    'createdAt',
    'updatedAt',
    'createdBy',
] as const) { }