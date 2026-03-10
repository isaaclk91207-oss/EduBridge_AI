import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/dashboard/courses',
  '/dashboard/ai-roadmap',
  '/dashboard/ai-interview',
  '/dashboard/ai-portfolio',
  '/dashboard/ai-path',
  '/dashboard/practice',
  '/dashboard/assignments',
  '/dashboard/career',
  '/dashboard/messages',
  '/dashboard/settings',
  '/dashboard/employer',
];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/signup', '/auth', '/auth/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth token - check multiple cookie names (access_token is set by FastAPI)
  const token = request.cookies.get('access_token')?.value || request.cookies.get('auth-token')?.value;
  
  // Simple token verification - JWT payload has "sub" field
  let isAuthenticated = false;
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        isAuthenticated = !!payload.sub;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // Check if trying to access protected routes
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Check if trying to access auth routes (when already authenticated)
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Redirect to signin if accessing protected route without auth
  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect to dashboard if accessing auth routes while authenticated
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/signin',
    '/signup',
    '/auth',
  ],
};
