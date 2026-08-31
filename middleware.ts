import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware — Route Protection for Urbn Furnish Admin
 * Runs on incoming requests. Redirects unauthenticated users to /auth/login.
 */

const PUBLIC_PATHS = ['/auth/login'];
const COOKIE_NAME = 'urbn_admin_token';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and internal static resources
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  // If no auth token is present, redirect to login page
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('from', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
