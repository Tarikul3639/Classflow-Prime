import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { StringValue } from 'ms';
import ms from 'ms';

import type { IJwtPayload } from '../../interfaces/jwt-payload.interface';
import type { ITokens } from './token.types';
import { User, UserDocument } from '../../../../database/entities/user.entity';
import { UserRole } from '../../../../database/interface/user.interface';
import {
  Session,
  SessionDocument,
} from '../../../../database/entities/session.entity';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
  ) { }

  private get jwtAccessTokenExpiresIn(): StringValue {
    return this.configService.get<StringValue>(
      'jwt.accessToken.expiresIn',
      '15m',
    );
  }

  private get jwtRefreshTokenExpiresIn(): StringValue {
    return this.configService.get<StringValue>(
      'jwt.refreshToken.expiresIn',
      '7d',
    );
  }

  private get maxSessionsPerUser(): number {
    return this.configService.get<number>('jwt.maxSessionsPerUser', 5);
  }

  /**
   * Generates Access and Refresh JWTs
   */
  async signTokens(payload: IJwtPayload): Promise<ITokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.jwtAccessTokenExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: this.jwtRefreshTokenExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * INFO: Initial SignIn: Generates tokens and manages session limit
   */
  async createSession(
    userId: string,
    email: string,
    role: UserRole,
    ip: string,
    ua: string,
  ): Promise<ITokens> {
    // 1) Create Session for session ID (sid) generation and device tracking
    const session = new this.sessionModel({
      userId: new Types.ObjectId(userId),
      ipAddress: ip,
      userAgent: ua,
      expiresAt: new Date(Date.now() + ms(this.jwtRefreshTokenExpiresIn)),
    });

    // 2) Prepare JWT payload with session ID (sid) and device info
    const payload: IJwtPayload = {
      userId,
      sid: session._id.toString(),
      email,
      role,
      ip,
      ua,
    };
    const tokens = await this.signTokens(payload);

    // Hash the refresh token before saving to database (Security)
    await session.setToken(tokens.refreshToken);
    await session.save();

    // Get User sessions with sorted by creation date (oldest first)
    const sessions = await this.sessionModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: 1 });
    // If user has reached max sessions, delete the oldest one
    if (sessions.length >= this.maxSessionsPerUser) {
      await sessions[0].deleteOne();
    }

    // DEBUG: Add near end of createSession method after session is saved:
    // console.log('[DEBUG session saved] session._id=', session._id, 'hashedToken=', session.token?.slice(0, 50));

    // Return tokens for client
    return tokens;
  }

  /**
   * INFO:Refreshes session: Implements Token Rotation and Reuse Detection
   */
  async refreshTokens(
    refreshToken: string,
    ip: string,
    ua: string,
  ): Promise<ITokens> {
    let payload: IJwtPayload;

    // 1️) Verify JWT Integrity
    try {
      payload = await this.jwtService.verifyAsync(refreshToken);
    } catch {
      throw new UnauthorizedException('Session expired or invalid');
    }

    // 2️) Load Session from DB using session ID (sid) from payload
    const currentSession = await this.sessionModel.findById(payload.sid);

    // If token is valid but not found in DB, it was likely already used (Theft attempt)
    if (!currentSession) {
      await this.sessionModel.deleteMany({
        userId: new Types.ObjectId(payload.userId),
      });
      throw new ForbiddenException(
        'Security Alert: Compromised session detected. All devices logged out.',
      );
    }

    // 3) Token Matching
    if (!(await currentSession.compareToken(refreshToken))) {
      throw new ForbiddenException('This session has been revoked.');
    }

    // Device Fingerprint Matching
    // Note: Some cases in User-Agent String minor changes so best option is trim/toLowerCase
    const normalizedUA = (ua || 'unknown-device').toLowerCase().trim();
    const storedUA =
      currentSession.userAgent?.trim().toLowerCase() || 'unknown-device';

    if (normalizedUA !== storedUA) {
      console.warn(
        `Device mismatch detected for user ${payload.userId}. Expected UA: ${storedUA}, Received UA: ${normalizedUA}`,
      );
      throw new ForbiddenException(
        'Device mismatch detected. Please sign in again.',
      );
    }

    // 4️) Check Expiration
    if (currentSession.isExpired()) {
      await currentSession.deleteOne();
      throw new UnauthorizedException('Session has expired');
    }

    // 5️) Rotation & Refresh
    const user = await this.userModel.findById(
      new Types.ObjectId(payload.userId),
    );
    if (!user) throw new UnauthorizedException('User no longer exists');

    const tokens = await this.signTokens({
      userId: user._id.toString(),
      sid: currentSession._id.toString(),
      email: user.email,
      role: user.role,
      ip: ip,
      ua: ua,
    });

    // 6️) Update Existing Session instead of creating a new one
    await currentSession.setToken(tokens.refreshToken);
    currentSession.ipAddress = ip; // Update IP in case of network switch
    currentSession.expiresAt = new Date(
      Date.now() + ms(this.jwtRefreshTokenExpiresIn),
    );
    await currentSession.save();

    // Return new tokens to client
    return tokens;
  }

  /**
   * Logs out a specific session
   */
  async revokeSession(refreshToken: string): Promise<void> {
    const payload = this.jwtService.decode(refreshToken) as IJwtPayload;
    const sessions = await this.sessionModel.find({
      userId: new Types.ObjectId(payload.userId),
    });

    for (const s of sessions) {
      if (await s.compareToken(refreshToken)) {
        await s.deleteOne();
        break;
      }
    }
  }
}
