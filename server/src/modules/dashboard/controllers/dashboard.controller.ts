import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { IJwtPayload } from '../../../modules/auth/interfaces/jwt-payload.interface';

import { DashboardResponseDto } from '../dto/dashboard.dto';
import { DashboardService } from '../services/dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
    constructor(
        private readonly dashboardService: DashboardService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Fetch all dashboard data for the current user' })
    @ApiResponse({ status: 200, type: DashboardResponseDto })
    async fetchDashboard(
        @CurrentUser() user: IJwtPayload,
    ): Promise<DashboardResponseDto> {
        return await this.dashboardService.execute(user.userId.toString());
    }
}