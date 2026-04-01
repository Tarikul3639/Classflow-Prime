import { Types } from 'mongoose';

export enum UserRole {
  USER = 'student',
  ADMIN = 'admin',
  TEACHER = 'teacher',
}

export interface IUser {
  _id?: Types.ObjectId | string; // MongoDB ObjectId as string
  name: string;
  role: UserRole;
  email: string;
  emailVerified: boolean;
  avatarUrl?: string | null;
  bio?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
