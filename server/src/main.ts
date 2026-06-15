import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT')!;
  const nodeEnv = configService.get<string>('NODE_ENV');

  // ================= Security & Middleware =================
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // ================= CORS =================
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN')!,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-api-key'],
  });

  // ================= Global Config =================
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '2',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ================= Swagger =================
  const swaggerConfig = new DocumentBuilder()
    .setTitle('ClassFlow Prime API')
    .setDescription(
      `
      Complete API documentation for ClassFlow Prime.

      ### Authentication Methods:
      1. **JWT Authentication**: Used by Web and Mobile clients. Send Bearer Token in Authorization header.
      2. **Agent Authentication**: Used by AI Agents. Send API Key in x-api-key header.

      **Example:** \`x-api-key: hat_live_xxxxxxxxxxxxxxxxxxxxxxxxx\`
    `,
    )
    .setVersion('2.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT Access Token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'Agent API Key',
      },
      'x-api-key',
    )
    .addTag(
      'Auth',
      'Authentication endpoints (signup, signin, signout, forgot password)',
    )
    .addTag('Profile', 'User profile endpoints')
    .addTag('Dashboard', 'Dashboard statistics endpoints')
    .addTag('Classes', 'Class management endpoints')
    .addTag('Notifications', 'Notification endpoints')
    .addTag('Agent', 'AI Agent endpoints authenticated using x-api-key')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'ClassFlow Prime API Docs',
  });

  // Export Swagger JSON
  app.getHttpAdapter().get('/api/swagger.json', (_, res) => res.json(document));

  // ================= Graceful Shutdown & Start =================
  app.enableShutdownHooks();

  await app.listen(port);

  console.log(`📚 Swagger UI: http://localhost:${port}/api/docs`);
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  console.log(`🌍 Environment: ${nodeEnv}`);
}

bootstrap();
