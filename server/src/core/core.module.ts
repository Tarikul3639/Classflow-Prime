import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { LoggerMiddleware } from './middleware/logger.middleware';

import { HybridAuthGuard } from '../modules/auth/guards/hybrid-auth.guard';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { AuthModule } from '../modules/auth/auth.module';
import { AgentModule } from '../modules/agent/agent.module';

@Module({
  imports: [AuthModule, AgentModule, JwtModule.register({})],
  providers: [
    {
      provide: APP_GUARD,
      useClass: HybridAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // global logger
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
