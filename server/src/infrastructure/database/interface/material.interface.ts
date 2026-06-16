import { Types } from 'mongoose';

export enum MaterialType {
  PDF = 'pdf',
  DOCX = 'docx',
  IMAGE = 'image',
  VIDEO = 'video',
  LINK = 'link',
}

export interface IMaterial {
  _id?: Types.ObjectId | string;
  classId: Types.ObjectId; // Which class this material belongs to
  updateId: Types.ObjectId; // Which update this material belongs to
  type: MaterialType; // Type of material (file, image, video, link)
  name?: string; // Original file name or link title
  description?: string;
  url: string; // URL to the material (could be a file link, video link, etc.)
  createdAt?: Date;
  updatedAt?: Date;
}
