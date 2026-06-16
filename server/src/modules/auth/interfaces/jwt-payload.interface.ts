import type { Types } from 'mongoose';
import type { UserRole } from '../../../infrastructure/database/interface/user.interface';

/**
 * JWT payload structure
 * This is the data encoded in the JWT token
 */
export interface IJwtPayload {
  /**
   * User ID
   */
  userId: string | Types.ObjectId;

  /**
   * User email
   */
  email: string;

  /**
   * User role
   */
  role: UserRole;

  /**
   *  Session ID must be included in the payload to link the JWT to a specific session in the database.
   *  This allows us to manage sessions effectively (e.g., invalidate specific sessions, implement device-based security, etc.)
   */
  sid: string;

  /**
   * IP address of the client (optional, can be used for additional security checks)
   */
  ip?: string;

  /**
   * User agent string of the client (optional, can be used for additional security checks)
   */
  ua?: string;

  /**
   * Issued at timestamp (automatically added by JWT)
   */
  iat?: number;

  /**
   * Expiration timestamp (automatically added by JWT)
   */
  exp?: number;
}
