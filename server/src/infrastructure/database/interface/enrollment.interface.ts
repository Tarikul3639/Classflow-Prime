import type { Types } from 'mongoose';

export enum EnrollmentRole {
  INSTRUCTOR = 'instructor',
  ASSISTANT = 'assistant',
  LEARNER = 'learner',
}

export interface IEnrollment {
  userId: Types.ObjectId;
  classId: Types.ObjectId;
  role: EnrollmentRole;
  enrolledAt: Date;
}
