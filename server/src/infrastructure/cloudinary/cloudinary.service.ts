import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import cloudinaryConfig from '../../config/cloudinary.config';
import { GetSignatureResponseDto } from './dto/get-signature.dto';

@Injectable()
export class CloudinaryService {
    constructor(private readonly configService: ConfigService) { }

    private get ProjectName(): string {
        return this.configService.get<string>('APP_NAME', 'ClassFlow-Prime');
    }

    getSignature(subfolder = 'uploads'): GetSignatureResponseDto {
        const timestamp = Math.round(Date.now() / 1000);
        const config = cloudinaryConfig().cloudinary;

        const cleanSubfolder = subfolder.replace(/^\/+|\/+$/g, '');
        const folder = `${this.ProjectName}/${cleanSubfolder}`;

        const signature = cloudinary.utils.api_sign_request(
            {
                timestamp,
                folder,
            },
            config.apiSecret,
        );

        // console.log(`Generated Cloudinary signature for folder: ${folder} | Timestamp: ${timestamp}`);

        return {
            success: true,
            message: 'Cloudinary signature generated successfully',
            data: {
                signature,
                timestamp,
                apiKey: config.apiKey,
                cloudName: config.cloudName,
                folder,
            },
        };
    }
}
