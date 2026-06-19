import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require auth
  const publicRoutes = ['/', '/login', '/register'];
  const isPublicRoute = publicRoutes.includes(pathname);
  
  const authToken = request.cookies.get('auth_token')?.value;
  const userRole = request.cookies.get('user_role')?.value as 'citizen' | 'responder' | 'admin' | undefined;
  
  // Function to get the correct dashboard URL for a role
  const getDashboardUrl = (role: string) => {
    switch (role) {
      case 'admin': return '/admin/dashboard';
      case 'responder': return '/responder/dashboard';
      default: return '/citizen/dashboard';
    }
  };
  
  // 1. Public route handling
  if (isPublicRoute) {
    if (authToken && userRole) {
      const dashboardUrl = getDashboardUrl(userRole);
      // Don't redirect if we're already going to the correct dashboard
      if (pathname !== dashboardUrl) {
        return NextResponse.redirect(new URL(dashboardUrl, request.url));
      }
    }
    // If no auth, let them access public routes
    return NextResponse.next();
  }
  
  // 2. Protected routes - need auth
  if (!authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If we have auth but no role, redirect to login (invalid state)
  if (!userRole) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // 3. Role-based route protection
  if (pathname.startsWith('/admin')) {
    if (userRole !== 'admin') {
      const dashboardUrl = getDashboardUrl(userRole);
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }
  } else if (pathname.startsWith('/responder')) {
    if (userRole !== 'responder' && userRole !== 'admin') {
      const dashboardUrl = getDashboardUrl(userRole);
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }
  } else if (pathname.startsWith('/citizen')) {
    // All roles can access citizen routes? Or only citizens?
    // Let's allow all authenticated users to access citizen routes
  }
  
  // Everything is okay!
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
