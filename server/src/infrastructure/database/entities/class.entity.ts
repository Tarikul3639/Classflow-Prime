import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IClass, ClassStatus } from '../interface/class.interface';

export type ClassDocument = HydratedDocument<Class & IClass>;

@Schema({
  timestamps: true,
  strict: true,
})
export class Class implements IClass {
  @Prop({
    required: true,
    trim: true,
  })
  className!: string;

  @Prop({
    required: true,
    unique: true,
    minlength: 6,
    maxlength: 6,
  })
  enrollCode!: string; // Teacher generated code

  @Prop({
    trim: true,
    maxlength: 100,
  })
  department?: string; // e.g., "Computer Science"

  @Prop({
    trim: true,
    maxlength: 50,
  })
  semester?: string; // e.g., "Fall 2024"

  // UI Identity Fields
  @Prop({ default: '#3B82F6' }) // Default blue
  themeColor!: string;

  @Prop({
    type: String,
    default: null,
  })
  coverImage?: string | null;

  @Prop({
    enum: Object.values(ClassStatus),
    default: ClassStatus.ACTIVE,
    index: true,
  })
  status!: ClassStatus;

  @Prop({ default: true })
  allowEnroll!: boolean;
}

export const ClassSchema = SchemaFactory.createForClass(Class);

// ==================== Indexes ====================
ClassSchema.index({ className: 'text' }); // for text search