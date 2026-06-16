export interface IVerification {
  identifier: string; // email or phone
  value: string; // OTP or token
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IVerificationMethods {
  isExpired(): boolean;
  verify(token: string): boolean;
}
