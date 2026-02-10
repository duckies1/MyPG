import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token');
  
  // Protected routes - require authentication
  const protectedPaths = ['/pg', '/tenants', '/rooms'];
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));
  
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Note: Role-based access (blocking tenants from /pg) is handled client-side
  // via AuthApi.getStatus() check in the page components
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/pg/:path*', '/tenants/:path*', '/rooms/:path*']
};
