import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;

    role: string;

    accountType: "user" | "role";

    restaurantId?: number | null;
  }

  interface Session {
    user: {
      id: string;

      role: string;

      accountType: "user" | "role";

      restaurantId?: number | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;

    role: string;

    accountType: "user" | "role";

    restaurantId?: number | null;
  }
}