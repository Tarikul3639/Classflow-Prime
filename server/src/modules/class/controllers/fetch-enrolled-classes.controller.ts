import { Body, Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { IJwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { FetchClassesResponseDto } from '../dto/fetch-enrolled-classes.dto';

import { FetchEnrolledClassesService } from '../services/fetch-enrolled-classes.service';

@ApiTags('Class')
@Controller('classes')
export class FetchClassesController {
  constructor(
    private readonly fetchEnrolledClassesService: FetchEnrolledClassesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Fetch classes for the current user' })
  @ApiResponse({ status: 200, description: 'Classes fetched successfully' })
  async fetchClasses(
    @CurrentUser() user: IJwtPayload,
  ): Promise<FetchClassesResponseDto> {
    return await this.fetchEnrolledClassesService.execute(
      user.userId.toString(),
    );

    // Mock response for testing
    // return {
    //     message: 'Classes fetched successfully',
    //     classes: [
    //         {
    //             classId: '123',
    //             department: 'Computer Science',
    //             title: 'Introduction to Programming',
    //             students: 30,
    //             instructor: 'John Doe',
    //             semester: 'Fall 2024',
    //             themeColor: '#FF5733',
    //             coverImage: 'https://example.com/cover.jpg',
    //             avatarUrl: 'https://example.com/avatar.jpg',
    //             status: 'active',
    //         },
    //         {
    //             classId: '456',
    //             department: 'Mathematics',
    //             title: 'Calculus I',
    //             students: 25,
    //             instructor: 'Jane Smith',
    //             semester: 'Spring 2024',
    //             themeColor: '#33C1FF',
    //             coverImage: 'https://example.com/cover2.jpg',
    //             avatarUrl: 'https://example.com/avatar2.jpg',
    //             status: 'archived',
    //         },
    //     ],
    // };
  }
}
