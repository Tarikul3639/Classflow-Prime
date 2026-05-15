import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

// This DTO is used to define the structure of the request body for the getSignature method in CloudinaryController. It includes an optional subfolder field that can be used to specify a subfolder within the main folder for organizing uploads in Cloudinary. The subfolder must be a string with a maximum length of 100 characters and can only contain letters, numbers, slashes, underscores, and hyphens.
export class GetSignatureRequestDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    @Matches(/^[a-zA-Z0-9/_-]+$/, {
        message:
            'subfolder can only contain letters, numbers, slash, underscore, and hyphen',
    })
    subfolder?: string;
}

// This DTO is used to define the structure of the response returned by the getSignature method in CloudinaryService. It includes the signature, timestamp, API key, cloud name, and folder path needed for client-side uploads to Cloudinary.

export class GetSignature {
    signature!: string;
    timestamp!: number;
    apiKey!: string;
    cloudName!: string;
    folder!: string;
}

export class GetSignatureResponseDto {
    success!: boolean;
    message!: string;
    data!: GetSignature;
}