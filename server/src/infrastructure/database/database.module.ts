import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('database.uri');

        if (!uri) {
          throw new Error(
            'MONGODB_URI is not defined in environment variables',
          );
        }

        return {
          uri,

          // Pool settings
          maxPoolSize: 50,
          minPoolSize: 5,

          // Timeout settings
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,

          // Auto index
          autoIndex: configService.get<string>('NODE_ENV') !== 'production',

          // Auto create
          autoCreate: true,

          // Retry writes
          retryWrites: true,

          // App name for MongoDB logs
          appName: configService.get<string>('APP_NAME'),
        };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {
  constructor(private configService: ConfigService) {
    const dbName = this.extractDbName(
      configService.get<string>('database.uri')!,
    );
    console.log(
      `✅ MongoDB Atlas Module initialized | 🗄️. Database: ${dbName} | ☁️. Cloud: MongoDB Atlas`,
    );
  }

  private extractDbName(uri: string): string {
    try {
      const match = uri.match(/\.net\/([^?]+)/);
      return match ? match[1] : 'Unknown';
    } catch {
      return 'Unknown';
    }
  }
}
