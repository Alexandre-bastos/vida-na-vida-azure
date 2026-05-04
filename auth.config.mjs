import Google from '@auth/core/providers/google';
import Credentials from '@auth/core/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from './src/lib/prisma.ts';
import { defineConfig } from 'auth-astro';
import bcrypt from 'bcryptjs';


export default defineConfig({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) return null;

        // Bloquear usuários inativos
        if (!user.active) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password, 
          user.password
        );

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          active: user.active,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.active = user.active;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.active = token.active;
      }
      return session;
    },
  },
  trustHost: true,
  session: {
    strategy: "jwt"
  },
  secret: process.env.AUTH_SECRET,
  debug: true
});
