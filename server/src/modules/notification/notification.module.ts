import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from '../../infrastructure/database/entities/notification.entity';

// Feature services
import { NotificationService } from './services/notification.service';
import { NotificationController } from './controllers/notification.controller';

// Push Subscription
import { PushSubscription, PushSubscriptionSchema } from '../../infrastructure/database/entities/push-subscription.entity';
import { PushSubscriptionController } from './controllers/push-subscription.controller';
import { PushSubscriptionService } from './services/push-subscription.service';

@Global()
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Notification.name, schema: NotificationSchema },
            { name: PushSubscription.name, schema: PushSubscriptionSchema },
        ]),
    ],
    controllers: [NotificationController, PushSubscriptionController],
    providers: [NotificationService, PushSubscriptionService],
    exports: [NotificationService, PushSubscriptionService],
})
export class NotificationModule { }