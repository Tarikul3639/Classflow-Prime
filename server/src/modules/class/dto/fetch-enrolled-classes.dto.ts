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
import { ClassStatus } from '../../../infrastructure/database/interface/class.interface';

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
  coverImage?: string | null;

  @IsOptional()
  @IsString()
  avatarUrl?: string | null;

  @IsEnum(ClassStatus)
  status!: ClassStatus;
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