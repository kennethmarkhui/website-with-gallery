import { NextApiRequest, NextApiResponse } from 'next'
import NextAuth from 'next-auth'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

import { LOCALES, DEFAULTLOCALE } from 'constants/i18n'
import { localizedAuthOptions } from 'lib/auth'

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const languages = new Negotiator({ headers: req.headers }).languages(LOCALES)
  const locale = match(languages, LOCALES, DEFAULTLOCALE)
  return await NextAuth(req, res, localizedAuthOptions(locale))
}
