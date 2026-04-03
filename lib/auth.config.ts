import type { NextAuthConfig } from 'next-auth'

// Edge-compatible config — no Prisma, no bcrypt
// Used by middleware.ts (edge runtime)
export const authConfig = {
  pages: { signIn: '/login' },
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
} satisfies NextAuthConfig
