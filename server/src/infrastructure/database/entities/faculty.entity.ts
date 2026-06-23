import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IFaculty } from '../interface/faculty.interface';

export type FacultyDocument = HydratedDocument<Faculty & IFaculty>;

@Schema({
  timestamps: true, // createdAt & updatedAt
  strict: true, // only defined fields are allowed
})
export class Faculty implements IFaculty {
  @Prop({ type: Types.ObjectId, ref: 'Class', required: true, index: true })
  classId!: Types.ObjectId; // Which class this faculty belongs to

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true })
  avatarUrl?: string; // Optional avatar image URL

  @Prop({ required: true, trim: true })
  designation!: string; // e.g., Lecturer, Asst. Professor

  @Prop({ trim: true })
  location!: string; // Desk/Office location (e.g., "Room 402, Dept of CSE")

  @Prop({ required: true, trim: true, lowercase: true })
  email!: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  classroomCode?: string; // Teacher's personal Google Classroom code

  @Prop({ trim: true })
  classroomInviteLink?: string; // Optional invite link for students to join the class directly
}

export const FacultySchema = SchemaFactory.createForClass(Faculty);