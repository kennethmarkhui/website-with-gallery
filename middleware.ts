import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })
  if (!token || token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/gallery', request.url))
  }
}

export const config = {
  matcher: ['/gallery/create', '/gallery/update/:path*'],
}
