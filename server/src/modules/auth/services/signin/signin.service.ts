import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { SignInDto } from '../../dto/signin/signin.dto';
import { TokenService } from '../token/token.service';
import { User, UserDocument } from '../../../../infrastructure/database/entities/user.entity';
import {
  Account,
  AccountDocument,
} from '../../../../infrastructure/database/entities/account.entity';
import { AccountProvider } from '../../../../infrastructure/database/interface/account.interface';
import { ThrottlePurpose } from '../../../../infrastructure/database/interface/throttle.interface';
import { AuthThrottleService } from '../throttle/auth-throttle.service';
import { ITokens } from '../token/token.types';
import { IUser } from '../../../../infrastructure/database/interface/user.interface';

export class SignInResponseDto {
  success!: boolean;
  message!: string;
  data!: {
    user: IUser;
    tokens: ITokens;
  };
}

@Injectable()
export class SignInService {
  private readonly maxAttempts = 5;
  private readonly lockMinutes = 30;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,
    private readonly tokenService: TokenService,
    private readonly throttle: AuthThrottleService,
  ) {}

  async execute(
    dto: SignInDto,
    ip: string,
    userAgent: string,
  ): Promise<SignInResponseDto> {
    const email = dto.email.toLowerCase().trim();

    // 1️) Throttle check to prevent Brute-Force
    const t = await this.throttle.assertNotLocked({
      key: email,
      ip,
      purpose: ThrottlePurpose.SIGN_IN,
      userAgent,
    });

    // 2️) Load User by email
    const user = await this.userModel.findOne({ email });
    if (!user) {
      await this.handleFailure(t);
      throw new UnauthorizedException('No account found with this email');
    }

    // 3️) Load Account for password verification
    // In standard, passwords live in the Account entity linked to 'password' provider
    const account = await this.accountModel
      .findOne({
        userId: user._id,
        providerId: AccountProvider.PASSWORD,
      })
      .select('+password');

    if (!account) {
      await this.handleFailure(t);
      throw new UnauthorizedException('Invalid credentials');
    }

    // 4️) Password Verification
    const isPasswordMatch = await account.comparePassword(dto.password);
    if (!isPasswordMatch) {
      await this.handleFailure(t);
      throw new UnauthorizedException('Password is incorrect');
    }

    // 5️) Success: Reset Throttling & Issue Tokens + Create Session
    await this.throttle.success(t);

    // This method now generates JWTs AND saves a hashed session in the Session collection
    const tokens = await this.tokenService.createSession(
      user._id.toString(),
      user.email,
      user.role,
      ip,
      userAgent,
    );

    // DEBUG: Add near SignInService after tokens are generated:
    console.log(
      '[DEBUG sign-in] refreshToken (truncated):',
      tokens.refreshToken?.slice(0, 50),
    );

    return {
      success: true,
      message: 'Signed in successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
        tokens,
      },
    };
  }

  /**
   * Internal helper to handle login failure logic
   */
  private async handleFailure(throttleDoc: any) {
    await this.throttle.fail(throttleDoc, {
      maxAttempts: this.maxAttempts,
      lockMinutes: this.lockMinutes,
    });
  }
}
