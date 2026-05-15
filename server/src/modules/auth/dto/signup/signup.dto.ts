import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

interface ISignUpDto {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
}

export class SignUpDto implements ISignUpDto {
  @ApiProperty({
    example: 'Tarikul Islam',
    description: 'Full name of the user',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(60, { message: 'Name must be at most 60 characters' })
  @Transform(({ value }) => value?.trim())
  name!: string;

  @ApiProperty({
    example: 'tarikul@example.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email!: string;

  @ApiProperty({
    example: 'StrongPass123',
    description: 'Account password',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;

  @ApiPropertyOptional({
    example: 'https://api.dicebear.com/7.x/avataaars/svg?seed=abc123',
    description: 'Avatar URL (optional)',
  })
  @IsOptional()
  @IsUrl({}, { message: 'avatarUrl must be a valid URL' })
  avatarUrl?: string;
}