import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateClassRequestDto } from '../dto/create-class.dto';
import { CreateClassService } from '../services/create-class.service';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { IJwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@ApiTags('Class')
@Controller('classes')
export class CreateClassController {
  constructor(private readonly createClassService: CreateClassService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new class' })
  @ApiResponse({ status: 201, description: 'Class created successfully' })
  async createClass(
    @CurrentUser() user: IJwtPayload,
    @Body() createClassRequestDto: CreateClassRequestDto,
  ) {
    return await this.createClassService.execute(
      user.userId.toString(),
      createClassRequestDto,
    );
  }
}
