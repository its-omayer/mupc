import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/bash-mubc-bash')) {
    if (pathname === '/bash-mubc-bash/login') {
      if (token?.role === 'admin') {
        return NextResponse.redirect(new URL('/bash-mubc-bash', request.url))
      }
      return NextResponse.next()
    }
    if (!token || token.role !== 'admin') {
      return NextResponse.redirect(new URL('/bash-mubc-bash/login', request.url))
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(
        new URL(`/signin?callbackUrl=${encodeURIComponent(pathname)}`, request.url)
      )
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/admin')) {
    if (!token || token.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/dashboard')) {
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/bash-mubc-bash/:path*',
    '/dashboard/:path*',
    '/api/admin/:path*',
    '/api/dashboard/:path*',
  ],
}
