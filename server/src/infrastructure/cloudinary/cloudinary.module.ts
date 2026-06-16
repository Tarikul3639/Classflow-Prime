import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryController } from './cloudinary.controller';
import { CloudinaryService } from './cloudinary.service';

@Module({
    providers: [
        CloudinaryService,
        {
            // This provider initializes the Cloudinary SDK with configuration from environment variables
            provide: 'CLOUDINARY',
            useFactory: (configService: ConfigService) => {
                return cloudinary.config({
                    cloud_name: configService.get<string>('cloudinary.cloudName'),
                    api_key: configService.get<string>('cloudinary.apiKey'),
                    api_secret: configService.get<string>('cloudinary.apiSecret'),
                });
            },
            inject: [ConfigService],
        },
    ],
    controllers: [CloudinaryController],
    exports: [CloudinaryService, 'CLOUDINARY'],
})
export class CloudinaryModule { }