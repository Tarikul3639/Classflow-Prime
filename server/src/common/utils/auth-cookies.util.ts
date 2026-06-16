import type { Response } from 'express';

export type IAuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const isProd = process.env.NODE_ENV === 'production';

// You can tune these durations based on your JWT config
const ACCESS_TOKEN_MAX_AGE_MS = 1000 * 60 * 15; // 15 minutes
const REFRESH_TOKEN_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

/**
 * Set auth tokens in HTTP-only cookies.
 * This is used to store tokens securely on the client side.
 */
export function setAuthCookies(res: Response, tokens: IAuthTokens) {
  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
  });

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  });
}

/**
 * Clear auth cookies to log out the user.
 */
export function clearAuthCookies(res: Response) {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  });
}

/**
 * Get access token from cookies.
 * This is used to read the access token on the server side (e.g. in guards).
 * Returns null if the access token is not found.
 */
export function getAccessTokenFromCookies(req: {
  cookies?: Record<string, string>;
}): string | null {
  return req.cookies?.accessToken || null;
}

/**
 * Get refresh token from cookies.
 * This is used to read the refresh token on the server side (e.g. in guards).
 * Returns null if the refresh token is not found.
 */
export function getRefreshTokenFromCookies(req: {
  cookies?: Record<string, string>;
}): string | null {
  return req.cookies?.refreshToken || null;
}

/**
 * Get auth tokens from cookies.
 * This is used to read tokens on the server side (e.g. in guards).
 * Returns null if tokens are not found.
 */
export function getAuthTokensFromCookies(req: {
  cookies?: Record<string, string>;
}): IAuthTokens | null {
  const accessToken = req.cookies?.accessToken;
  const refreshToken = req.cookies?.refreshToken;
  if (accessToken && refreshToken) {
    return { accessToken, refreshToken };
  }
  return null;
}
