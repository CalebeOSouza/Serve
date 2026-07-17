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
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Senha",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { email, password } = credentials;

        // =========================
        // USERS (ADMIN PRINCIPAL)
        // =========================

        const [users]: any = await db.query(
          "SELECT * FROM users WHERE email = ? LIMIT 1",
          [email]
        );

        if (users.length) {
          const user = users[0];

          const passwordMatch = await bcrypt.compare(
            password,
            user.password
          );

          if (!passwordMatch) {
            return null;
          }

          return {
            id: String(user.id),

            name: user.name,
            email: user.email,

            role: "admin",

            accountType: "user",
          };
        }

        // =========================
        // ROLES (CONTAS OPERACIONAIS)
        // =========================

        const [roles]: any = await db.query(
          "SELECT * FROM roles WHERE username = ? LIMIT 1",
          [email]
        );

        if (roles.length) {
          const role = roles[0];

          const passwordMatch = await bcrypt.compare(
            password,
            role.password
          );

          if (!passwordMatch) {
            return null;
          }

          return {
            id: String(role.id),

            name: role.type,
            email: role.username,

            role: role.type,

            restaurantId: role.restaurant_id,

            accountType: "role",
          };
        }

        return null;
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;

        token.role = user.role;

        token.accountType = user.accountType;

        token.restaurantId = user.restaurantId || null;
      }

      return token;
    },

    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;

        session.user.role = token.role;

        session.user.accountType = token.accountType;

        session.user.restaurantId = token.restaurantId;
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };