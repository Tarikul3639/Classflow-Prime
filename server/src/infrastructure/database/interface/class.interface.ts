import { Types } from 'mongoose';

export enum ClassStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
  UPCOMING = 'upcoming',
}

export interface IClass {
  _id?: Types.ObjectId | string;
  name: string;
  enrollCode: string; // unique code for enrolling
  instructorId: Types.ObjectId; // ID of the instructor
  department?: string; // e.g., "Computer Science"
  semester?: string; // e.g., "Fall 2024"
  allowEnroll?: boolean; // Whether students can enroll using the enroll code
  themeColor?: string; // UI theme color (e.g., "#3B82F6")
  coverImage?: string; // Cover image URL (e.g., "https://example.com/image.png")
  status: ClassStatus; // active, ended, upcoming
  createdAt?: Date;
  updatedAt?: Date;
}
