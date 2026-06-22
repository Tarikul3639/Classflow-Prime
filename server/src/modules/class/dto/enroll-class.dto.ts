import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Length,
  IsBoolean,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Request DTO for enrolling a class
 */
export class EnrollClassRequestDto {
  @ApiProperty({
    example: 'ABC123',
    description: '6-character enroll code for the class',
  })
  @IsString()
  @IsNotEmpty({ message: 'Enroll code is required' })
  @Length(6, 6, { message: 'Enroll code must be exactly 6 characters' })
  enrollCode!: string;
}

/**
 * Nested data object for the response
 */
class EnrollClassDataDto {
  @ApiProperty({
    example: '65f1a2b3c4d5e6f7a8b9c0d1',
    description: 'The unique ID of the class, or null if enroll failed',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  classId?: string | null;
}

/**
 * Response DTO for enrolling a class
 */
export class EnrollClassResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indicates if the enroll operation was successful',
  })
  @IsBoolean()
  success!: boolean;

  @ApiProperty({
    example: 'Successfully enrolled the class',
    description: 'Message providing additional information',
  })
  @IsString()
  message!: string;

  @ApiProperty({
    example: 'already_joined',
    description: 'Status code representing the result of the enroll attempt',
  })
  @IsString()
  status!: string;

  @ApiProperty({
    description: 'Data returned upon enrolling',
    type: EnrollClassDataDto,
  })
  @ValidateNested()
  @Type(() => EnrollClassDataDto)
  data!: EnrollClassDataDto;
}