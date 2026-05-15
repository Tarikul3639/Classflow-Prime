import { Types } from 'mongoose';
import { NotificationType } from '../entities/notification.entity';

// ─── Metadata Interface ───────────────────────────────────────
export interface INotificationMetadata {
    classId?: Types.ObjectId | null;
    updateId?: Types.ObjectId | null;
    refModel?: 'ClassUpdate' | 'Class' | 'Enrollment' | 'Material' | null;
    route?: string | null;
    params?: Record<string, string>;
    query?: Record<string, string>;
}

// ─── Main Notification Interface ──────────────────────────────
export interface INotification {
    recipientId: Types.ObjectId;
    senderId?: Types.ObjectId | null;

    title: string;
    message: string;

    type: NotificationType;

    isRead?: boolean;
    readAt?: Date | null;

    metadata?: INotificationMetadata;

    createdAt?: Date;
    updatedAt?: Date;
}