import { Body, Post, Controller } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { EnrollClassRequestDto } from '../dto/enroll-class.dto';
import { EnrollClassService } from '../services/enroll-class.service';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { IJwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@ApiTags('Class')
@Controller('classes')
export class EnrollClassController {
  constructor(private readonly enrollClassService: EnrollClassService) {}

  @Post('enroll')
  @ApiOperation({ summary: 'Enroll a class using a enroll code' })
  @ApiResponse({ status: 200, description: 'Successfully enrolled the class' })
  async enrollClass(
    @CurrentUser() user: IJwtPayload,
    @Body() enrollClassRequestDto: EnrollClassRequestDto,
  ) {
    return await this.enrollClassService.execute(
      user.userId.toString(),
      enrollClassRequestDto,
    );
  }
}
