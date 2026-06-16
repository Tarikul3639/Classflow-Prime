import * as webpush from 'web-push';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    Notification,
    NotificationDocument,
} from '../../../infrastructure/database/entities/notification.entity';

import {
    CreateNotificationDto,
    CreateBulkNotificationDto,
} from '../dto/create-notification.dto';
import { QueryNotificationDto } from '../dto/query-notification.dto';

import { PushSubscriptionService } from './push-subscription.service';

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name)
        private readonly notificationModel: Model<NotificationDocument>,
        private readonly pushSubscriptionService: PushSubscriptionService,
        private readonly configService: ConfigService,
    ) {
        webpush.setVapidDetails(
            this.configService.get<string>('webPush.mailto')!,
            this.configService.get<string>('webPush.publicKey')!,
            this.configService.get<string>('webPush.privateKey')!,
        );
    }


    // ─── Single Create ────────────────────────────────────────
    async create(dto: CreateNotificationDto): Promise<Notification> {
        return this.notificationModel.create(dto);
    }

    // ─── Bulk Create ──────────────────────────────────────────
    async createBulk(dto: CreateBulkNotificationDto): Promise<void> {
        if (!dto.recipientIds.length) return;

        const { recipientIds, ...rest } = dto;

        // 1) Save to DB
        await this.notificationModel.insertMany(
            recipientIds.map((recipientId) => ({
                ...rest,
                recipientId: new Types.ObjectId(recipientId),
            })),
            { ordered: false },
        );

        // 2) Send Browser Push Notifications
        const subscriptions = await this.pushSubscriptionService.getByUserIds(
            recipientIds,
        );

        if (subscriptions.length > 0) {
            const payload = JSON.stringify({
                notification: {
                    title: dto.title,
                    body: dto.message,
                    icon: '/icon.png',
                    badge: '/icon.png',
                },
                data: {
                    classId: dto.metadata?.classId ?? null,
                    updateId: dto.metadata?.updateId ?? null,
                    // materialId: dto.metadata?.materialId ?? null,
                    url: dto.metadata?.classId && dto.metadata?.updateId
                        ? `/classes/${dto.metadata.classId}/updates?updateId=${dto.metadata.updateId}`
                        : null,
                },
            });

            const results = await Promise.allSettled(
                subscriptions.map((sub) =>
                    webpush.sendNotification(
                        { endpoint: sub.endpoint, keys: sub.keys },
                        payload,
                    ),
                ),
            );

            // ── Error log ─────────────────────────────────
            results.forEach((result, i) => {
                if (result.status === 'rejected') {
                    console.error(`Push failed for subscription ${i}:`, result.reason);
                } else {
                    console.log(`Push sent successfully for subscription ${i}`);
                }
            });
        }
    }

    // ─── Get Paginated List ───────────────────────────────────
    async getUserNotifications(userId: string, query: QueryNotificationDto) {
        console.log('Call for all notifications: ', userId);
        const { page = 1, limit = 20, onlyUnread, type } = query;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {
            recipientId: new Types.ObjectId(userId),
        };

        if (onlyUnread) filter.isRead = false;
        if (type) filter.type = type;

        const [data, total, unreadCount] = await Promise.all([
            this.notificationModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            this.notificationModel.countDocuments(filter),

            // For bell badge count (ignoring pagination filters)
            this.notificationModel.countDocuments({
                recipientId: new Types.ObjectId(userId),
                isRead: false,
            }),
        ]);

        return {
            success: true,
            message: 'Notifications fetched successfully',
            data: {
                data,
                meta: {
                    total,
                    unreadCount,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                    hasMore: skip + data.length < total,
                },
            },
        };
    }

    // ─── Unread Count Only (Bell badge) ───────────────────────
    async getUnreadCount(userId: string) {
        const count = await this.notificationModel.countDocuments({
            recipientId: new Types.ObjectId(userId),
            isRead: false,
        });

        return {
            success: true,
            message: 'Unread count fetched successfully',
            data: {
                count,
            },
        };
    }

    // ─── Mark Single as Read ──────────────────────────────────
    async markAsRead(notificationId: string, userId: string): Promise<void> {
        await this.notificationModel.updateOne(
            {
                _id: new Types.ObjectId(notificationId),
                recipientId: new Types.ObjectId(userId),
                isRead: false,
            },
            {
                isRead: true,
                readAt: new Date(),
            },
        );
    }

    // ─── Mark All as Read ─────────────────────────────────────
    async markAllAsRead(userId: string): Promise<void> {
        await this.notificationModel.updateMany(
            {
                recipientId: new Types.ObjectId(userId),
                isRead: false,
            },
            {
                isRead: true,
                readAt: new Date(),
            },
        );
    }

    // ─── Delete Single ────────────────────────────────────────
    async deleteOne(notificationId: string, userId: string): Promise<void> {
        await this.notificationModel.deleteOne({
            _id: new Types.ObjectId(notificationId),
            recipientId: new Types.ObjectId(userId),
        });
    }

    // ─── Delete All ───────────────────────────────────────────
    async deleteAll(userId: string): Promise<void> {
        await this.notificationModel.deleteMany({
            recipientId: new Types.ObjectId(userId),
        });
    }
}
