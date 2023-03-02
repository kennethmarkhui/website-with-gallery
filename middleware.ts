import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized({ token }) {
      return token?.role === 'ADMIN'
    },
  },
})

export const config = {
  matcher: [
    '/gallery/admin',
    '/gallery/admin/create',
    '/gallery/admin/update/:path*',
  ],
}
