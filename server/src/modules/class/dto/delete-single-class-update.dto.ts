import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

class DeleteSingleClassUpdateArgs {
    @ApiProperty({ description: 'The ID of the updateId', example: 'c456...' })
    @IsString()
    updateId!: string;
}

export class DeleteSingleClassUpdateResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: 'Class update deleted successfully' })
    message!: string;

    @ApiProperty({ description: 'The ID of the deleted update', example: '65f1...' })
    data!: DeleteSingleClassUpdateArgs;
}