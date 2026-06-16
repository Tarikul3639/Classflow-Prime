import { IUser } from '../../../infrastructure/database/interface/user.interface';

/**
 * Token response structure
 */
export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

/**
 * Base auth response
 */
export interface IAuthResponse {
  message: string;
  user: Partial<IUser>;
  tokens: IAuthTokens;
}

/**
 * Signup response
 */
export interface ISignUpResponse extends IAuthResponse {
  message: string;
  user: Partial<IUser>;
  tokens: IAuthTokens;
}

/**
 * Signin response
 */
export interface ISignInResponse extends IAuthResponse {
  emailVerified: boolean;
}

/**
 * Verify email response
 */
export interface IVerifyEmailResponse {
  message: string;
  user: Partial<IUser>;
}

/**
 * Resend verification response
 */
export interface IResendVerificationResponse {
  message: string;
}

/**
 * Sign out response
 */
export interface ISignOutResponse {
  message: string;
}

/**
 * Get current user response
 */
export interface ICurrentUserResponse {
  user: Partial<IUser>;
}
