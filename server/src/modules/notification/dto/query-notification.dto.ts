import { IsBoolean, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { NotificationType } from '../../../infrastructure/database/entities/notification.entity';

export class QueryNotificationDto {
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 20;

    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    onlyUnread?: boolean = false;

    @IsOptional()
    @IsEnum(NotificationType)
    type?: NotificationType;
}