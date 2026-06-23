import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient, getErrorMessage } from "@/api/axios";
import type { IUser } from '../../profile/profile.types'

/**
 * Signup thunk with client-side validation. Adjust validation rules as needed.
 * Note: Client-side validation is for better UX, but always validate on the server as well for security.
 * The payload includes firstName, lastName (optional), avatarUrl (optional) to allow for richer user profiles.
 * Adjust the payload and response types based on your backend API.
 */

export interface ISignUpResponse {
  success: boolean;
  message: string;
  data: {
    user: IUser;
  };
}

export type ISignUpRequest = {
  email: string;
  password: string;
  name: string;
  avatarUrl?: string;
};

export const signupThunk = createAsyncThunk<
  ISignUpResponse,
  ISignUpRequest,
  { rejectValue: string }
>("auth/signup", async (payload, { rejectWithValue }) => {
  // client-side validation inside thunk
  if (payload.name.trim().length < 2) {
    return rejectWithValue("Name must be at least 2 characters");
  }

  if (!payload.password || payload.password.length < 6) {
    return rejectWithValue("Password must be at least 6 characters");
  }

  if (!payload.email || !/\S+@\S+\.\S+/.test(payload.email)) {
    return rejectWithValue("Invalid email address");
  }

  try {
    const { data } = await apiClient.post<ISignUpResponse>(
      "/auth/signup",
      payload,
    );
    if (!data.success) {
      return rejectWithValue(data.message || "Signup failed");
    }
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/**
 * Additional thunks for email verification and resending verification code.
 * Adjust endpoints and payloads as needed based on your backend API.
 * Note: For security, the backend should handle verification and resending logic carefully to prevent abuse (e.g., rate limiting, not revealing if an email is registered or not, etc.).
 */

export interface IEmailVerifyRequest {
  email: string;
  code: string;
}
export interface IEmailVerifyResponse {
  success: boolean;
  message: string;
  data?: {
    user?: IUser;
  }
}

export const verifySignupEmailThunk = createAsyncThunk<
  IEmailVerifyResponse,
  IEmailVerifyRequest,
  { rejectValue: string }
>("auth/signupVerify", async (payload, { rejectWithValue }) => {
  try {
    // console.log(payload);
    const { data } = await apiClient.post<IEmailVerifyResponse>(
      "/auth/signup/verify",
      payload,
    );

    if (!data.success) {
      return rejectWithValue(data.message || "Verification failed");
    }
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/**
 * Resend verification code thunk. Adjust endpoint and payload as needed.
 * Note: For security, you might want to implement rate limiting on the backend for this endpoint.
 * The payload only requires the email, and the backend should handle sending the code if the email exists and is not already verified.
 * */
export interface IResendVerificationRequest {
  email: string;
}
export interface IResendVerificationResponse {
  success: boolean;
  message: string;
}

export const resendSignupVerificationThunk = createAsyncThunk<
  IResendVerificationResponse,
  IResendVerificationRequest,
  { rejectValue: string }
>("auth/signupResend", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post<IResendVerificationResponse>(
      "/auth/signup/resend",
      payload,
    );
    if (!data.success) {
      return rejectWithValue(data.message || "Resend failed");
    }
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});
