import { Types } from 'mongoose';

export enum AccountProvider {
  GOOGLE = 'google',
  GITHUB = 'github',
  FACEBOOK = 'facebook',
  PASSWORD = 'password',
}

export interface IAccount {
  _id?: Types.ObjectId | string; // MongoDB ObjectId as string
  userId: Types.ObjectId; // User _id
  accountId: string; // Provider-specific user ID
  providerId: AccountProvider;
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date;
  scope?: string;
  idToken?: string;
  password?: string; // hashed password
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAccountMethods {
  setPassword(rawPassword: string): Promise<void>;
  comparePassword(rawPassword: string): Promise<boolean>;

  setAccessToken(token: string): Promise<void>;
  compareAccessToken(token: string): Promise<boolean>;

  setRefreshToken(token: string): Promise<void>;
  compareRefreshToken(token: string): Promise<boolean>;

  isAccessTokenExpired(): boolean;
  isRefreshTokenExpired(): boolean;
}
