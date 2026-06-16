import { BadRequestException, Logger } from '@nestjs/common';
import { DISPOSABLE_EMAIL_DOMAINS } from './disposable-email-domains';

/**
 * Email Validation Utility
 * Reusable utility for email domain validation
 * - Checks against disposable/temporary email services
 * - Validates email format
 * - Can be extended with external API validation
 */
export class EmailValidator {
  private static readonly logger = new Logger(EmailValidator.name);

  // List of disposable/temporary email domains
  private static readonly DISPOSABLE_DOMAINS = [...DISPOSABLE_EMAIL_DOMAINS];

  /**
   * Extract domain from email address
   */
  private static extractDomain(email: string): string | null {
    const parts = email.toLowerCase().split('@');
    return parts.length === 2 ? parts[1] : null;
  }

  /**
   * Check if email domain is disposable
   */
  static isDisposable(email: string): boolean {
    const domain = this.extractDomain(email);

    if (!domain) {
      return false;
    }

    return this.DISPOSABLE_DOMAINS.some(
      (disposableDomain) =>
        domain === disposableDomain || domain.endsWith(`.${disposableDomain}`),
    );
  }

  /**
   * Validate email and throw exception if disposable
   */
  static validateOrThrow(email: string): void {
    if (this.isDisposable(email)) {
      const domain = this.extractDomain(email);
      this.logger.warn(
        `Disposable email rejected: ${email} (domain: ${domain})`,
      );
      throw new BadRequestException(
        'Temporary or disposable email addresses are not allowed. Please use a valid email address.',
      );
    }
  }

  /**
   * Validate email format (basic check)
   */
  static isValidFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Comprehensive email validation
   */
  static validate(email: string): {
    isValid: boolean;
    isDisposable: boolean;
    domain: string | null;
  } {
    return {
      isValid: this.isValidFormat(email),
      isDisposable: this.isDisposable(email),
      domain: this.extractDomain(email),
    };
  }

  /**
   * Add custom disposable domain to blacklist
   */
  static addDisposableDomain(domain: string): void {
    if (!this.DISPOSABLE_DOMAINS.includes(domain.toLowerCase())) {
      this.DISPOSABLE_DOMAINS.push(domain.toLowerCase());
      this.logger.log(`Added disposable domain: ${domain}`);
    }
  }
}
