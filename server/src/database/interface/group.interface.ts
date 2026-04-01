import { Types } from 'mongoose';

export enum GroupPlatform {
  WHATSAPP = 'WhatsApp',
  DISCORD = 'Discord',
  TELEGRAM = 'Telegram',
  FACEBOOK = 'Facebook',
  MESSENGER = 'Messenger',
  OTHER = 'Other',
}

export interface IClassGroup {
  _id?: Types.ObjectId | string; // MongoDB ObjectId as string
  classId: Types.ObjectId; // Which class this group belongs to
  name: string; // Group name (e.g., "Project Team A")
  description?: string; // Optional description of the group
  link: string; // Group enroll link
  platform: GroupPlatform; // Platform of the group

  // Frontend-er UI config (just for better visuals, no functional impact)
  uiConfig?: {
    platformColor: string; // e.g., "text-emerald-600"
    platformBg: string; // e.g., "bg-emerald-50"
    iconName: string; // Icon identifier (e.g., "MessageCircle")
  };
  createdBy: Types.ObjectId; // Who created this group
  createdAt?: Date;
  updatedAt?: Date;
}
