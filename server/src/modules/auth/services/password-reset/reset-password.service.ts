import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ResetPasswordDto } from '../../dto/password-reset/reset-password.dto';

import { User, UserDocument } from '../../../../infrastructure/database/entities/user.entity';
import {
  Account,
  AccountDocument,
} from '../../../../infrastructure/database/entities/account.entity';
import {
  Session,
  SessionDocument,
} from '../../../../infrastructure/database/entities/session.entity';
import {
  Verification,
  VerificationDocument,
} from '../../../../infrastructure/database/entities/verification.entity';

import { AccountProvider } from '../../../../infrastructure/database/interface/account.interface';

import { MailService } from '../../../../infrastructure/mail/mail.service';

/**
 * Service: ResetPasswordService
 *
 * Purpose:
 * Handles final password reset using a verified reset token.
 *
 * Flow:
 * 1. Validate user existence
 * 2. Verify reset token (from previous OTP step)
 * 3. Start DB transaction for atomic operations
 * 4. Update user's password
 * 5. Invalidate reset token (one-time use)
 * 6. Revoke all active sessions
 * 7. Notify user via email
 */
@Injectable()
export class ResetPasswordService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
    @InjectModel(Verification.name)
    private readonly verificationModel: Model<VerificationDocument>,
    private readonly mailService: MailService,
  ) {}

  async execute(dto: ResetPasswordDto) {
    const { email, resetToken, newPassword } = dto;

    /**
     * Step 1: Validate user existence
     */
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found');

    /**
     * Step 2: Validate reset token
     * - Must match stored token
     * - Must not be expired
     */
    const verification = await this.verificationModel.findOne({
      identifier: email,
      value: resetToken,
    });

    if (!verification || verification.isExpired()) {
      throw new BadRequestException(
        'Invalid or expired reset session. Please verify again.',
      );
    }

    /**
     * Step 3: Start database transaction
     * Ensures all operations succeed or fail together (atomicity)
     */
    const dbSession = await this.userModel.db.startSession();
    dbSession.startTransaction();

    try {
      /**
       * Step 4: Retrieve password-based account
       */
      const account = await this.accountModel
        .findOne({
          userId: user._id,
          providerId: AccountProvider.PASSWORD,
        })
        .session(dbSession);

      if (!account) {
        throw new NotFoundException('Password account not found for this user');
      }

      /**
       * Step 5: Update password securely
       * - Uses schema method to hash password before saving
       */
      await account.setPassword(dto.newPassword);
      await account.save({ session: dbSession });

      /**
       * Step 6: Invalidate reset token (one-time use)
       */
      await this.verificationModel
        .deleteOne({ _id: verification._id })
        .session(dbSession);

      /**
       * Step 7: Revoke all active sessions
       * - Forces logout from all devices
       */
      await this.sessionModel
        .deleteMany({ userId: user._id })
        .session(dbSession);

      /**
       * Commit transaction after all operations succeed
       */
      await dbSession.commitTransaction();

      /**
       * Step 8: Send notification email (non-blocking)
       */
      try {
        await this.mailService.sendPasswordChangedEmail(user.email, user.name);
      } catch (mailError) {
        // Do not interrupt main flow if email fails
      }

      return {
        success: true,
        message:
          'Password reset successfully. Please login with your new password.',
      };
    } catch (error) {
      /**
       * Rollback all changes if any step fails
       */
      await dbSession.abortTransaction();
      throw error;
    } finally {
      /**
       * End DB session
       */
      dbSession.endSession();
    }
  }
}
