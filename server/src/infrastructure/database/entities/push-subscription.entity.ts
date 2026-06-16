// push-subscription.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
export type PushSubscriptionDocument = HydratedDocument<PushSubscription>;

@Schema({ timestamps: true, strict: true })
export class PushSubscription {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true })
    endpoint!: string;

    @Prop({ type: Object, required: true })
    keys!: {
        p256dh: string;
        auth: string;
    };
}

export const PushSubscriptionSchema =
    SchemaFactory.createForClass(PushSubscription);
PushSubscriptionSchema.index({ userId: 1, endpoint: 1 }, { unique: true });
