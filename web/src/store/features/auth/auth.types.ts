// ------------------------------------------
// Domain models
// ------------------------------------------

export type ITokens = {
  accessToken: string;
  refreshToken: string;
};

// ------------------------------------------
// Requests (DTO-like)
// ------------------------------------------

export type ISignUpRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  avatarUrl?: string;
};

// ------------------------------------------
// State & slice types
// ------------------------------------------

/**
 * Generic request status for async thunks.
 */
export interface IRequestStatus {
  loading: boolean;
  error: string | null;
  message: string | null;
}

/**
 * One status object per thunk (recommended).
 */
export interface IAuthStatusState {
  // Auth session
  signIn: IRequestStatus;
  me: IRequestStatus;
  signoutCurrent: IRequestStatus;
  signoutAll: IRequestStatus;

  // Signup flow
  signup: IRequestStatus;
  verifySignupEmail: IRequestStatus;
  resendSignupVerification: IRequestStatus;

  // Password reset flow
  requestPasswordReset: IRequestStatus;
  verifyCodePasswordReset: IRequestStatus;
  resendCodePasswordReset: IRequestStatus;
  confirmNewPasswordPasswordReset: IRequestStatus;
}