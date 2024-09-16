import { NextRequest } from 'next/server'
import NextAuth from 'next-auth/next'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

import { i18n } from '@/i18n/config'
import { localizedAuthOptions } from '@/lib/auth'

// https://github.com/vercel/next.js/discussions/58852#discussioncomment-7658763
async function handler(req: NextRequest, res: any) {
  const languages = new Negotiator({
    headers: {
      'accept-language': req.headers.get('accept-language') ?? 'en',
    },
  }).languages(i18n.locales)
  const locale = match(languages, i18n.locales, i18n.defaultLocale)
  return await NextAuth(req, res, localizedAuthOptions(locale))
}

export { handler as GET, handler as POST }
