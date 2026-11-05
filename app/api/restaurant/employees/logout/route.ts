import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const response = NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );

  const cookiesToRemove = [
    "serve_employee_session",
    "serve_employee_gerente",
    "serve_employee_garcom",
    "serve_employee_cozinha",
    "serve_employee_caixa",
  ];

  for (const cookieName of cookiesToRemove) {
    response.cookies.set(cookieName, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
      maxAge: 0,
    });
  }

  return response;
}