import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    // Super admin routes
    if (pathname.startsWith('/admin')) {
      if (!(token?.isSuperAdmin || token?.role === 'SUPER_ADMIN')) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Admin API routes
    if (pathname.startsWith('/api/admin')) {
      if (!(token?.isSuperAdmin || token?.role === 'SUPER_ADMIN')) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Dashboard routes - require authentication
    if (pathname.startsWith('/dashboard')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Public routes that don't require auth
        if (pathname === '/' || 
            pathname.startsWith('/auth/') || 
            pathname.startsWith('/api/auth/') ||
            pathname.startsWith('/api/forms/public/') ||
            pathname.startsWith('/api/embed/') ||
            pathname.startsWith('/embed/')) {
          return true;
        }

        // Protected routes require token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/forms/:path*',
    '/api/contacts/:path*',
    '/api/deals/:path*',
    '/api/companies/:path*',
    '/api/plan/:path*'
  ]
};
