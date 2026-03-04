import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const authCookie = request.cookies.get('bhiksha_auth')
    const { pathname } = request.nextUrl

    // Allow static assets, api routes, Next.js internals, and login page
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname === '/login' ||
        pathname === '/manifest.ts' ||
        pathname.match(/\.(png|svg|ico|jpg|jpeg)$/)
    ) {
        return NextResponse.next()
    }

    // Require auth cookie
    if (!authCookie || authCookie.value !== 'true') {
        const loginUrl = new URL('/login', request.url)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
}
