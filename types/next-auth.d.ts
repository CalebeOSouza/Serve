import NextAuth from "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    accountType: "user" | "workstation";
  }

  interface Session {
    user: {
      id: string;
      role: string;
      accountType: "user" | "workstation";

    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    accountType: "user" | "workstation";
  }
}
