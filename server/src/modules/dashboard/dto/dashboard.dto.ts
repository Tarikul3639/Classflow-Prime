import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClassStatus } from '../../../database/interface/class.interface';
import { UpdateCategory } from '../../../database/interface/update.interface';
import { MaterialType } from '../../../database/interface/material.interface';
import { GroupPlatform } from '../../../database/interface/group.interface';

// ─── Nested DTOs ──────────────────────────────────────────────────────────────

export class UiConfigDto {
  @ApiProperty() platformColor: string;
  @ApiProperty() platformBg: string;
  @ApiProperty() iconName: string;
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class DashboardClassDto {
  @ApiProperty() _id: string;
  @ApiProperty() name: string;
  @ApiPropertyOptional() department?: string;
  @ApiPropertyOptional() semester?: string;
  @ApiProperty() themeColor: string;
  @ApiPropertyOptional() coverImage?: string | null;
  @ApiProperty({ enum: ClassStatus }) status: ClassStatus;
  @ApiProperty() allowEnroll: boolean;
  @ApiProperty() instructorName: string; // populated from User
  @ApiProperty() studentCount: number; // computed
}

// ─── Update ───────────────────────────────────────────────────────────────────

export class DashboardMaterialDto {
  @ApiProperty() _id: string;
  @ApiProperty() url: string;
  @ApiPropertyOptional() name?: string;
  @ApiProperty({ enum: MaterialType }) type: MaterialType;
  @ApiPropertyOptional() size?: number;
}

export class DashboardUpdateDto {
  @ApiProperty() _id: string;
  @ApiProperty() classId: string;
  @ApiProperty() className: string; // populated from Class
  @ApiProperty() title: string;
  @ApiPropertyOptional() description?: string;
  @ApiProperty({
    enum: UpdateCategory,
  })
  category: UpdateCategory;
  @ApiPropertyOptional() eventAt?: string | null;
  @ApiProperty({ type: [DashboardMaterialDto] })
  materials: DashboardMaterialDto[];
  @ApiProperty() isPinned: boolean;
  @ApiProperty() postedBy: string; // instructor name
  @ApiProperty() createdAt: string;
  @ApiProperty() updatedAt: string;
}

// ─── Faculty ──────────────────────────────────────────────────────────────────

export class DashboardFacultyDto {
  @ApiProperty() _id: string;
  @ApiProperty() classId: string;
  @ApiProperty() name: string;
  @ApiPropertyOptional() avatarUrl?: string | null;
  @ApiProperty() designation: string;
  @ApiProperty() location: string;
  @ApiProperty() email: string;
  @ApiPropertyOptional() phone?: string | null;
  @ApiPropertyOptional() classroomCode?: string | null;
}

// ─── Group ────────────────────────────────────────────────────────────────────

export class DashboardGroupDto {
  @ApiProperty() _id: string;
  @ApiProperty() classId: string;
  @ApiProperty() name: string;
  @ApiProperty() description: string;
  @ApiProperty() link: string;
  @ApiProperty({
    enum: GroupPlatform,
  })
  platform: GroupPlatform;
  @ApiPropertyOptional({ type: UiConfigDto }) uiConfig?: UiConfigDto;
  @ApiProperty() memberCount: number; // computed from Enrollment
}

// ─── Nested data shape ────────────────────────────────────────────────────────

export class DashboardDataDto {
  @ApiProperty({ type: [DashboardClassDto] }) classes: DashboardClassDto[];
  @ApiProperty({ type: [DashboardUpdateDto] }) updates: DashboardUpdateDto[];
  @ApiProperty({ type: [DashboardFacultyDto] }) faculty: DashboardFacultyDto[];
  @ApiProperty({ type: [DashboardGroupDto] }) groups: DashboardGroupDto[];
}

// ─── Root response ────────────────────────────────────────────────────────────

export class DashboardResponseDto {
  @ApiProperty() success: boolean;
  @ApiProperty() message: string;
  @ApiProperty({ type: DashboardDataDto }) data: DashboardDataDto;
}
