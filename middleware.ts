import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/app', '/dashboard'];
const authRoutes = ['/auth/login', '/auth/register'];
const publicRoutes = ['/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get('auth-token')?.value;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route)) && pathname === '/') {
    return NextResponse.next();
  }

  // Check if accessing protected routes without authentication
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!authToken) {
      const loginUrl = new URL('/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check if accessing auth routes while authenticated
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (authToken) {
      const dashboardUrl = new URL('/app/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
