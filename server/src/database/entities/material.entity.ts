import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IMaterial, MaterialType } from '../interface/material.interface';

export type MaterialDocument = HydratedDocument<Material & IMaterial>;

@Schema({ timestamps: true })
export class Material implements IMaterial {
  @Prop({ type: Types.ObjectId, ref: 'Class', required: true, index: true })
  classId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'ClassUpdate',
    required: true,
    index: true,
  })
  updateId!: Types.ObjectId; // Which update this material belongs to

  @Prop({ type: String, required: true })
  url!: string; // File URL

  @Prop({ type: String })
  name?: string; // Original file name

  @Prop({ type: String, enum: MaterialType, required: true })
  type!: MaterialType; // Type of material (file, image, video, link)

  @Prop({ type: Number })
  size?: number; // File size in bytes

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploadedBy!: Types.ObjectId; // Instructor / assistant
}

export const MaterialSchema = SchemaFactory.createForClass(Material);