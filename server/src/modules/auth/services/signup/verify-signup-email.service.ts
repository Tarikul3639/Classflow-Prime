import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { VerifySignupEmailDto } from '../../dto/signup/verify-signup-email.dto';
import { User, UserDocument } from '../../../../infrastructure/database/entities/user.entity';
import { IUser } from '../../../../infrastructure/database/interface/user.interface';
import {
  Account,
  AccountDocument,
} from '../../../../infrastructure/database/entities/account.entity';
import { AccountProvider } from '../../../../infrastructure/database/interface/account.interface';
import {
  Verification,
  VerificationDocument,
} from '../../../../infrastructure/database/entities/verification.entity';
import { ITokens } from '../token/token.types';

import { MailService } from '../../../../infrastructure/mail/mail.service';
import { TokenService } from '../token/token.service';
import { EmailValidator } from '../../../../common/utils/email-validator.util';

export class SignUpResponseDto {
  success!: boolean;
  message!: string;
  data!: {
    user: IUser | null;
    tokens: ITokens;
  };
}

@Injectable()
export class VerifySignupEmailService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,

    @InjectModel(Verification.name)
    private readonly verificationModel: Model<VerificationDocument>,

    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
  ) { }

  async execute(
    dto: VerifySignupEmailDto,
    ip: string,
    userAgent: string,
  ): Promise<SignUpResponseDto> {
    const email = dto.email.toLowerCase().trim();

    if (!EmailValidator.isValidFormat(email)) {
      throw new BadRequestException('Invalid email format');
    }

    EmailValidator.validateOrThrow(email);

    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found');

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const verificationToken = await this.verificationModel.findOne({
      identifier: email,
      value: dto.code,
      expiresAt: { $gt: new Date() },
    });

    if (!verificationToken) {
      throw new ForbiddenException('Invalid or expired verification code');
    }

    const session = await this.userModel.db.startSession();

    try {
      session.startTransaction();

      user.emailVerified = true;
      await user.save({ session });

      await verificationToken.deleteOne({ session });

      const tokens: ITokens = await this.tokenService.createSession(
        user._id.toString(),
        user.email,
        user.role,
        ip,
        userAgent,
      );

      let account = await this.accountModel
        .findOne({
          userId: user._id,
          providerId: AccountProvider.PASSWORD,
        })
        .session(session);

      if (!account) {
        account = new this.accountModel({
          userId: user._id,
          accountId: email,
          providerId: AccountProvider.PASSWORD,
        });
      }

      await account.save({ session });

      await session.commitTransaction();
      session.endSession();

      await this.mailService.sendWelcomeEmail(user.email, user.name);

      const userData: IUser = {
        _id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
      };

      return {
        success: true,
        message: 'Email verified successfully',
        data: {
          user: userData,
          tokens,
        },
      };
    } catch (err) {
      await session.abortTransaction();
      session.endSession();

      throw new InternalServerErrorException(
        'Failed to verify email. Please try again.',
      );
    }
  }
}