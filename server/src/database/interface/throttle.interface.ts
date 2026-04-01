import { Types } from 'mongoose';

export enum ThrottlePurpose {
  SIGN_IN = 'sign_in',
  OTP_VERIFY = 'otp_verify',
  OTP_REQUEST = 'otp_request',
  PASSWORD_RESET = 'password_reset',
}

export interface IThrottle {
  _id?: Types.ObjectId | string;
  purpose: ThrottlePurpose; // sign_in, otp_verify, etc.
  ipAddress: string;
  identifier?: string; // optional: email/phone/username
  attempts: number;
  expiresAt?: Date;
  userAgent?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IThrottleMethods {
  increment(attemptWindowMinutes?: number): void;
  reset(): void;
  isBlocked(): boolean;
}
