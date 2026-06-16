import { Param, Controller, Delete } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { IJwtPayload } from '../../auth/interfaces/jwt-payload.interface';

import { DeleteSingleClassUpdateResponseDto } from '../dto/delete-single-class-update.dto';
import { DeleteSingleClassUpdateService } from '../services/delete-single-class-update.service';

@ApiTags('Class')
@Controller('classes')
export class DeleteSingleClassUpdateController {
    constructor(
        private readonly deleteSingleClassUpdateService: DeleteSingleClassUpdateService,
    ) { }

    @Delete(':classId/updates/:updateId')
    @ApiOperation({ summary: 'Delete a single class update' })
    @ApiResponse({
        status: 200,
        description: 'Class update deleted successfully',
        type: DeleteSingleClassUpdateResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Update or Class not found' })
    async deleteSingleClassUpdate(
        @CurrentUser() user: IJwtPayload,
        @Param('classId') classId: string,
        @Param('updateId') updateId: string,
    ): Promise<DeleteSingleClassUpdateResponseDto> {
        return await this.deleteSingleClassUpdateService.execute(
            user.userId.toString(),
            classId,
            updateId,
        );
    }
}