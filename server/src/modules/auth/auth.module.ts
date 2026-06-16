import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Controllers
import { SigninController } from './controllers/signin.controller';
import { SignoutController } from './controllers/signout.controller';
import { SignupController } from './controllers/signup.controller';
import { PasswordResetController } from './controllers/password-reset.controller';
import { DebugController } from './controllers/debug.controller';

// Services
import { TokenService } from './services/token/token.service';
import { AuthThrottleService } from './services/throttle/auth-throttle.service';
import { SignInService } from './services/signin/signin.service';
import { SignOutService } from './services/signout/signout.service';
import { SignUpService } from './services/signup/signup.service';
import { VerifySignupEmailService } from './services/signup/verify-signup-email.service';
import { ResendSignupVerificationService } from './services/signup/resend-signup-verification.service';
import { RequestService } from './services/password-reset/request.service';
import { ResendOtpService } from './services/password-reset/resend-otp.service';
import { VerifyOtpService } from './services/password-reset/verify-otp.service';
import { ResetPasswordService } from './services/password-reset/reset-password.service';

// Modules
import { MailModule } from '../../infrastructure/mail/mail.module';

// Schemas
import { User, UserSchema } from '../../infrastructure/database/entities/user.entity';
import { Throttle, ThrottleSchema } from '../../infrastructure/database/entities/throttle.entity';
import { Account, AccountSchema } from '../../infrastructure/database/entities/account.entity';
import { Session, SessionSchema } from '../../infrastructure/database/entities/session.entity';
import { Verification, VerificationSchema } from '../../infrastructure/database/entities/verification.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Throttle.name, schema: ThrottleSchema },
      { name: Account.name, schema: AccountSchema },
      { name: Session.name, schema: SessionSchema },
      { name: Verification.name, schema: VerificationSchema },
    ]),
    MailModule,
  ],
  controllers: [
    SigninController,
    SignoutController,
    SignupController,
    PasswordResetController,
    DebugController,
  ],
  providers: [
    TokenService,
    AuthThrottleService,
    SignInService,
    SignOutService,
    SignUpService,
    VerifySignupEmailService,
    ResendSignupVerificationService,
    RequestService,
    ResendOtpService,
    VerifyOtpService,
    ResetPasswordService,
  ],
  exports: [
    TokenService,
    AuthThrottleService,
  ],
})
export class AuthModule {}