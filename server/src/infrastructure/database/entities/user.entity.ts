import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IUser, UserRole } from '../interface/user.interface';

export type UserDocument = HydratedDocument<User & IUser>;

@Schema({
  timestamps: true, // createdAt & updatedAt
  strict: true, // only defined fields are allowed
})
export class User implements IUser {
  // Full name of the user
  @Prop({
    required: true,
    trim: true,
  })
  name!: string;

  // User role (e.g., 'user', 'admin')
  @Prop({
    required: true,
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  // Unique email (lowercase)
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email!: string;

  // Has the user verified email
  @Prop({
    required: true,
    default: false,
  })
  emailVerified!: boolean;

  // Optional avatar image URL
  @Prop({
    type: String,
    default: null,
  })
  avatarUrl?: string | null;

  // Short bio / profile info
  @Prop({
    trim: true,
    maxlength: 500,
  })
  bio?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);