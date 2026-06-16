import {
    IsArray,
    IsEnum,
    IsMongoId,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';
import { NotificationType } from '../../../infrastructure/database/entities/notification.entity';

export class CreateNotificationDto {
    @IsMongoId()
    recipientId!: string;

    @IsOptional()
    @IsMongoId()
    senderId?: string | null;

    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    title!: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(500)
    message!: string;

    @IsOptional()
    @IsEnum(NotificationType)
    type?: NotificationType;

    @IsOptional()
    @IsObject()
    metadata?: {
        classId?: string | null;
        updateId?: string | null;
        refModel?: 'ClassUpdate' | 'Class' | 'Enrollment' | 'Material' | null;
        route?: string | null;
        params?: Record<string, string>;
        query?: Record<string, string>;
    };
}

export class CreateBulkNotificationDto extends OmitType(
    CreateNotificationDto,
    ['recipientId'],
) {
    @IsArray()
    @IsMongoId({ each: true })
    recipientIds!: string[];
}