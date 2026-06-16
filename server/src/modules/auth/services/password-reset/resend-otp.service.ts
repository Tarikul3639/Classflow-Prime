import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import ms, { StringValue } from 'ms';

import { RequestPasswordResetDto } from '../../dto/password-reset/request-password-reset.dto';

import { User, UserDocument } from '../../../../infrastructure/database/entities/user.entity';
import {
  Throttle,
  ThrottleDocument,
} from '../../../../infrastructure/database/entities/throttle.entity';
import { ThrottlePurpose } from '../../../../infrastructure/database/interface/throttle.interface';
import {
  Verification,
  VerificationDocument,
} from '../../../../infrastructure/database/entities/verification.entity';

import { MailService } from '../../../../infrastructure/mail/mail.service';

@Injectable()
export class ResendOtpService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Throttle.name)
    private readonly throttleModel: Model<ThrottleDocument>,
    @InjectModel(Verification.name)
    private readonly verificationModel: Model<VerificationDocument>,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  // Duration for how long the OTP will remain valid
  private get otpExpiryDuration(): StringValue {
    return this.configService.get<StringValue>(
      'auth.passwordReset.otpExpiryDuration',
      '15m',
    );
  }

  // Duration the user must wait before resending
  private get cooldownDuration(): StringValue {
    return this.configService.get<StringValue>(
      'auth.passwordReset.cooldownDuration',
      '60s',
    );
  }

  async execute(dto: RequestPasswordResetDto, ip: string, userAgent: string) {
    const email = dto.email.toLowerCase().trim();

    // 1️) Identity Verification: Check if user exists
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2) Initialize Database Session for Atomic Transactions
    const session = await this.userModel.db.startSession();
    session.startTransaction();

    try {
      // 3️) Rate Limiting: Check cooldown to prevent SMTP spam
      let throttle = await this.throttleModel
        .findOne({
          purpose: ThrottlePurpose.PASSWORD_RESET,
          ipAddress: ip,
          userAgent: userAgent,
          identifier: email,
        })
        .session(session);

      if (throttle && throttle.isBlocked()) {
        const retryAfter = Math.ceil(
          (throttle.expiresAt!.getTime() - Date.now()) / 1000,
        );
        throw new BadRequestException(
          `Too many requests. Please try again after ${retryAfter} seconds.`,
        );
      }

      // 4️) Security: Generate new 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      // 5️) Data Persistence: Update OTP in Verification collection
      await this.verificationModel.findOneAndUpdate(
        { identifier: email },
        {
          value: otpCode,
          expiresAt: new Date(Date.now() + ms(this.otpExpiryDuration)),
        },
        { upsert: true, session },
      );

      // 6️) Traffic Management: Update Throttle record with cooldown
      if (!throttle) {
        throttle = new this.throttleModel({
          purpose: ThrottlePurpose.PASSWORD_RESET,
          ipAddress: ip,
          userAgent: userAgent,
          identifier: email,
        });
      }
      // Cooldown duration added e.g., 60s from now
      throttle.expiresAt = new Date(Date.now() + ms(this.cooldownDuration));
      await throttle.save({ session });

      // 7) Execution: Finalize Database Operations
      await session.commitTransaction();

      // 8️) Communication: Dispatch the new OTP email
      await this.mailService.sendPasswordResetEmail(
        user.email,
        user.name,
        otpCode, // fixed: using the correct variable name
      );

      return {
        success: true,
        message: 'Password reset code resent successfully',
      };
    } catch (error) {
      // 9) Exception Handling: Rollback if any step fails
      await session.abortTransaction();
      throw error;
    } finally {
      // 10) Resource Management: Close session
      session.endSession();
    }
  }
}
