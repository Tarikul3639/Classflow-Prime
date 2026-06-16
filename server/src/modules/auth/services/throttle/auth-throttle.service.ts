import {
  Injectable,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Throttle,
  ThrottleDocument,
} from '../../../../infrastructure/database/entities/throttle.entity';
import { ThrottlePurpose } from '../../../../infrastructure/database/interface/throttle.interface';

@Injectable()
export class AuthThrottleService {
  constructor(
    @InjectModel(Throttle.name)
    private readonly throttleModel: Model<ThrottleDocument>,
  ) {}

  /**
   * Internal helper to fetch or create the throttle record
   */
  private async getOrCreate(params: {
    key: string;
    ip: string;
    purpose: ThrottlePurpose;
    userAgent?: string;
  }): Promise<ThrottleDocument> {
    const { key, ip, purpose, userAgent } = params;

    const doc = await this.throttleModel.findOneAndUpdate(
      { identifier: key, ipAddress: ip, purpose },
      {
        $setOnInsert: { identifier: key, ipAddress: ip, purpose, attempts: 0 },
        $set: { userAgent: userAgent ?? 'unknown' },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
    );

    if (!doc)
      throw new InternalServerErrorException('Could not sync throttle state');
    return doc;
  }

  /**
   * logic replaced doc.assertNotLocked()
   */
  async assertNotLocked(params: {
    key: string;
    ip: string;
    purpose: ThrottlePurpose;
    userAgent?: string;
  }): Promise<ThrottleDocument> {
    const doc = await this.getOrCreate(params);

    // Manual check instead of entity method
    if (doc.expiresAt && doc.expiresAt > new Date()) {
      const diffInMs = doc.expiresAt.getTime() - Date.now();
      const diffInMinutes = Math.ceil(diffInMs / 1000 / 60);

      throw new ForbiddenException(
        `Too many attempts. Please try again in ${diffInMinutes} minute(s).`,
      );
    }

    // If locked but expired, reset attempts and expiresAt
    if (doc.expiresAt && doc.expiresAt <= new Date()) {
      doc.attempts = 0;
      doc.expiresAt = undefined;
      await doc.save();
    }

    return doc;
  }

  /**
   * logic replaced doc.recordFailure()
   */
  async fail(
    doc: ThrottleDocument,
    opts: { maxAttempts: number; lockMinutes: number },
  ) {
    doc.attempts += 1;

    if (doc.attempts >= opts.maxAttempts) {
      const lockTime = new Date();
      lockTime.setMinutes(lockTime.getMinutes() + opts.lockMinutes);
      doc.expiresAt = lockTime;
    }

    await doc.save();
  }

  /**
   * logic replaced doc.recordSuccess()
   */
  async success(doc: ThrottleDocument) {
    doc.attempts = 0;
    doc.expiresAt = undefined;
    await doc.save();
  }
}
