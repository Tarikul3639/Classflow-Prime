import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import {
  UpdateProfileDto,
  UpdateProfileResponseDto,
} from '../../dto/update-profile.dto';
import { User, UserDocument } from '../../../../infrastructure/database/entities/user.entity';
import type { IUser } from '../../../../infrastructure/database/interface/user.interface';

@Injectable()
export class UpdateProfileService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument & IUser>,
  ) {}

  async execute(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UpdateProfileResponseDto> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update fields if provided
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.bio !== undefined) user.bio = dto.bio;
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl;

    const updatedUser = await user.save();
    return {
      success: true,
      message: `Profile updated for user ${user.email}`,
      data: {
        user: {
          _id: updatedUser._id.toString(),
          name: updatedUser.name,
          email: updatedUser.email,
          avatarUrl: updatedUser.avatarUrl || undefined,
          bio: updatedUser.bio,
        },
      },
    };
  }
}
