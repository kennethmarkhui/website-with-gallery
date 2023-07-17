import { NextAuthOptions } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@next-auth/prisma-adapter'

import { LOCALES, DEFAULTLOCALE } from 'constants/i18n'
import { prisma } from 'lib/prisma'

type NextAuthOptionsWithLocale = (locale: string) => NextAuthOptions

export const authOptions = {
  adapter: PrismaAdapter(prisma),
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
    signIn: '/auth/signin',
    error: '/auth/error',
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
    LOCALES.includes(locale) && locale !== DEFAULTLOCALE ? '/' + locale : ''
  return {
    ...authOptions,
    pages: {
      signIn: `${localePrefix}/auth/signin`,
      error: `${localePrefix}/auth/error`,
    },
  }
}
