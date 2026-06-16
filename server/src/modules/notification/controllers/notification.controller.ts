import {
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Query,
} from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { QueryNotificationDto } from '../dto/query-notification.dto';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { IJwtPayload } from '../../auth/interfaces/jwt-payload.interface';

import {
    GetNotificationsResponseDto,
    UnreadCountResponseDto,
} from '../dto/notification-response.dto';

@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    // GET /notifications?page=1&limit=20&onlyUnread=true&type=UPDATE
    @Get()
    async getAll(
        @CurrentUser() user: IJwtPayload,
        @Query() query: QueryNotificationDto,
    ): Promise<GetNotificationsResponseDto> {
        return this.notificationService.getUserNotifications(
            user.userId.toString(),
            query,
        );
    }

    // GET /notifications/unread-count
    @Get('unread-count')
    async getUnreadCount(
        @CurrentUser() user: IJwtPayload,
    ): Promise<UnreadCountResponseDto> {
        return this.notificationService.getUnreadCount(user.userId.toString());
    }

    // PATCH /notifications/read-all
    @Patch('read-all')
    @HttpCode(HttpStatus.NO_CONTENT)
    async markAllAsRead(@CurrentUser() user: IJwtPayload): Promise<void> {
        return this.notificationService.markAllAsRead(user.userId.toString());
    }

    // PATCH /notifications/:id/read
    @Patch(':id/read')
    @HttpCode(HttpStatus.NO_CONTENT)
    async markAsRead(
        @Param('id') id: string,
        @CurrentUser() user: IJwtPayload,
    ): Promise<void> {
        return this.notificationService.markAsRead(id, user.userId.toString());
    }

    // DELETE /notifications
    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteAll(@CurrentUser() user: IJwtPayload): Promise<void> {
        return this.notificationService.deleteAll(user.userId.toString());
    }

    // DELETE /notifications/:notificationId
    @Delete(':notificationId')
    @HttpCode(HttpStatus.NO_CONTENT) // NOTE: Don't return any content, just the status code
    async deleteOne(
        @Param('notificationId') notificationId: string,
        @CurrentUser() user: IJwtPayload,
    ): Promise<void> {
        return this.notificationService.deleteOne(notificationId, user.userId.toString());
    }
}
