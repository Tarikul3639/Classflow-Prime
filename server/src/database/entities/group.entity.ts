import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IClassGroup, GroupPlatform } from '../interface/group.interface';

export type GroupDocument = HydratedDocument<ClassGroup & IClassGroup>;

@Schema({ timestamps: true, strict: true })
export class ClassGroup implements IClassGroup {
  @Prop({ type: Types.ObjectId, ref: 'Class', required: true, index: true })
  classId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  description!: string;

  @Prop({ required: true })
  link!: string; // Group enroll link

  @Prop({
    required: true,
    enum: GroupPlatform,
    default: GroupPlatform.OTHER,
  })
  platform!: GroupPlatform;

  // Frontend-er UI config (just for better visuals, no functional impact)
  @Prop({
    type: {
      platformColor: String, // e.g., "text-emerald-600"
      platformBg: String, // e.g., "bg-emerald-50"
      iconName: String, // Icon identifier (e.g., "MessageCircle")
    },
    _id: false,
  })
  uiConfig?: {
    platformColor: string;
    platformBg: string;
    iconName: string;
  };

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy!: Types.ObjectId;
}

export const ClassGroupSchema = SchemaFactory.createForClass(ClassGroup);