import { Types } from 'mongoose';

export interface IFaculty {
  _id?: Types.ObjectId | string; // MongoDB ObjectId as string
  classId: Types.ObjectId; // Which class this faculty belongs to
  name: string;
  avatarUrl?: string; // Optional avatar image URL
  designation: string; // e.g., Lecturer, Asst. Professor
  location: string; // Desk/Office location (e.g., "Room 402, Dept of CSE")
  email: string;
  phone?: string;
  classroomCode?: string; // Teacher's personal Google Classroom code
}
