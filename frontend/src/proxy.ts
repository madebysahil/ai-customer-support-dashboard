import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // Simple check for the existence of the refreshToken HttpOnly cookie
  const refreshToken = request.cookies.get('refreshToken')
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/login')
  
  // If trying to access protected route without token, redirect to login
  if (!refreshToken && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // If trying to access login while already authenticated, redirect to dashboard
  if (refreshToken && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// Apply this middleware only to standard dashboard routes and auth routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/customers/:path*',
    '/chats/:path*',
    '/tickets/:path*',
    '/analytics/:path*',
    '/knowledge/:path*',
    '/notifications/:path*',
    '/settings/:path*',
    '/login'
  ]
}
