import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';

import { RequestPasswordResetDto } from '../../dto/password-reset/request-password-reset.dto';

import { User, UserDocument } from '../../../../infrastructure/database/entities/user.entity';
import {
  Throttle,
  ThrottleDocument,
} from '../../../../infrastructure/database/entities/throttle.entity';
import {
  Verification,
  VerificationDocument,
} from '../../../../infrastructure/database/entities/verification.entity';

import { ThrottlePurpose } from '../../../../infrastructure/database/interface/throttle.interface';
import { MailService } from '../../../../infrastructure/mail/mail.service';

@Injectable()
export class RequestService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Throttle.name)
    private readonly throttleModel: Model<ThrottleDocument>,
    @InjectModel(Verification.name)
    private readonly verificationModel: Model<VerificationDocument>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  private get otpExpiryMinutes(): StringValue {
    return this.configService.get<StringValue>(
      'auth.passwordReset.otpExpiryMinutes',
      '15m',
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
      // 3️) Rate Limiting: Check Cooldown via Throttle Model
      let throttle = await this.throttleModel
        .findOne({
          identifier: email,
          purpose: ThrottlePurpose.PASSWORD_RESET,
        })
        .session(session);

      if (throttle && throttle.isBlocked()) {
        const remainingSec = Math.ceil(
          (throttle.expiresAt!.getTime() - Date.now()) / 1000,
        );
        throw new BadRequestException(
          `Please wait ${remainingSec}s before requesting a new code.`,
        );
      }

      // 4️) Security: Generate 6-digit Secure OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      // 5️) Data Persistence: Store/Update OTP in Verification collection
      await this.verificationModel.findOneAndUpdate(
        { identifier: email },
        {
          value: otpCode,
          expiresAt: new Date(Date.now() + ms(this.otpExpiryMinutes)),
        },
        { upsert: true, new: true, session },
      );

      // 6️) Traffic Management: Update or Create Throttle record
      if (!throttle) {
        throttle = new this.throttleModel({
          purpose: ThrottlePurpose.PASSWORD_RESET,
          ipAddress: ip,
          userAgent,
          identifier: email,
        });
      }
      throttle.expiresAt = new Date(Date.now() + ms(this.otpExpiryMinutes));
      await throttle.save({ session });

      // 7) Execution: Finalize Database Operations
      await session.commitTransaction();

      // 8️) Communication: Dispatch Password Reset Email
      // Note: Mail service handle safe approach after transaction
      await this.mailService.sendPasswordResetEmail(
        user.email,
        user.name,
        otpCode,
      );

      return {
        success: true,
        message: 'Password reset code sent to your email',
      };
    } catch (error) {
      // 9) Exception Handling: Rollback all changes if any step fails
      await session.abortTransaction();
      throw error;
    } finally {
      // 10) Resource Management: Close the database session
      session.endSession();
    }
  }
}
