import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // Cross-domain cookies (Render vs Vercel) cannot be read by Vercel's Edge Middleware.
  // We rely entirely on client-side protection (RequireAuth) and API-level protection.
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
