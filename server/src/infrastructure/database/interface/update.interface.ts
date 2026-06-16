import { Types } from 'mongoose';

export enum UpdateCategory {
  ANNOUNCEMENT = 'announcement',
  ASSIGNMENT = 'assignment',
  EXAM = 'exam',
  MATERIAL = 'material',
}

export interface IClassUpdate {
  _id?: Types.ObjectId | string;
  classId: Types.ObjectId; // ID of the class this update belongs to
  title: string; // Short title for the update (e.g., "Midterm Exam Announcement")
  description: string; // Detailed description of the update
  category: UpdateCategory; // Category of the update
  eventAt?: Date; // Optional date related to the update (e.g., exam date)
  materials: Types.ObjectId[]; // Array of material IDs related to the update
  postedBy: Types.ObjectId; // ID of the user (instructor or assistant) who posted the update
  createdAt?: Date;
  updatedAt?: Date;
}
