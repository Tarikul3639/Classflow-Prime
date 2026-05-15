import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AccessTokenDecodeDto {
  @ApiProperty({ description: 'Access token to decode' })
  @IsString()
  token!: string;
}

export class RefreshTokenDecodeDto {
  @ApiProperty({ description: 'Refresh token to decode' })
  @IsString()
  token!: string;
}

export class PasswordDecodeDto {
  @ApiProperty({ description: 'Password to decode' })
  @IsString()
  password!: string;
}