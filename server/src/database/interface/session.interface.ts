import { Types } from 'mongoose';

export interface ISession {
  _id?: Types.ObjectId | string;
  userId: Types.ObjectId;
  token: string; // hashed token
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISessionMethods {
  setToken(rawToken: string): Promise<void>;
  compareToken(rawToken: string): Promise<boolean>;
  isExpired(): boolean;
}
