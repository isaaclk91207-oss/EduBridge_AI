import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const DEMO_TOKEN = 'DEMO_TOKEN_12345';

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

const authRoutes = ['/signup', '/auth', '/signin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('access_token')?.value;
  
  console.log('[Middleware] Path:', pathname, 'Token exists:', !!token);
  
  let isAuthenticated = false;
  if (token === DEMO_TOKEN) {
    isAuthenticated = true;
    console.log('[Middleware] Demo token detected');
  } else if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        isAuthenticated = !!payload.sub;
      }
    } catch (e) {
      isAuthenticated = false;
    }
  }

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL('/auth', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

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

