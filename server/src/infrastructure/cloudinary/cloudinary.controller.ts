import { Controller, Get, Query } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import {
    GetSignatureRequestDto,
    GetSignatureResponseDto,
} from './dto/get-signature.dto';

@Controller('cloudinary')
export class CloudinaryController {
    constructor(private readonly cloudinaryService: CloudinaryService) { }

    @Get('signature')
    getSignature(
        @Query() query: GetSignatureRequestDto,
    ): GetSignatureResponseDto {
        return this.cloudinaryService.getSignature(query.subfolder);        
    }
}
