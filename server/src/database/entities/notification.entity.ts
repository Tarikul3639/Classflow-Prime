import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { INotification } from '../interface/notification.interface';

export type NotificationDocument = HydratedDocument<Notification & INotification>;

export enum NotificationType {
    UPDATE = 'UPDATE',
    FACULTY = 'CLASS_FACULTY',
    GROUP = 'CLASS_GROUP',
    MATERIAL = 'MATERIAL',
    ENROLLMENT = 'ENROLLMENT',
}

@Schema({
    timestamps: true,
    strict: true,
})
export class Notification implements INotification {
    // ─── Recipient (who receives) ────────────────────────────────
    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    })
    recipientId!: Types.ObjectId;

    // ─── Sender (null = system generated) ────────────────────────
    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        default: null,
    })
    senderId!: Types.ObjectId | null;

    // ─── Content ────────────────────────────────────────────────
    @Prop({
        required: true,
        trim: true,
        maxlength: 100,
    })
    title!: string;

    @Prop({
        required: true,
        trim: true,
        maxlength: 500,
    })
    message!: string;

    // ─── Type ───────────────────────────────────────────────────
    @Prop({
        type: String,
        enum: Object.values(NotificationType),
        default: NotificationType.UPDATE,
        index: true,
    })
    type!: NotificationType;

    // ─── Read State ─────────────────────────────────────────────
    @Prop({ default: false })
    isRead!: boolean;

    @Prop({
        type: Date,
        default: null,
    })
    readAt!: Date | null;

    // ─── Navigation Metadata ────────────────────────────────────
    @Prop({
        type: {
            classId: {
                type: Types.ObjectId,
                ref: 'Class',
                default: null,
            },
            updateId: {
                type: Types.ObjectId,
                ref: 'ClassUpdate',
                default: null,
            },
            refModel: {
                type: String,
                enum: ['ClassUpdate', 'Class', 'Enrollment', 'Material', null],
                default: null,
            },
            route: {
                type: String,
                default: null,
            },
            params: {
                type: Map,
                of: String,
                default: {},
            },
            query: {
                type: Map,
                of: String,
                default: {},
            },
        },
        default: {},
        _id: false,
    })
    metadata!: {
        classId?: Types.ObjectId | null;
        updateId?: Types.ObjectId | null;
        refModel?: 'ClassUpdate' | 'Class' | 'Enrollment' | 'Material' | null;
        route?: string | null;
        params?: Record<string, string>;
        query?: Record<string, string>;
    };
}

export const NotificationSchema =
    SchemaFactory.createForClass(Notification);

// ─── Indexes ──────────────────────────────────────────────────

// unread notifications (latest first)
NotificationSchema.index({
    recipientId: 1,
    isRead: 1,
    createdAt: -1,
});

// class-specific filtering
NotificationSchema.index({
    'metadata.classId': 1,
    recipientId: 1,
    createdAt: -1,
});

// filter by type
NotificationSchema.index({
    recipientId: 1,
    type: 1,
    createdAt: -1,
});

// auto-delete after 30 days
NotificationSchema.index(
    { createdAt: 1 },
    {
        expireAfterSeconds: 60 * 60 * 24 * 30,
    },
);