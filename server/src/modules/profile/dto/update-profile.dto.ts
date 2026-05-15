import {
  IsEmail,
  IsUrl,
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @ApiProperty({
    example: 'Software developer with a passion for open source.',
    description: 'User bio or description',
  })
  @IsOptional()
  @IsString({ message: 'Bio must be a string' })
  bio?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'URL to the user avatar image',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Avatar URL must be a valid URL' })
  avatarUrl?: string;
}

export class IUser {
  _id!: string;
  name!: string;
  email!: string;
  avatarUrl?: string;
  bio?: string;
}

export class UpdateProfileResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indicates if the profile update was successful',
  })
  success!: boolean;

  @ApiProperty({
    example: 'Profile updated for user',
    description: 'Response message indicating the result of the profile update operation',
  })
  message!: string;

  @ApiProperty({
    example: {
      _id: '60d0fe4f5311236168a109ca',
      name: 'John Doe',
      email: 'john.doe@example.com',
      avatarUrl: 'https://example.com/avatar.jpg',
      bio: 'Software developer with a passion for open source.',
    },
    description: 'Updated user profile data',
  })
  data!: {
    user: IUser;
  };
}