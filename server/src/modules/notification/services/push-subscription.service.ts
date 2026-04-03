import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    PushSubscription,
    PushSubscriptionDocument,
} from '../../../database/entities/push-subscription.entity';

@Injectable()
export class PushSubscriptionService {
    constructor(
        @InjectModel(PushSubscription.name)
        private readonly pushSubscriptionModel: Model<PushSubscriptionDocument>,
    ) { }

    async save(userId: string, subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) {
        await this.pushSubscriptionModel.findOneAndUpdate(
            {
                userId: new Types.ObjectId(userId),
                endpoint: subscription.endpoint,
            },
            {
                userId: new Types.ObjectId(userId),
                endpoint: subscription.endpoint,
                keys: subscription.keys,
            },
            { upsert: true, new: true },
        );
    }

    async remove(userId: string, endpoint: string) {
        try {
            console.log('[push] Removing subscription for user:', userId, 'endpoint:', endpoint);

            if (!userId || !endpoint) {
                throw new Error('User ID and endpoint are required');
            }

            const result = await this.pushSubscriptionModel.findOneAndDelete({
                userId: new Types.ObjectId(userId),
                endpoint,
            });

            if (!result) {
                console.warn('[push] Subscription not found for removal:', userId, endpoint);
            } else {
                console.log('[push] Subscription removed successfully:', result._id);
            }

            return result;
        } catch (error) {
            console.error('[push] Error removing subscription:', error);
            throw new Error(
                error instanceof Error ? error.message : 'Failed to remove push subscription'
            );
        }
    }

    async getByUserIds(userIds: string[]) {
        return this.pushSubscriptionModel.find({
            userId: { $in: userIds.map((id) => new Types.ObjectId(id)) },
        });
    }
}