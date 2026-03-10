import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "../../../lib/db";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { email, password } = credentials;

        // USERS
        const [users]: any = await db.query(
          "SELECT * FROM users WHERE email = ? LIMIT 1",
          [email]
        );

        if (users.length) {
          const user = users[0];
          const ok = await bcrypt.compare(password, user.password);
          if (!ok) return null;

          return {
            id: user.id,
            role: user.user_type,
            accountType: "user",
            name: user.name,
            email: user.email,
          };
        }

        // WORKSTATION
        const [works]: any = await db.query(
          "SELECT * FROM workstation_accounts WHERE email = ? LIMIT 1",
          [email]
        );

        if (works.length) {
          const acc = works[0];
          const ok = await bcrypt.compare(password, acc.password);
          if (!ok) return null;

          return {
            id: acc.id,
            role: acc.account_type,
            accountType: "workstation",
            restaurantId: acc.restaurant_id,
            name: acc.account_type,
            email: acc.email,
          };
        }

        return null;
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accountType = user.accountType;
      }

      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }

      return token;
    },

    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.accountType = token.accountType;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
