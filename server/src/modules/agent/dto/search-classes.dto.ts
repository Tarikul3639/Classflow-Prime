import { ApiProperty } from '@nestjs/swagger';

class SearchClassItemDto {
  @ApiProperty({ example: '6851fd7f2f7f4b8e11d8f0a1' })
  _id!: string;

  @ApiProperty({ example: 'Physics' })
  className!: string;
}

class SearchClassesDataDto {
  @ApiProperty({ type: [SearchClassItemDto] })
  classes!: SearchClassItemDto[];
}

export class SearchClassesResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Classes loaded successfully' })
  message!: string;

  @ApiProperty({ type: SearchClassesDataDto })
  data!: SearchClassesDataDto;
}