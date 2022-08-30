import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { Role } from 'prisma/prisma-client'

import { prisma } from 'lib/prisma'

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    // ...add more providers here
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 1 * 60 * 60, // 1 hour
  },
  pages: { error: '/auth/error' },

  callbacks: {
    // https://next-auth.js.org/configuration/callbacks#sign-in-callback
    // async signIn({ user }) {
    //   const isAllowedToSignIn = user.role === 'ADMIN'
    //   if (isAllowedToSignIn) {
    //     return true
    //   } else {
    //     // Return false to display a default error message
    //     return false
    //     // Or you can return a URL to redirect to:
    //     // return '/unauthorized'
    //   }
    // },

    // https://next-auth.js.org/tutorials/role-based-login-strategy
    async session({ session, token }) {
      if (token.role) session.user.role = token.role

      return session
    },

    async jwt({ token, user }) {
      if (user?.role) token.role = user.role as Role
      return token
    },
  },
}

export default NextAuth(authOptions)
