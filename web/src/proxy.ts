import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { isAuthRoute } from './lib/auth/route-access';

function isProtectedPath(pathname: string) {
  // public sections
  if (pathname === '/') return true;

  // explicitly protected sections
  return (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/classes') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/agents')
  );
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const auth = isAuthRoute(pathname);
  const protectedRoute = isProtectedPath(pathname);

  // only enforce on auth + protected
  if (!auth && !protectedRoute) return NextResponse.next();

  const refreshToken = req.cookies.get('refreshToken')?.value;

  // not logged in -> block protected
  if (!refreshToken && protectedRoute) {
    const url = req.nextUrl.clone();
    url.pathname = '/sign-in';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // logged in -> block auth pages
  if (refreshToken && auth) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/', // dashboard
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/dashboard/:path*',
    '/classes/:path*',
    '/profile/:path*',
    '/notifications/:path*',
    '/agents/:path*',
  ],
};