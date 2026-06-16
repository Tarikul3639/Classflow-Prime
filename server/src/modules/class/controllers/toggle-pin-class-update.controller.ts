import { Patch, Param, Controller, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { IJwtPayload } from '../../auth/interfaces/jwt-payload.interface';

import { TogglePinClassUpdateRequestDto, TogglePinClassUpdateResponseDto } from '../dto/toggle-pin-class-update.dto';
import { TogglePinClassUpdateService } from '../services/toggle-pin-class-update.service';

@ApiTags('Class')
@Controller('classes')
export class TogglePinClassUpdateController {
    constructor(
        private readonly togglePinClassUpdateService: TogglePinClassUpdateService,
    ) { }

    @Patch(':classId/updates/:updateId/toggle-pin')
    @ApiOperation({ summary: 'Toggle pin status of a class update' })
    @ApiResponse({
        status: 200,
        description: 'Pin status toggled successfully',
        type: TogglePinClassUpdateResponseDto,
    })
    async togglePin(
        @CurrentUser() user: IJwtPayload,
        @Param('classId') classId: string,
        @Param('updateId') updateId: string,
        @Body() body: TogglePinClassUpdateRequestDto,
    ): Promise<TogglePinClassUpdateResponseDto> {
        return await this.togglePinClassUpdateService.execute(
            user.userId.toString(),
            classId,
            updateId,
            body,
        );

    }
}