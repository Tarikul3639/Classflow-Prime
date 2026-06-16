import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  IThrottle,
  IThrottleMethods,
  ThrottlePurpose,
} from '../interface/throttle.interface';

export type ThrottleDocument = HydratedDocument<
  Throttle & IThrottle & IThrottleMethods
>;

@Schema({
  timestamps: true,
})
export class Throttle implements IThrottle {
  @Prop({
    required: true,
    enum: ThrottlePurpose,
  })
  purpose!: ThrottlePurpose;

  @Prop({
    required: true,
  })
  ipAddress!: string;

  @Prop({
    trim: true,
  })
  identifier?: string; // e.g., email or user ID for per-user throttling (optional)

  @Prop({
    default: 0,
  })
  attempts!: number;

  @Prop()
  expiresAt?: Date;

  @Prop()
  userAgent?: string;
}

export const ThrottleSchema = SchemaFactory.createForClass(Throttle);

// ==================== Indexes ====================

// Composite index for fast query: purpose + ipAddress
ThrottleSchema.index({ purpose: 1, ipAddress: 1 });

// Optional: identifier included for per-user throttling
ThrottleSchema.index({ purpose: 1, identifier: 1 });

// TTL index to auto-delete expired throttle records (optional)
ThrottleSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ==================== Schema Methods ====================

/**
 * Increment attempts and optionally set expiresAt
 * Default window: 15 minutes
 */
ThrottleSchema.methods.increment = function (attemptWindowMinutes = 15) {
  this.attempts += 1;
  if (!this.expiresAt || this.expiresAt < new Date()) {
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + attemptWindowMinutes);
    this.expiresAt = expires;
  }
};

/**
 * Check if currently blocked
 */
ThrottleSchema.methods.isBlocked = function (): boolean {
  return this.expiresAt ? this.expiresAt > new Date() : false;
};

/**
 * Reset attempts and expiresAt
 */
ThrottleSchema.methods.reset = function () {
  this.attempts = 0;
  this.expiresAt = undefined;
};