import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

type EmployeeRole = "gerente" | "garcom" | "cozinha" | "caixa";

const employeeRoles: EmployeeRole[] = [
  "gerente",
  "garcom",
  "cozinha",
  "caixa",
];

const publicRoutes = [
  "/login",
  "/register",
  "/account_access",
];

function isPublicRoute(pathname: string) {
  return publicRoutes.some(
    (route) =>
      pathname === route || pathname.startsWith(`${route}/`)
  );
}

function getRoleFromPath(pathname: string): EmployeeRole | null {
  const match = pathname.match(/^\/roles\/([^/]+)/);

  if (!match) {
    return null;
  }

  const role = match[1] as EmployeeRole;

  return employeeRoles.includes(role) ? role : null;
}

function getEmployeeHome(
  role: EmployeeRole,
  restaurantId: number
) {
  const paths = {
    gerente: `/roles/gerente/dashboard/${restaurantId}/funcionarios`,
    garcom: `/roles/garcom/dashboard/${restaurantId}/salao`,
    cozinha: `/roles/cozinha/dashboard/${restaurantId}/pedidos`,
    caixa: `/roles/caixa/dashboard/${restaurantId}/painel_caixa`,
  };

  return paths[role];
}

function getAdminHome() {
  return "/admin/my-restaurants";
}

async function verifyEmployeeSession(req: NextRequest) {
  const token = req.cookies.get("serve_employee_session")?.value;

  if (!token) {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 5) {
    return null;
  }

  const [
    employeeId,
    restaurantId,
    role,
    expiresAt,
    signature,
  ] = parts;

  if (
    !employeeId ||
    !restaurantId ||
    !role ||
    !expiresAt ||
    !signature
  ) {
    return null;
  }

  if (!employeeRoles.includes(role as EmployeeRole)) {
    return null;
  }

  const expiresAtNumber = Number(expiresAt);

  if (
    !Number.isFinite(expiresAtNumber) ||
    expiresAtNumber < Date.now()
  ) {
    return null;
  }

  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    return null;
  }

  const payload = `${employeeId}.${restaurantId}.${role}.${expiresAt}`;

  const encoder = new TextEncoder();

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(payload)
  );

  const expectedSignature = Array.from(
    new Uint8Array(signatureBuffer)
  )
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  if (signature !== expectedSignature) {
    return null;
  }

  const employeeIdNumber = Number(employeeId);
  const restaurantIdNumber = Number(restaurantId);

  if (
    !Number.isInteger(employeeIdNumber) ||
    !Number.isInteger(restaurantIdNumber)
  ) {
    return null;
  }

  return {
    employeeId: employeeIdNumber,
    restaurantId: restaurantIdNumber,
    role: role as EmployeeRole,
  };
}

function clearEmployeeCookies(response: NextResponse) {
  const oldCookies = [
    "serve_employee_gerente",
    "serve_employee_garcom",
    "serve_employee_cozinha",
    "serve_employee_caixa",
    "serve_employee_session",
  ];

  for (const cookieName of oldCookies) {
    response.cookies.set(cookieName, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      maxAge: 0,
      path: "/",
    });
  }

  return response;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/") {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const employeeSession = await verifyEmployeeSession(req);

  if (isPublicRoute(pathname)) {
    if (token || employeeSession) {
      if (
        token?.accountType === "user" &&
        token.role === "admin"
      ) {
        return NextResponse.redirect(
          new URL(getAdminHome(), req.url)
        );
      }

      if (
        token?.accountType === "role" &&
        employeeRoles.includes(token.role as EmployeeRole) &&
        token.restaurantId
      ) {
        return NextResponse.redirect(
          new URL(
            getEmployeeHome(
              token.role as EmployeeRole,
              Number(token.restaurantId)
            ),
            req.url
          )
        );
      }

      if (employeeSession) {
        return NextResponse.redirect(
          new URL(
            getEmployeeHome(
              employeeSession.role,
              employeeSession.restaurantId
            ),
            req.url
          )
        );
      }
    }

    return NextResponse.next();
  }

  if (!token && !employeeSession) {
    return NextResponse.redirect(
      new URL("/account_access?mode=login", req.url)
    );
  }

  if (pathname.startsWith("/admin")) {
    if (
      token?.accountType !== "user" ||
      token.role !== "admin"
    ) {
      if (employeeSession) {
        return NextResponse.redirect(
          new URL(
            getEmployeeHome(
              employeeSession.role,
              employeeSession.restaurantId
            ),
            req.url
          )
        );
      }

      return NextResponse.redirect(
        new URL("/", req.url)
      );
    }

    return NextResponse.next();
  }

  const requestedRole = getRoleFromPath(pathname);

  if (requestedRole) {

    if (token?.accountType === "role") {
      if (token.role === requestedRole) {
        return NextResponse.next();
      }

      if (
        employeeRoles.includes(token.role as EmployeeRole) &&
        token.restaurantId
      ) {
        return NextResponse.redirect(
          new URL(
            getEmployeeHome(
              token.role as EmployeeRole,
              Number(token.restaurantId)
            ),
            req.url
          )
        );
      }

      return NextResponse.redirect(
        new URL("/", req.url)
      );
    }

    if (employeeSession) {

      if (employeeSession.role === requestedRole) {
        return NextResponse.next();
      }

      return NextResponse.redirect(
        new URL(
          getEmployeeHome(
            employeeSession.role,
            employeeSession.restaurantId
          ),
          req.url
        )
      );
    }

    if (
      token?.accountType === "user" &&
      token.role === "admin"
    ) {
      return NextResponse.redirect(
        new URL(getAdminHome(), req.url)
      );
    }

    return NextResponse.redirect(
      new URL("/", req.url)
    );
  }

  if (pathname.startsWith("/user-type")) {
    if (token?.accountType === "user") {
      return NextResponse.redirect(
        new URL(getAdminHome(), req.url)
      );
    }

    if (
      token?.accountType === "role" &&
      employeeRoles.includes(token.role as EmployeeRole) &&
      token.restaurantId
    ) {
      return NextResponse.redirect(
        new URL(
          getEmployeeHome(
            token.role as EmployeeRole,
            Number(token.restaurantId)
          ),
          req.url
        )
      );
    }

    if (employeeSession) {
      return NextResponse.redirect(
        new URL(
          getEmployeeHome(
            employeeSession.role,
            employeeSession.restaurantId
          ),
          req.url
        )
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|css|js|woff2?|ttf)).*)",
  ],
};