import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configs from './config';

// Import the DatabaseModule
import { DatabaseModule } from './infrastructure/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './infrastructure/mail/mail.module';
import { ProfileModule } from './modules/profile/profile.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ClassModule } from './modules/class/class.module';
import { AgentModule } from './modules/agent/agent.module';
// Import the RoutineModule
import { RoutineModule } from './modules/routine/routine.module';
// Import the DashboardModule
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { CloudinaryModule } from './infrastructure/cloudinary/cloudinary.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: configs, // Load all configuration factories from config/index.ts
      isGlobal: true, // Make ConfigModule available globally
      envFilePath: ['src/.env', '.env'], // Load .env files
    }),
    DatabaseModule,
    AuthModule,
    MailModule,
    NotificationModule,
    ClassModule,
    RoutineModule,
    DashboardModule,
    CoreModule,
    CloudinaryModule,
    ProfileModule,
    AgentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
