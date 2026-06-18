import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import type { IAgent, IAgentMethods, IAgentScopes } from '../interface/agent.interface';
import { AgentStatus } from '../interface/agent.interface';

export type AgentDocument = HydratedDocument<Agent & IAgent & IAgentMethods>;

@Schema({ timestamps: true, strict: true })
export class Agent implements IAgent {
  @Prop({ required: true, trim: true, maxlength: 100 })
  name!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Class' })
  classId!: Types.ObjectId;

  @Prop({ required: true, unique: true })
  apiKey!: string;

  @Prop({ required: true })
  apiKeyPrefix!: string;

  @Prop({
    type: {
      create: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    default: { create: false, update: false, delete: false },
  })
  scopes!: IAgentScopes;

  @Prop({
    required: true,
    enum: AgentStatus,
    default: AgentStatus.ACTIVE,
  })
  status!: AgentStatus;

  @Prop()
  expiresAt?: Date;

  @Prop()
  lastUsedAt?: Date;

  @Prop()
  createdAt!: Date;
  
  @Prop()
  updatedAt!: Date;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);

// ==================== Indexes ====================
AgentSchema.index({ userId: 1 });
AgentSchema.index({ classId: 1 });
AgentSchema.index({ apiKey: 1 });
AgentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ==================== Schema Methods ====================
AgentSchema.methods.setApiKey = function (rawKey: string) {
  this.apiKey = rawKey;
  const parts = rawKey.split('_');
  this.apiKeyPrefix = parts.length >= 2 ? `${parts[0]}_${parts[1]}` : rawKey.slice(0, 8);
};

AgentSchema.methods.compareApiKey = async function (rawKey: string): Promise<boolean> {
  return this.apiKey === rawKey;
};

AgentSchema.methods.isExpired = function (): boolean {
  return this.expiresAt ? this.expiresAt <= new Date() : false;
};

AgentSchema.methods.revoke = function () {
  this.status = AgentStatus.REVOKED;
};

AgentSchema.methods.touch = function () {
  this.lastUsedAt = new Date();
};