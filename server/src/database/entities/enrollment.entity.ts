import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IEnrollment, EnrollmentRole } from '../interface/enrollment.interface';

export type EnrollmentDocument = HydratedDocument<Enrollment & IEnrollment>;

@Schema({
  timestamps: true,
  strict: true,
})
export class Enrollment implements IEnrollment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Class', required: true, index: true })
  classId!: Types.ObjectId;

  @Prop({
    enum: Object.values(EnrollmentRole),
    default: EnrollmentRole.LEARNER,
  })
  role!: EnrollmentRole;

  @Prop({ default: Date.now, index: true })
  enrolledAt!: Date;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);

// ==================== Indexes ====================
EnrollmentSchema.index({ userId: 1, classId: 1 }, { unique: true });