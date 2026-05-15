import { ApiProperty } from '@nestjs/swagger';

export class LeaveClassResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: 'You have left the class.' })
    message!: string;
}

export class DeleteClassResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: 'Class deleted successfully.' })
    message!: string;
}

export class MarkClassAsEndedResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: 'Class marked as ended.' })
    message!: string;

    @ApiProperty({ example: { classId: '123', isEnded: true } })
    data!: {
        classId: string;
        isEnded: boolean;
    };
}

export class FetchClassSettingsResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: 'Class code fetched successfully.' })
    message!: string;

    @ApiProperty({ example: { code: 'ABC123' } })
    data!: {
        code: string;
        isJoiningAllowed: boolean;
    };
}

export class RegenerateClassCodeResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: 'Class code regenerated successfully.' })
    message!: string;

    @ApiProperty({ example: { code: 'NEW456' } })
    data!: {
        code: string;
    };
}

export class ToggleJoiningAllowedResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: 'Joining allowed status updated successfully.' })
    message!: string;

    @ApiProperty({ example: { classId: '123', isJoiningAllowed: true } })
    data!: {
        classId: string;
        isJoiningAllowed: boolean;
    };
}