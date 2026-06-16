import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { SignUpDto } from '../../dto/signup/signup.dto';
import { User, UserDocument } from '../../../../infrastructure/database/entities/user.entity';
import {
  Account,
  AccountDocument,
} from '../../../../infrastructure/database/entities/account.entity';
import { AccountProvider } from '../../../../infrastructure/database/interface/account.interface';
import {
  Verification,
  VerificationDocument,
} from '../../../../infrastructure/database/entities/verification.entity';
import { IUser } from '../../../../infrastructure/database/interface/user.interface';
import { IVerification } from '../../../../infrastructure/database/interface/verification.interface';

import { MailService } from '../../../../infrastructure/mail/mail.service';
import { EmailValidator } from '../../../../common/utils/email-validator.util';

@Injectable()
export class SignUpService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument & IUser>,
    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,
    @InjectModel(Verification.name)
    private readonly verificationModel: Model<
      VerificationDocument & IVerification
    >,
    private readonly mailService: MailService,
  ) {}

  async execute(dto: SignUpDto) {
    const email = dto.email.toLowerCase().trim();

    // 1️) Validate email format
    if (!EmailValidator.isValidFormat(email)) {
      throw new BadRequestException('Invalid email format');
    }

    // 2️) Disposable / temporary email block
    EmailValidator.validateOrThrow(email);

    const session = await this.userModel.db.startSession();
    session.startTransaction();

    try {
      // 3️) Check existing user
      let user = await this.userModel.findOne({ email }).session(session);

      if (user?.emailVerified) {
        throw new ConflictException('Email is already registered');
      }

      if (!user) {
        // 4️) Create new user (emailVerified=false)
        user = new this.userModel({
          name: dto.name,
          email,
          avatarUrl: dto.avatarUrl,
          emailVerified: false,
        });
        await user.save({ session });
      } else {
        // 5️) Resume signup for existing unverified user
        user.name = dto.name;
        user.avatarUrl = dto.avatarUrl;
        await user.save({ session });
      }

      // 6️) Create / update account for email login
      let account: AccountDocument | null = await this.accountModel
        .findOne({
          userId: user._id,
          providerId: AccountProvider.PASSWORD,
        })
        .session(session);

      if (!account) {
        account = new this.accountModel({
          userId: user._id,
          accountId: email, // email as unique accountId
          providerId: AccountProvider.PASSWORD,
        });
      }

      if (dto.password) {
        await account.setPassword(dto.password); // hashes password
      }

      await account.save({ session });

      // 7️) Generate verification token (6-digit OTP)
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

      const verificationToken: VerificationDocument & IVerification =
        new this.verificationModel({
          identifier: email,
          value: code,
          expiresAt,
        });

      await verificationToken.save({ session });

      // 8️) Send verification email
      await this.mailService.sendVerificationEmail(user.email, user.name, code);

      await session.commitTransaction();
      session.endSession();

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
        message: 'Signup successful. Verification code sent to email.',
        data: {
          user: userData,
        },
      };
    } catch (err: unknown) {
      await session.abortTransaction();
      session.endSession();

      if (err instanceof ConflictException) throw err;

      throw new InternalServerErrorException(
        'An error occurred during signup. Please try again.',
      );
    }
  }
}
