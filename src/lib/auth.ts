import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next'
import { getServerSession, NextAuthOptions } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@next-auth/prisma-adapter'

import { i18n } from '@/i18n/config'
import { db } from '@/lib/db'

type NextAuthOptionsWithLocale = (locale: string) => NextAuthOptions

export const authOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      maxAge: 1 * 60 * 60, // 1 hour
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 1 * 60 * 60, // 1 hour
  },
  pages: {
    signIn: '/login',
    error: '/auth-error',
  },

  callbacks: {
    // https://next-auth.js.org/tutorials/role-based-login-strategy
    async session({ session, token }) {
      if (token.role) session.user.role = token.role
      return session
    },
    async jwt({ token, user }) {
      if (user?.role) token.role = user.role
      return token
    },
  },
} satisfies NextAuthOptions

export const localizedAuthOptions: NextAuthOptionsWithLocale = (locale) => {
  const localePrefix =
    i18n.locales.includes(locale) && locale !== i18n.defaultLocale
      ? '/' + locale
      : ''
  return {
    ...authOptions,
    pages: {
      signIn: `${localePrefix}/login`,
      error: `${localePrefix}/auth-error`,
    },
  }
}

// https://next-auth.js.org/configuration/nextjs#getserversession
export function getServerAuth(
  ...args:
    | [GetServerSidePropsContext['req'], GetServerSidePropsContext['res']]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authOptions)
}
