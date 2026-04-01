import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IClassUpdate, UpdateCategory } from '../interface/update.interface';

export type ClassUpdateDocument = HydratedDocument<ClassUpdate & IClassUpdate>;

@Schema({ timestamps: true, strict: true })
export class ClassUpdate implements IClassUpdate {
  @Prop({ type: Types.ObjectId, ref: 'Class', required: true, index: true })
  classId: Types.ObjectId;

  @Prop({ required: true })
  title: string; // e.g., "CT-2 Date Fixed"

  @Prop()
  description: string; // Detail information

  @Prop({ enum: UpdateCategory, default: UpdateCategory.ANNOUNCEMENT })
  category: UpdateCategory;

  @Prop({ type: Date, index: true })
  eventAt?: Date; // Exam ba CT er date if applicable

  @Prop({ type: [Types.ObjectId], ref: 'Material', default: [] })
  materials: Types.ObjectId[]; // Populate with material details when needed

  @Prop({ default: false, index: true })
  isPinned: boolean; // For important updates that should be highlighted

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  postedBy: Types.ObjectId; // Instructor or assistant who posted the update
}

export const ClassUpdateSchema = SchemaFactory.createForClass(ClassUpdate);
