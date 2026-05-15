import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'student@example.com',
    description: 'Account email that requested password reset',
  })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email!: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN0dWRlbnRAZXhhbXBsZS5jb20iLCJpYXQiOjE2ODg4ODQwMDAsImV4cCI6MTY4ODg4NzYwMH0.abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    description: 'Password reset token received after verifying reset code',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(255)
  resetToken!: string;

  @ApiProperty({
    example: 'NewStrongPass123',
    description: 'New password',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  newPassword!: string;
}