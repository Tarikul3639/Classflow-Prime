import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';

interface BaseEmailContext {
  appName: string;
  year: number;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  private get frontendUrl(): string {
    return this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
  }

  private get verificationCodeExpiresIn(): StringValue {
    return this.configService.get<StringValue>(
      'mail.verificationCodeExpiresIn',
      '15m',
    );
  }

  private buildAppUrl(path: string): string {
    const base = this.frontendUrl.replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalizedPath}`;
  }

  private baseContext(): BaseEmailContext {
    return {
      appName: 'ClassFlow Academic Tracker',
      year: new Date().getFullYear(),
    };
  }

  async sendVerificationEmail(email: string, name: string, code: string) {
    const subject = 'Verify your email address';
    try {
      await this.mailerService.sendMail({
        to: email,
        subject,
        template: './verification', // templates/verification.hbs
        context: {
          ...this.baseContext(),
          name,
          username: name,
          email,
          code,
          title: 'Verify your email',
          expirationMinutes: this.verificationCodeExpiresIn,
          supportEmail: 'support@classflow.com',
        },
      });

      this.logger.log(`Verification email sent to ${email}`);
      return true;
    } catch (error: any) {
      this.logger.error(
        `Failed to send verification email to ${email}`,
        error?.stack || error?.message,
      );
      // In production, you might not want to throw to avoid leaking mail details
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, name: string, code: string) {
    const subject = 'Reset your password';
    try {
      await this.mailerService.sendMail({
        to: email,
        subject,
        template: './verification', // templates/password-reset.hbs
        context: {
          ...this.baseContext(),
          email,
          name,
          username: name,
          code,
          title: 'Reset your password',
          expirationMinutes: this.verificationCodeExpiresIn,
          supportEmail: 'support@classflow.com',
        },
      });

      this.logger.log(`Password reset email sent to ${email}`);
      return true;
    } catch (error: any) {
      this.logger.error(
        `Failed to send password reset email to ${email}`,
        error?.stack || error?.message,
      );
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, name: string) {
    const subject = 'Welcome to ClassFlow!';
    try {
      await this.mailerService.sendMail({
        to: email,
        subject,
        template: './welcome', // templates/welcome.hbs
        context: {
          ...this.baseContext(),
          name,
          dashboardUrl: this.buildAppUrl('/'),
          supportEmail: 'support@classflow.com',
        },
      });

      this.logger.log(`Welcome email sent to ${email}`);
      return true;
    } catch (error: any) {
      this.logger.error(
        `Failed to send welcome email to ${email}`,
        error?.stack || error?.message,
      );
      // Welcome mail failing should not break signup verification
      return false;
    }
  }

  async sendPasswordChangedEmail(email: string, name: string) {
    const subject = 'Your password was changed - ClassFlow';
    try {
      await this.mailerService.sendMail({
        to: email,
        subject,
        template: './password-changed', // templates/password-changed.hbs
        context: {
          ...this.baseContext(),
          name,
          changedAt: new Date().toLocaleString(),
          signinUrl: this.buildAppUrl('/sign-in'),
          supportUrl: this.buildAppUrl('/support'),
          supportEmail: 'support@classflow.com',
        },
      });

      this.logger.log(`Password changed email sent to ${email}`);
      return true;
    } catch (error: any) {
      this.logger.error(
        `Failed to send password changed email to ${email}`,
        error?.stack || error?.message,
      );
      // Security email failing should not block password reset
      return false;
    }
  }
}
