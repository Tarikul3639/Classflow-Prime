import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import {
  IAccount,
  AccountProvider,
  IAccountMethods,
} from '../interface/account.interface';

export type AccountDocument = HydratedDocument<
  Account & IAccount & IAccountMethods
>;

@Schema({
  timestamps: true,
})
export class Account implements IAccount {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'User',
  })
  userId!: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  accountId!: string; // unique ID given by the provider to identify the user (e.g., Google/GitHub ID)

  @Prop({
    required: true,
    enum: AccountProvider,
    trim: true,
  })
  providerId!: AccountProvider; // e.g., 'google', 'github', 'password'

  @Prop({
    select: false,
  })
  password?: string;

  @Prop()
  accessToken?: string; // NOTE: Access token from external provider (hashed for security, optional for password accounts)

  @Prop()
  refreshToken?: string; // NOTE: Refresh token from external provider (hashed for security, optional for password accounts)

  @Prop()
  accessTokenExpiresAt?: Date;

  @Prop()
  refreshTokenExpiresAt?: Date;

  @Prop()
  scope?: string;

  @Prop()
  idToken?: string; // For OpenID Connect providers, the raw ID token (JWT) returned by the provider (optional)
}

export const AccountSchema = SchemaFactory.createForClass(Account);

// ==================== Indexes ====================
AccountSchema.index({ providerId: 1, accountId: 1 }, { unique: true });
AccountSchema.index({ userId: 1 });

// ==================== Schema Methods ====================

AccountSchema.methods.setPassword = async function (rawPassword: string) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(rawPassword, salt);
};

AccountSchema.methods.comparePassword = async function (
  rawPassword: string,
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(rawPassword, this.password);
};

AccountSchema.methods.setAccessToken = async function (token: string) {
  const salt = await bcrypt.genSalt(10);
  this.accessToken = await bcrypt.hash(token, salt);
};

AccountSchema.methods.compareAccessToken = async function (
  token: string,
): Promise<boolean> {
  if (!this.accessToken) return false;
  return bcrypt.compare(token, this.accessToken);
};

AccountSchema.methods.setRefreshToken = async function (token: string) {
  const salt = await bcrypt.genSalt(10);
  this.refreshToken = await bcrypt.hash(token, salt);
};

AccountSchema.methods.compareRefreshToken = async function (
  token: string,
): Promise<boolean> {
  if (!this.refreshToken) return false;
  return bcrypt.compare(token, this.refreshToken);
};

AccountSchema.methods.isAccessTokenExpired =
  async function (): Promise<boolean> {
    return (
      !this.accessTokenExpiresAt || this.accessTokenExpiresAt <= new Date()
    );
  };

AccountSchema.methods.isRefreshTokenExpired =
  async function (): Promise<boolean> {
    return (
      !this.refreshTokenExpiresAt || this.refreshTokenExpiresAt <= new Date()
    );
  };
