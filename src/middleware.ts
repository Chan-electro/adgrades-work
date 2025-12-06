// Trigger rebuild
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const currentUser = request.cookies.get('session')?.value;
    const session = currentUser ? await decrypt(currentUser) : null;

    // Public paths that don't require authentication
    const isPublicPath =
        request.nextUrl.pathname === '/' ||
        request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/api/auth') ||
        request.nextUrl.pathname.startsWith('/book') || // Public booking pages
        request.nextUrl.pathname.startsWith('/api/scheduler/availability') || // Public API for booking
        request.nextUrl.pathname.startsWith('/api/scheduler/book'); // Public booking API

    // If not authenticated and trying to access protected route
    if (!session && !isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If authenticated and trying to access login page, redirect to dashboard
    if (session && request.nextUrl.pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files with extensions: png, jpg, jpeg, svg, gif, webp
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.gif$|.*\\.webp$).*)',
    ],
};
