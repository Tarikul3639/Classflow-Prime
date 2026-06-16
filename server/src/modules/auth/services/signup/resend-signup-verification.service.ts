import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { ResendSignupVerificationDto } from '../../dto/signup/resend-signup-verification.dto';
import { User, UserDocument } from '../../../../infrastructure/database/entities/user.entity';
import {
  Verification,
  VerificationDocument,
} from '../../../../infrastructure/database/entities/verification.entity';
import { MailService } from '../../../../infrastructure/mail/mail.service';
import { EmailValidator } from '../../../../common/utils/email-validator.util';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ResendSignupVerificationService {
  private readonly resendCooldownSeconds = 60;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Verification.name)
    private readonly verificationModel: Model<VerificationDocument>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  // TODO: Configure OTP expiry time in config
  private get otpExpiryMinutes(): number {
    return this.configService.get<number>(
      'signupVerification.otpExpiryMinutes',
      10,
    );
  }

  async execute(dto: ResendSignupVerificationDto) {
    const email = dto.email.toLowerCase().trim();

    // 1️) Validate email
    if (!EmailValidator.isValidFormat(email)) {
      throw new BadRequestException('Invalid email format');
    }
    EmailValidator.validateOrThrow(email);

    // 2️) Load user
    const user: UserDocument | null = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found');
    if (user.emailVerified)
      throw new BadRequestException('Email already verified');

    // 3️) Check last OTP cooldown
    const lastOtp = await this.verificationModel
      .findOne({ identifier: email })
      .sort({ createdAt: -1 })
      .exec();

    if (lastOtp?.createdAt) {
      const secondsSinceLast =
        (Date.now() - lastOtp.createdAt.getTime()) / 1000;
      if (secondsSinceLast < this.resendCooldownSeconds) {
        throw new BadRequestException(
          `Please wait ${Math.ceil(this.resendCooldownSeconds - secondsSinceLast)} seconds before resending`,
        );
      }
    }

    // 4️) Start MongoDB session for transaction
    const session = await this.verificationModel.db.startSession();
    session.startTransaction();

    try {
      // 5️) Generate OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
      const expiresAt = new Date(
        Date.now() + this.otpExpiryMinutes * 60 * 1000,
      );

      // 6️) Save OTP in transaction
      const verificationToken: VerificationDocument =
        new this.verificationModel({
          identifier: email,
          value: code,
          expiresAt,
        });

      await verificationToken.save({ session });

      // 7️) Send email
      await this.mailService.sendVerificationEmail(
        user.email,
        (user as { name?: string }).name || user.name,
        code,
      );

      // 8️) Commit transaction if email sent successfully
      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        message: 'Verification code resent successfully',
      };
    } catch (err) {
      // Abort transaction if any error occurs (email failed or save failed)
      await session.abortTransaction();
      session.endSession();

      throw new InternalServerErrorException(
        'Failed to resend verification email. Please try again later.',
      );
    }
  }
}
