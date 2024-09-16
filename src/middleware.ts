import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { withAuth } from 'next-auth/middleware'

import { i18n } from '@/i18n/config'

const publicPages = ['/', '/about', '/gallery', '/login', '/auth-error']

const intlMiddleware = createMiddleware(i18n)

const authMiddleware = withAuth(
  // Note that this callback is only invoked if
  // the `authorized` callback has returned `true`
  // and not for pages listed in `pages`.
  function middleware(req) {
    if (req.nextauth.token && req.nextauth.token.role !== 'ADMIN') {
      const url = new URL('/api/auth/error', req.nextUrl.origin)
      url.searchParams.append('error', 'AccessDenied')
      return NextResponse.redirect(url)
    }
    return intlMiddleware(req)
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token?.role,
    },
  }
)

export default function middleware(req: NextRequest) {
  const publicPathnameRegex = RegExp(
    `^(/(${i18n.locales.join('|')}))?(${publicPages
      .flatMap((p) => (p === '/' ? ['', '/'] : p))
      .join('|')})/?$`,
    'i'
  )
  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname)

  if (isPublicPage) {
    return intlMiddleware(req)
  } else {
    return (authMiddleware as any)(req)
  }
}

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
