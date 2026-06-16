import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { StringValue } from 'ms';

import { LoggerMiddleware } from '../common/middleware/logger.middleware';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';

import { HybridAuthGuard } from '../common/guards/hybrid-auth.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/permissions/permissions.guard';

import { AuthModule } from '../modules/auth/auth.module';
import { AgentModule } from '../modules/agent/agent.module';

@Global()
@Module({
  imports: [
    ConfigModule,
    PassportModule,
    AuthModule,
    AgentModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<StringValue>('jwt.accessToken.secret'),
      }),
    }),
  ],
  providers: [
    JwtAuthGuard,
    HybridAuthGuard,
    RolesGuard,
    PermissionsGuard,
    {
      provide: APP_GUARD,
      useClass: HybridAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
  exports: [
    JwtModule,
    JwtAuthGuard,
    HybridAuthGuard,
    RolesGuard,
    PermissionsGuard,
  ],
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}