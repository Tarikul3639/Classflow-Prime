import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsEnum,
    IsInt,
    IsMongoId,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { NotificationType } from '../../../database/entities/notification.entity';

// ─── Metadata ─────────────────────────────────────────────
export class NotificationMetadataDto {
    @IsOptional()
    @IsMongoId()
    classId?: Types.ObjectId | null;

    @IsOptional()
    @IsMongoId()
    updateId?: Types.ObjectId | null;

    @IsOptional()
    @IsString()
    refModel?: 'ClassUpdate' | 'Class' | 'Enrollment' | 'Material' | null;

    @IsOptional()
    @IsString()
    route?: string | null;

    @IsOptional()
    @IsObject()
    params?: Record<string, string>;

    @IsOptional()
    @IsObject()
    query?: Record<string, string>;
}

// ─── Single Notification ──────────────────────────────────
export class NotificationDto {
    @IsMongoId()
    _id!: Types.ObjectId;

    @IsMongoId()
    recipientId!: Types.ObjectId;

    @IsOptional()
    @IsMongoId()
    senderId?: Types.ObjectId | null;  // ! → ?

    @IsNotEmpty()
    @IsString()
    title!: string;

    @IsNotEmpty()
    @IsString()
    message!: string;

    @IsEnum(NotificationType)
    type!: NotificationType;

    @IsBoolean()
    isRead!: boolean;

    @IsOptional()
    @IsDateString()
    readAt?: Date | null;  

    @IsOptional()
    @ValidateNested()
    @Type(() => NotificationMetadataDto)
    metadata?: NotificationMetadataDto;  

    @IsOptional()
    @IsDateString()
    createdAt?: Date;  

    @IsOptional()
    @IsDateString()
    updatedAt?: Date;  
}

// ─── Pagination Meta ──────────────────────────────────────
export class NotificationPaginationMetaDto {
    @IsInt()
    total!: number;

    @IsInt()
    unreadCount!: number;

    @IsInt()
    page!: number;

    @IsInt()
    limit!: number;

    @IsInt()
    totalPages!: number;

    @IsBoolean()
    hasMore!: boolean;
}

// ─── Generic API Wrapper ──────────────────────────────────
export class ApiResponseDto<T> {
    @IsBoolean()
    success!: boolean;

    @IsString()
    message!: string;

    data!: T;
}

// ─── GET /notifications ───────────────────────────────────
export class NotificationListDataDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => NotificationDto)
    data!: NotificationDto[];

    @ValidateNested()
    @Type(() => NotificationPaginationMetaDto)
    meta!: NotificationPaginationMetaDto;
}

export class GetNotificationsResponseDto extends ApiResponseDto<NotificationListDataDto> {
    @ValidateNested()
    @Type(() => NotificationListDataDto)
    declare data: NotificationListDataDto;
}

// ─── GET /notifications/unread-count ─────────────────────
export class UnreadCountDataDto {
    @IsInt()
    count!: number;
}

export class UnreadCountResponseDto extends ApiResponseDto<UnreadCountDataDto> {
    @ValidateNested()
    @Type(() => UnreadCountDataDto)
    declare data: UnreadCountDataDto;
}