import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    if (req.nextauth.token && req.nextauth.token.role !== 'ADMIN') {
      const url = new URL('/api/auth/error', req.nextUrl.origin)
      url.searchParams.append('error', 'AccessDenied')
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ token }) {
        return !!token?.role
      },
    },
  }
)

export const config = {
  matcher: [
    '/gallery/admin',
    '/gallery/admin/create',
    '/gallery/admin/update/:path*',
  ],
}
