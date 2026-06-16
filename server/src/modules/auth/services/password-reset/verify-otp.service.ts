import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import ms, { StringValue } from 'ms';
import * as crypto from 'crypto';

import { VerifyPasswordResetDto } from '../../dto/password-reset/verify-password-reset.dto';
import { User, UserDocument } from '../../../../infrastructure/database/entities/user.entity';
import {
  Verification,
  VerificationDocument,
} from '../../../../infrastructure/database/entities/verification.entity';

/**
 * Service: VerifyOtpService
 *
 * Purpose:
 * Handles OTP verification for password reset and issues a temporary reset token.
 *
 * Flow:
 * 1. Validate user existence by email
 * 2. Retrieve latest verification record
 * 3. Verify OTP (value + expiry)
 * 4. Generate a secure temporary reset token
 * 5. Replace OTP with reset token (one-time transition)
 * 6. Extend expiry for reset step
 * 7. Return reset token to client
 */
@Injectable()
export class VerifyOtpService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Verification.name)
    private readonly verificationModel: Model<VerificationDocument>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Token expiry duration for password reset step
   * Example: '15m', '10m'
   */
  private get tokenExpireDuration(): StringValue {
    return this.configService.get<StringValue>(
      'auth.passwordReset.otpExpiryMinutes',
      '15m',
    );
  }

  async execute(dto: VerifyPasswordResetDto) {
    const email = dto.email.toLowerCase().trim();

    /**
     * Step 1: Ensure user exists
     */
    const user: UserDocument | null = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    /**
     * Step 2: Retrieve verification record (OTP)
     */
    const verification = await this.verificationModel.findOne({
      identifier: email,
    });

    /**
     * Step 3: Validate OTP
     * - Matches code
     * - Not expired
     */
    if (!verification || !verification.verify(dto.code)) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    /**
     * Step 4: Generate secure temporary reset token
     * - Used for next step (password update)
     * - Prevents reusing OTP again
     */
    const passwordResetToken = crypto.randomBytes(32).toString('hex');

    /**
     * Step 5: Replace OTP with reset token
     * - Converts verification record into reset authorization
     */
    verification.value = passwordResetToken;

    /**
     * Step 6: Extend expiry for reset step
     */
    verification.expiresAt = new Date(
      Date.now() + ms(this.tokenExpireDuration),
    );

    await verification.save();

    /**
     * Step 7: Return reset token to client
     * - Frontend must send this token in next request
     */
    return {
      success: true,
      message: 'Reset code verified successfully',
      data: {
        resetToken: passwordResetToken,
      },
    };
  }
}
