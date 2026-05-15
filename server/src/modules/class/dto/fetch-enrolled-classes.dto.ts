import {
  IsString,
  IsArray,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ClassItemDto {
  @IsString()
  @IsNotEmpty()
  classId!: string;

  @IsString()
  department!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsNumber()
  students!: number;

  @IsString()
  instructor!: string;

  @IsString()
  semester!: string;

  @IsString()
  themeColor!: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string | null;

  @IsEnum(['active', 'archived'])
  status!: 'active' | 'archived';
}

export class ClassesDataDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClassItemDto)
  classes!: ClassItemDto[];
}

export class FetchClassesResponseDto {
  @IsBoolean()
  success!: boolean;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @ValidateNested()
  @Type(() => ClassesDataDto)
  data!: ClassesDataDto;
}