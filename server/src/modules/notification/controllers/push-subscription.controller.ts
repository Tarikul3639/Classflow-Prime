import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PushSubscriptionService } from '../services/push-subscription.service';

@Controller('notifications')
export class PushSubscriptionController {
    constructor(
        private readonly pushSubscriptionService: PushSubscriptionService,
    ) { }

    @Post('subscribe')
    @HttpCode(HttpStatus.OK)
    async subscribe(
        @Body() body: { userId: string; subscription: PushSubscriptionDto },
    ) {
        await this.pushSubscriptionService.save(body.userId, body.subscription);
        return { success: true, message: 'Push subscription saved' };
    }

    @Post('unsubscribe')
    @HttpCode(HttpStatus.OK)
    async unsubscribe(
        @Body() body: { userId: string; endpoint: string },
    ) {
        await this.pushSubscriptionService.remove(body.userId, body.endpoint);
        return { success: true, message: 'Push subscription removed' };
    }
}

interface PushSubscriptionDto {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}