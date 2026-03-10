import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/account_access",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isPublicRoute = publicRoutes.some(
    (route) =>
      pathname === route || pathname.startsWith(route + "/")
  );

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(
      new URL("/account_access?mode=login", req.url)
    );
  }

  if (pathname.startsWith("/user-type")) {
    if (token?.accountType === "workstation") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (token?.accountType === "user" && token.role) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|css|js|woff2?|ttf)).*)",
  ],
};
