import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from '../../../../infrastructure/database/entities/user.entity';
import {
  Session,
  SessionDocument,
} from '../../../../infrastructure/database/entities/session.entity';
import { TokenService } from '../token/token.service';

@Injectable()
export class SignOutService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Handles sign out for a single session or all sessions
   */
  async execute(userId: string, refreshToken?: string) {
    // 1️) Verify user existence
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2️) Sign out from ALL devices
    if (!refreshToken) {
      await this.sessionModel.deleteMany({ userId: user._id });
      return { success: true, message: 'Signed out from all devices' };
    }

    // 3️) Sign out from current device only
    // This utilizes the logic already present in your TokenService
    try {
      await this.tokenService.revokeSession(refreshToken);
      return { success: true, message: 'Signout successful' };
    } catch (error) {
      // If token is already gone or invalid, we consider it signed out
      return { success: true, message: 'Signout successful' };
    }
  }

  /**
   * Helper to clear all active sessions for a user
   */
  async signOutAll(userId: string) {
    return this.execute(userId, undefined);
  }
}
