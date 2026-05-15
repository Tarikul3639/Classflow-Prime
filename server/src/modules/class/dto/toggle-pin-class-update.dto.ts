import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

// Request DTO
export class TogglePinClassUpdateRequestDto {
    @ApiProperty({ description: 'New pin status', example: true })
    @IsBoolean()
    isPinned!: boolean;
}

// Response DTO
class UpdatedPinData {
    @ApiProperty({ description: 'The ID of the update', example: '65f1...' })
    updateId!: string;

    @ApiProperty({ description: 'Indicates if the update is now pinned', example: true })
    isPinned!: boolean;
}

export class TogglePinClassUpdateResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: 'Pin status updated successfully' })
    message!: string;

    @ApiProperty({ type: UpdatedPinData })
    data!: {
        update: UpdatedPinData;
    };
}