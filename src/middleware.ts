import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;

    // Lógica sencilla: Si hay token y va a "/", redirigir a /admin
    if (token && request.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/admin/:path*'],
};
