import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/db/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '@/lib/auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }
        try {
          const cleanUsername = credentials.username.trim();
          const usersList = await db.select().from(users).where(eq(users.username, cleanUsername)).limit(1);
          if (usersList.length === 0) {
            return null;
          }
          const user = usersList[0];
          const isPasswordValid = verifyPassword(credentials.password, user.passwordHash);
          if (!isPasswordValid) {
            return null;
          }
          return {
            id: String(user.id),
            name: user.username,
          };
        } catch (err) {
          console.error('NextAuth authorize error:', err);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = Number(user.id);
        token.username = user.name || '';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId || 0;
        session.user.username = token.username || '';
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'super-secret-key-change-this-in-production',
};
