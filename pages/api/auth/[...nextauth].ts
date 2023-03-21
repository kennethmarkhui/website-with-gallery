import NextAuth, { NextAuthOptions } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@next-auth/prisma-adapter'

import { prisma } from 'lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // Configure one or more authentication providers
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      maxAge: 1 * 60 * 60, // 1 hour
    }),
    // ...add more providers here
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 1 * 60 * 60, // 1 hour
  },
  // pages: { error: '/auth/error' },

  callbacks: {
    // https://next-auth.js.org/configuration/callbacks#sign-in-callback
    async signIn({ user, email }) {
      // send email verification first
      if (email?.verificationRequest) {
        return true
      }
      // then check if role is admin after user clicked the link in email
      const isAllowedToSignIn = user.role === 'ADMIN'
      if (isAllowedToSignIn) {
        return true
      } else {
        // Return false to display a default error message
        return false
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
      }
    },

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
}

export default NextAuth(authOptions)
